import type { PrimitiveAtom } from 'jotai'

import { getGlobalStore } from '~/lib/init.js'

export const createAtomAccessor = <T>(atom: PrimitiveAtom<T>) => {
  return [
    () => getGlobalStore().get(atom),
    (value: T) => getGlobalStore().set(atom, value),
  ] as const
}
