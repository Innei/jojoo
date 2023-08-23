import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai'

import { createAtomAccessor } from '~/vanilla/utils.js'

/**
 * @param atom - jotai
 * @returns - [atom, useAtom, useAtomValue, useSetAtom, jotaiStore.get, jotaiStore.set]
 */
export const createAtomHooks = <T>(atom: PrimitiveAtom<T>) => {
  return [
    atom,
    () => useAtom(atom),
    () => useAtomValue(atom),
    () => useSetAtom(atom),
    ...createAtomAccessor(atom),
  ] as const
}
