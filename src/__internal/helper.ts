export const defineProperty = (obj: any, key: string | symbol, value: any) => {
  return Reflect.defineProperty(obj, key, {
    value,
    writable: false,
    enumerable: false,
  })
}
