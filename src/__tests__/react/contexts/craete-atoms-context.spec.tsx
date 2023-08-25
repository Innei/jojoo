import { render, screen } from '@testing-library/react'
import { createAtomsContext } from '~/react/index.js'
import React from 'react'
import { atom } from 'jotai'

describe('createAtomsContext', () => {
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

  const App = () => {
    const aNumber = useStoreValue('a')
    return (
      <Provider>
        <div data-testid="a">{aNumber}</div>
      </Provider>
    )
  }

  it('should render', () => {
    render(<App />)

    expect(screen.getByTestId('a')).toEqual('0')
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
