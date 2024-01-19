import { getDefaultStore } from 'jotai'

let jotaiStore: ReturnType<typeof getDefaultStore> | undefined

declare const globalThis: any

const JOTAI_GLOBAL_SINGLETON = Symbol()
export const setGlobalStore = (store: typeof jotaiStore) => {
  jotaiStore = store

  globalThis[JOTAI_GLOBAL_SINGLETON] = store
}

export const getGlobalStore = (): ReturnType<typeof getDefaultStore> => {
  if (jotaiStore) return jotaiStore
  if (globalThis[JOTAI_GLOBAL_SINGLETON])
    return globalThis[JOTAI_GLOBAL_SINGLETON]
  const defaultStore = getDefaultStore()
  jotaiStore = defaultStore
  globalThis[JOTAI_GLOBAL_SINGLETON] = defaultStore
  return defaultStore
}
