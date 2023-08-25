import { act, render, screen } from '@testing-library/react'
import { createAtomsContext } from '~/react/index.js'
import { atom, getDefaultStore } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import userEvent from '@testing-library/user-event'

import { setStore } from '~/index.js'

describe('createAtomsContext', () => {
  setStore(getDefaultStore())
  const context = createAtomsContext(
    {
      a: atom(0),
    },
    (ctx) => {
      const { atoms, get, set } = ctx
      return {
        increment: () => {
          set(atoms.a, (current) => current + 1)
        },
      }
    },
  )

  const [Provider, hooks] = context
  const [useContextAtoms, useStoreValue, useContextActions] = hooks

  // const [useContextAtoms, useStoreValue, useContextActions] = hooks
  // const { a } = useContextAtoms()
  // useContextActions()
  // useStoreValue('a')
  //

  const App: FC<PropsWithChildren> = (props) => {
    const aNumber = useStoreValue('a')
    return (
      <Provider>
        <div data-testid="a">{aNumber}</div>
        {props.children}
      </Provider>
    )
  }

  it('should render', () => {
    render(<App />)

    expect(screen.getByTestId('a')).toHaveTextContent('0')
  })

  it('should increment', async () => {
    const IncButton = () => {
      // const [count, setCount] = useState(2)
      const plusA = useContextActions().increment
      const inc = () => {
        // setCount((current) => current + 1)
        plusA()
      }
      return (
        <button onClick={inc} data-testid="inc">
          inc
        </button>
      )
    }
    render(
      <App>
        <IncButton />
      </App>,
    )

    await userEvent.click(screen.getByTestId('inc'))
    act(() => {
      expect(screen.getByTestId('a')).toHaveTextContent('1')
    })
  })
})
// const context = createAtomsContext(
//   {
//     a: atom(0),
//   },
//   (ctx) => {
//     const { atoms, get, set } = ctx
//     return {
//       increment: () => {
//         set(atoms.a, (current) => current + 1)
//       },
//     }
//   },
// )
// const [Provider, hooks, utils] = context
//
// const [useContextAtoms, useStoreValue, useContextActions] = hooks
// const { a } = useContextAtoms()
// useContextActions()
// useStoreValue('a')
// createOverrideAtomsContext(context, {
//   a: atom(1),
// })
