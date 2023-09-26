import React, { createContext, useContext, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import type { ExtractAtomValue, PrimitiveAtom } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import { noop } from '~/__internal/constants.js'
import { defineProperty } from '~/__internal/helper.js'
import { getGlobalStore } from '~/index.js'

type AtomState<T> = {
  [K in keyof T]: PrimitiveAtom<T[K]>
}

type JotaiStore = ReturnType<typeof getGlobalStore>

type Ctx<Atoms> = {
  get: JotaiStore['get']
  set: JotaiStore['set']
  atoms: Atoms
}

type ActionType<T = any> = { [K: string]: (...args: any[]) => T | Promise<T> }

const ATOMS_CONTEXT_KEY = Symbol('ATOMS_CONTEXT')

interface AtomsInternalContextType<T, A = AtomState<T>, Ac = ActionType> {
  AtomsContext: React.Context<A>
  ActionsContext: React.Context<Ac>

  actionsFactory: (ctx: Ctx<A>) => Ac
}
const createActionContext = <T, Atoms = AtomState<T>>(atoms: Atoms) => {
  const jotaiStore = getGlobalStore()
  return {
    get: jotaiStore.get,
    set: jotaiStore.set,
    atoms,
  }
}
export const createAtomsContext = <
  T,
  Atoms extends AtomState<T> = AtomState<T>,
  Action extends ActionType = {},
>(
  atoms: Atoms,
  actions: (ctx: Ctx<Atoms>) => Action = noop as any,
) => {
  const AtomsContext = createContext(atoms)

  const returnActions = actions(createActionContext(atoms))
  const ActionsContext = createContext(returnActions)

  const AtomsInternalContext = createContext<
    AtomsInternalContextType<T, Atoms, Action>
  >(null!)
  const internalCtxValue: AtomsInternalContextType<T, Atoms, Action> = {
    ActionsContext,
    AtomsContext,
    actionsFactory: actions,
  }

  const Provider: FC<PropsWithChildren> = ({ children }) => {
    return (
      <AtomsContext.Provider value={atoms}>
        <ActionsContext.Provider value={returnActions}>
          <AtomsInternalContext.Provider value={internalCtxValue}>
            {children}
          </AtomsInternalContext.Provider>
        </ActionsContext.Provider>
      </AtomsContext.Provider>
    )
  }

  const useContextAtoms = () => useContext(AtomsContext)
  const useStoreValue = <K extends keyof Atoms>(atom: K) => {
    const atoms = useContextAtoms()
    return useAtomValue(atoms[atom]) as ExtractAtomValue<Atoms[K]>
  }

  const useContextActions = () => useContext(ActionsContext)
  /**
   * @example [useContextAtoms, useStoreValue, useContextActions]
   */
  const hooks = [useContextAtoms, useStoreValue, useContextActions] as const

  const combinedValue = [Provider, hooks, atoms, returnActions] as const

  defineProperty(combinedValue, ATOMS_CONTEXT_KEY, AtomsInternalContext)

  return combinedValue
}

export const createOverrideAtomsContext = <
  T extends ReturnType<typeof createAtomsContext>,
>(
  context: T,

  atoms: Partial<T[2]>,
) => {
  const AtomsInternalContext = Reflect.get(
    context,
    ATOMS_CONTEXT_KEY,
  ) as React.Context<AtomsInternalContextType<T>>
  if (!AtomsInternalContext) {
    throw new Error(
      'createOverrideAtomsContext: context is not created by createAtomsContext',
    )
  }

  const Component: FC<PropsWithChildren> = ({ children }) => {
    const { AtomsContext, actionsFactory, ActionsContext } =
      useContext(AtomsInternalContext)
    const atomsCtx = useContext(AtomsContext)
    const overrideAtoms = useMemo(() => ({ ...atomsCtx, ...atoms }), [atomsCtx])

    const actions = useMemo(
      () => actionsFactory(createActionContext(overrideAtoms)),
      [actionsFactory, overrideAtoms],
    )
    return (
      <AtomsContext.Provider value={overrideAtoms}>
        <ActionsContext.Provider value={actions}>
          {children}
        </ActionsContext.Provider>
      </AtomsContext.Provider>
    )
  }
  return Component
}
