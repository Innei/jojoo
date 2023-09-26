import { getDefaultStore } from 'jotai'

let jotaiStore = getDefaultStore()

export const setGlobalStore = (store: typeof jotaiStore) => {
  jotaiStore = store
}

export const getGlobalStore = () => {
  return jotaiStore
}
