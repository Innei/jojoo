import { getDefaultStore } from 'jotai'

let jotaiStore: ReturnType<typeof getDefaultStore> | undefined

export const setGlobalStore = (store: typeof jotaiStore) => {
  jotaiStore = store
}

export const getGlobalStore = () => {
  if (jotaiStore) return jotaiStore
  const defaultStore = getDefaultStore()
  jotaiStore = defaultStore
  return defaultStore
}
