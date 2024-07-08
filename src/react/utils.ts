import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai'

import { getGlobalStore } from '~/lib/init.js'
import { createAtomAccessor } from '~/vanilla/utils.js'

/**
 * @param atom - jotai
 * @returns - [atom, useAtom, useAtomValue, useSetAtom, jotaiStore.get, jotaiStore.set]
 */
export const createAtomHooks = <T>(atom: PrimitiveAtom<T>) => {
  const options = {
    store: getGlobalStore(),
  }
  return [
    atom,
    () => useAtom(atom, options),
    () => useAtomValue(atom, options),
    () => useSetAtom(atom, options),
    ...createAtomAccessor(atom),
  ] as const
}
