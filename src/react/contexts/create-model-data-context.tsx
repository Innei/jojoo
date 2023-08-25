'use client'

import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
} from 'react'
import { produce } from 'immer'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import type { PrimitiveAtom } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import { noopArr } from '~/__internal/constants.js'
import { getStore } from '~/index.js'

import { useBeforeMounted } from '../hooks/use-before-mounted.js'

export const createModelDataProvider = <Model,>() => {
  const jotaiStore = getStore()
  const ModelDataAtomContext = createContext(
    null! as PrimitiveAtom<null | Model>,
  )
  const globalModelDataAtom = atom<null | Model>(null)
  const ModelDataAtomProvider: FC<
    PropsWithChildren<{
      overrideAtom?: PrimitiveAtom<null | Model>
    }>
  > = ({ children, overrideAtom }) => {
    return (
      <ModelDataAtomContext.Provider
        value={overrideAtom ?? globalModelDataAtom}
      >
        {children}
      </ModelDataAtomContext.Provider>
    )
  }
  const ModelDataProvider: FC<
    {
      data: Model
    } & PropsWithChildren
  > = memo(({ data, children }) => {
    const currentDataAtom =
      useContext(ModelDataAtomContext) ?? globalModelDataAtom

    useBeforeMounted(() => {
      jotaiStore.set(currentDataAtom, data)
    })

    useEffect(() => {
      jotaiStore.set(currentDataAtom, data)
    }, [data])

    useEffect(() => {
      return () => {
        jotaiStore.set(currentDataAtom, null)
      }
    }, [])

    return children
  })

  ModelDataProvider.displayName = 'ModelDataProvider'

  const useModelDataSelector = <T,>(
    selector: (data: Model | null) => T,
    deps?: any[],
  ) => {
    const currentDataAtom =
      useContext(ModelDataAtomContext) ?? globalModelDataAtom
    const nextSelector = useCallback((data: Model | null) => {
      return data ? selector(data) : null
    }, deps || noopArr)

    return useAtomValue(selectAtom(currentDataAtom, nextSelector))
  }

  const useSetModelData = () =>
    useSetAtom(useContext(ModelDataAtomContext) ?? globalModelDataAtom)

  const setGlobalModelData = (recipe: (draft: Model) => void) => {
    jotaiStore.set(
      globalModelDataAtom,
      produce(jotaiStore.get(globalModelDataAtom), recipe),
    )
  }

  const getGlobalModelData = () => {
    return jotaiStore.get(globalModelDataAtom)
  }

  return {
    ModelDataAtomProvider,
    ModelDataProvider,
    useModelDataSelector,
    useSetModelData,
    setGlobalModelData,
    getGlobalModelData,
  }
}
