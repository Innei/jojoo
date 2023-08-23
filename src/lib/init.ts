import type { createStore } from 'jotai'

let jotaiStore: ReturnType<typeof createStore>

export const setStore = (store: typeof jotaiStore) => {
  jotaiStore = store
}

export const getStore = () => {
  if (!jotaiStore)
    throw new Error('jotaiStore is not initialized, please call setStore first')

  return jotaiStore
}
