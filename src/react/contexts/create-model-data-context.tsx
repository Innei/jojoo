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
  const ModelDataAtomContext = createContext(null! as PrimitiveAtom<Model>)
  const globalModelDataAtom = atom<Model>(null! as Model)
  const ModelDataAtomProvider: FC<
    PropsWithChildren<{
      overrideAtom?: PrimitiveAtom<Model>
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

    const setData = useSetAtom(currentDataAtom)

    useBeforeMounted(() => {
      setData(data)
    })

    useEffect(() => {
      setData(data)
    }, [data])

    useEffect(() => {
      return () => {
        setData(null!)
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

    return useAtomValue(selectAtom(currentDataAtom, nextSelector))!
  }

  const useSetModelData = () =>
    useSetAtom(useContext(ModelDataAtomContext) ?? globalModelDataAtom)

  const setGlobalModelData = (recipe: (draft: Model) => void) => {
    const jotaiStore = getStore()
    jotaiStore.set(
      globalModelDataAtom,
      produce(jotaiStore.get(globalModelDataAtom), recipe),
    )
  }

  const getGlobalModelData = () => {
    return getStore().get(globalModelDataAtom)
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
