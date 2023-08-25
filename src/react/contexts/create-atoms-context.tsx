import React, { createContext, useContext, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import type { ExtractAtomValue, PrimitiveAtom } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import { getStore } from '~/index.js'

type AtomState<T> = {
  [K in keyof T]: PrimitiveAtom<T[K]>
}

type JotaiStore = ReturnType<typeof getStore>

type Ctx<Atoms> = {
  get: JotaiStore['get']
  set: JotaiStore['set']
  atoms: Atoms
}

const ATOMS_CONTEXT_KEY = Symbol('ATOMS_CONTEXT')
export const createAtomsContext = <
  T,
  Atoms = AtomState<T>,
  Action extends {
    [K in string]?: () => void | Promise<void>
  } = {},
>(
  atoms: Atoms,
  actions: (ctx: Ctx<Atoms>) => Action,
) => {
  const AtomsContext = createContext(atoms)

  const jotaiStore = getStore()
  const actionCtx = {
    get: jotaiStore.get,
    set: jotaiStore.set,
    atoms,
  }
  const returnActions = actions(actionCtx)
  const ActionsContext = createContext(returnActions)

  const Provider: FC<PropsWithChildren> = ({ children }) => {
    return (
      <AtomsContext.Provider value={atoms}>
        <ActionsContext.Provider value={returnActions}>
          {children}
        </ActionsContext.Provider>
      </AtomsContext.Provider>
    )
  }

  const useContextAtoms = () => useContext(AtomsContext)
  const useStoreValue = <K extends keyof Atoms>(atom: K) => {
    const atoms = useContextAtoms()
    return useAtomValue(
      atoms[atom] as PrimitiveAtom<Atoms[K]>,
    ) as ExtractAtomValue<Atoms[K]>
  }

  const useContextActions = () => useContext(ActionsContext)
  /**
   * @example [useContextAtoms, useStoreValue, useContextActions]
   */
  const hooks = [useContextAtoms, useStoreValue, useContextActions] as const

  const combinedValue = [Provider, hooks, atoms] as const

  Reflect.defineProperty(combinedValue, ATOMS_CONTEXT_KEY, {
    value: AtomsContext,
    writable: false,
    enumerable: false,
  })

  return combinedValue
}

export const createOverrideAtomsContext = <
  T extends ReturnType<typeof createAtomsContext>,
>(
  context: T,
  // @ts-expect-error
  atoms: Partial<T[2]>,
) => {
  // @ts-expect-error
  const AtomsContext = Reflect.get(context, ATOMS_CONTEXT_KEY) as React.Context<
    AtomState<any>
  >

  if (!AtomsContext) {
    throw new Error(
      'createOverrideAtomsContext: context is not created by createAtomsContext',
    )
  }

  const Component: FC<PropsWithChildren> = ({ children }) => {
    const atomsCtx = useContext(AtomsContext)
    const overrideAtoms = useMemo(() => ({ ...atomsCtx, ...atoms }), [atomsCtx])
    return (
      <AtomsContext.Provider value={overrideAtoms}>
        {children}
      </AtomsContext.Provider>
    )
  }
  return Component
}

// const a = use('a')
/**
 *
 *
 *```ts
 * const someCtxValue = useStoreValue((get,ctxValue) => get(ctxValue.someAtom))
 *
 *
 *
 * createStoreContext({
 *  someAtom: atom(0),
 * }, (ctx) => {
 * const { get, set, state } = ctx
 * return {
 * increment: () => {
 * set(stateValue.someAtom, current => current + 1)
 *  }
 * }
 * })
 *```
 */
