import type { PrimitiveAtom } from 'jotai'

import { getStore } from '~/lib/init.js'

export const createAtomAccessor = <T>(atom: PrimitiveAtom<T>) => {
  const jotaiStore = getStore()
  return [
    () => jotaiStore.get(atom),
    (value: T) => jotaiStore.set(atom, value),
  ] as const
}
