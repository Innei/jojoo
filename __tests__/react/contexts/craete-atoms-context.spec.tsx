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
      const { atoms, get, set } = ctx
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
    act(() => {
      expect(screen.getByTestId('a')).toHaveTextContent('1')
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
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

    act(() => {
      expect(screen.getByTestId('a')).toHaveTextContent('0')
      expect(screen.getByTestId('oa')).toHaveTextContent('-100')
    })

    await userEvent.click(screen.getByTestId('inc'))
    act(() => {
      expect(screen.getByTestId('a')).toHaveTextContent('0')
      expect(screen.getByTestId('oa')).toHaveTextContent('-99')
    })

    function Child() {
      const a = useAtomValue(useContextAtoms().aAtom)
      return <div data-testid="oa">{a}</div>
    }
  })
})
