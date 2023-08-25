# Jojoo

A utils and extra react hooks for Jotai v2.

## Install

```bash
pnpm i jojoo
```

## Usage

You should `setStore` first.

```ts
import { setStore } from 'jojoo'
import { createStore, getDefaultStore } from 'jotai'

// if you use default store
setStore(getDefaultStore())

// or you provide a store
const store = createStore()
setStore(store)
```

### React Hooks

#### `createAtomsContext`

```tsx

```

#### `createModelDataContext`

```tsx

```

## License

2023 © Innei, Released under the MIT License.

> [Personal Website](https://innei.in/) · GitHub [@Innei](https://github.com/innei/)
