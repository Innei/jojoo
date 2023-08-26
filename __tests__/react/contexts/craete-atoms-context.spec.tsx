import { act, render, screen } from '@testing-library/react'
import {
  createAtomsContext,
  createOverrideAtomsContext,
} from '~/react/index.js'
import { atom, getDefaultStore, useAtomValue } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import userEvent from '@testing-library/user-event'

import { setStore } from '~/index.js'

describe('createAtomsContext', () => {
  setStore(getDefaultStore())

  const createTestingModule = () => {
    const globalAtoms = {
      aAtom: atom(0),
      bAtom: atom(false),
    }

    const context = createAtomsContext(globalAtoms, (ctx) => {
      const { atoms, set } = ctx
      return {
        increment: () => {
          set(atoms.aAtom, (current) => current + 1)
        },
      }
    })

    const [Provider, hooks] = context
    const [useContextAtoms, useStoreValue, useContextActions] = hooks

    const App: FC<PropsWithChildren> = (props) => {
      const aNumber = useStoreValue('aAtom')
      return (
        <Provider>
          <div data-testid="a">{aNumber}</div>
          {props.children}
        </Provider>
      )
    }

    const IncButton = () => {
      const plusA = useContextActions().increment
      const inc = () => {
        plusA()
      }

      const aC = useAtomValue(useContextAtoms().aAtom)
      return (
        <button onClick={inc} data-testid="inc">
          inc
          <span data-testid="count">{aC}</span>
        </button>
      )
    }

    return {
      App,
      IncButton,

      useContextAtoms,
      useStoreValue,
      useContextActions,

      globalAtoms,

      hooks,
      context,
    }
  }

  it('should render', () => {
    const { App } = createTestingModule()
    render(<App />)

    expect(screen.getByTestId('a')).toHaveTextContent('0')
  })

  it('should increment', async () => {
    const { App, IncButton } = createTestingModule()
    render(
      <App>
        <IncButton />
      </App>,
    )

    await userEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('a')).toHaveTextContent('1')
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('overrideAtom should work', async () => {
    const { App, context, useContextAtoms, IncButton } = createTestingModule()
    const OverrideProvider = createOverrideAtomsContext(context, {
      aAtom: atom(-100),
    })

    render(
      <App>
        <OverrideProvider>
          <Child />

          <IncButton />
        </OverrideProvider>
      </App>,
    )

    expect(screen.getByTestId('a')).toHaveTextContent('0')
    expect(screen.getByTestId('oa')).toHaveTextContent('-100')

    await userEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('a')).toHaveTextContent('0')
    expect(screen.getByTestId('oa')).toHaveTextContent('-99')

    function Child() {
      const a = useAtomValue(useContextAtoms().aAtom)
      return <div data-testid="oa">{a}</div>
    }
  })

  it('exposed actions should work', async () => {
    const { App, context } = createTestingModule()

    render(<App />)

    const [, , , actions] = context
    const { increment } = actions

    act(() => {
      increment()
    })

    expect(screen.getByTestId('a')).toHaveTextContent('1')
  })
})

describe('real world testing (PageStore)', async () => {
  setStore(getDefaultStore())

  const createTestingModule = () => {
    const context = createAtomsContext(
      {
        postId: atom('0'),
        text: atom('global post text'),
      },
      ({ atoms, set }) => {
        return {
          setText: (text: string) => {
            set(atoms.text, text)
          },
        }
      },
    )

    const [GlobalDataProvider, [useAtoms, useDataValue, useDataActions]] =
      context
    const OverrideProvider = createOverrideAtomsContext(context, {
      text: atom('override post text'),
      postId: atom('1'),
    })

    const DataRender: FC<{
      testId?: string
    }> = ({ testId }) => {
      const text = useDataValue('text')
      const id = useDataValue('postId')
      return (
        <div>
          <p>
            Data Id:
            <span data-testid={`${testId}-data-id`}>{id}</span>
          </p>

          <p>
            Data Text:
            <span data-testid={`${testId}-data-text`}>{text}</span>
          </p>
        </div>
      )
    }

    const DataActions: FC<{
      testId?: string
    }> = (props) => {
      const { testId } = props
      const { setText } = useDataActions()
      const text = useDataValue('text')
      return (
        <div>
          <button
            data-testid={`${testId}-update`}
            onClick={() => setText(`${text} updated`)}
          ></button>
        </div>
      )
    }

    render(
      <GlobalDataProvider>
        <DataRender testId="global" />
        <DataActions testId="global" />

        <OverrideProvider>
          <DataRender testId="scope" />
          <DataActions testId="scope" />
        </OverrideProvider>
      </GlobalDataProvider>,
    )

    return {
      useAtoms,
      useDataValue,
      useDataActions,
    }
  }

  it('should render', () => {
    createTestingModule()
    expect(screen.getByTestId('global-data-id')).toHaveTextContent('0')
    expect(screen.getByTestId('global-data-text')).toHaveTextContent(
      'global post text',
    )

    expect(screen.getByTestId('scope-data-id')).toHaveTextContent('1')
    expect(screen.getByTestId('scope-data-text')).toHaveTextContent(
      'override post text',
    )
  })

  it('update scoped text but not global', async () => {
    createTestingModule()

    await userEvent.click(screen.getByTestId('scope-update'))

    expect(screen.getByTestId('global-data-text')).toHaveTextContent(
      'global post text',
    )
    expect(screen.getByTestId('scope-data-text')).toHaveTextContent(
      'override post text updated',
    )
  })

  it('update global text', async () => {
    createTestingModule()

    await userEvent.click(screen.getByTestId('global-update'))

    expect(screen.getByTestId('global-data-text')).toHaveTextContent(
      'global post text updated',
    )
    expect(screen.getByTestId('scope-data-text')).toHaveTextContent(
      'override post text',
    )
  })
})
