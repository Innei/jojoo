import type { PrimitiveAtom } from 'jotai'

import { getStore } from '~/lib/init.js'

export const createAtomAccessor = <T>(atom: PrimitiveAtom<T>) => {
  return [
    () => getStore().get(atom),
    (value: T) => getStore().set(atom, value),
  ] as const
}
