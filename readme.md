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
import { createStore, getDefaultStore } from 'jotai/vanilla'

// if you use default store
setStore(getDefaultStore())

// or you provide a store
const store = createStore()
setStore(store)
```

### React Hooks

#### `createAtomsContext`

You can use `createAtomsContext` to implement a simple Store. Pass in an object of atoms as state. An optional second argument is an action that accepts a context object. You can access the current scope's atoms through `ctx.atoms` and then change the value of an atom in the current context using `set`.

> [!NOTE]
> The `atoms` may not be the passed-in `globalAtoms`; they might be atoms that are overridden by a `Provider`. See [createOverrideAtomsContext](#createOverrideAtomsContext) for details.

Here is a simple example:

```tsx
import 'jojoo/react'

const globalAtoms = {
  aAtom: atom(0),
  bAtom: atom(false),
}

const context = createAtomsContext(globalAtoms, (ctx) => {
  const { atoms, set } = ctx
  return {
    increment: () => {
      set(atoms.aAtom, (current) => current + 1)
    },
  }
})

const [Provider, hooks, atoms, actions] = context
const [useContextAtoms, useStoreValue, useContextActions] = hooks

// Wrap `Provider` for your component

const App = () => {
  return (
    <Provider>
      <Count />
      <IncrementButton />
    </Provider>
  )
}

const Count = () => {
  const aCount = useStoreValue('aAtom')
  return <span>{aCount}</span>
}

const IncrementButton = () => {
  const inc = useContextActions().increment
  return <button onClick={inc}>Plus</button>
}
```

You can directly call `actions` returned by `createAtomsContext` outside of the component.

```ts
const context = createAtomsContext(globalAtoms, (ctx) => {
  const { atoms, set } = ctx
  return {
    increment: () => {
      set(atoms.aAtom, (current) => current + 1)
    },
  }
})

const [Provider, hooks, atoms, actions] = context

// not in React component.
// do something..
actions.increment()
```

#### `createOverrideAtomsContext`

In some cases, atoms created via `createAtomsContext` are used to manage data in a global store, which might be a global post state manager. However, when there exists a nested post on the page, you can't manage them globally.

At this point, you can use `createOverrideAtomsContext` to isolate global states, enabling state isolation between child components.

Here is a simple example:

```tsx
const context = createAtomsContext(
  {
    postId: atom('0'),
    text: atom('global post text'),
  },
  ({ atoms, set }) => {
    return {
      setText: (text: string) => {
        set(atoms.text, text)
      },
    }
  },
)

const [GlobalDataProvider, [useAtoms, useDataValue, useDataActions]] = context
const OverrideProvider = createOverrideAtomsContext(context, {
  text: atom('override post text'),
  postId: atom('1'),
})

const DataRender: FC<{}> = ({ testId }) => {
  const text = useDataValue('text')
  const id = useDataValue('postId')
  return (
    <div>
      <p>
        Data Id:
        <span>{id}</span>
      </p>

      <p>
        Data Text:
        <span>{text}</span>
      </p>
    </div>
  )
}

const DataActions: FC<{}> = (props) => {
  const { testId } = props
  const { setText } = useDataActions()
  const text = useDataValue('text')
  return (
    <div>
      <button onClick={() => setText(`${text} updated`)}></button>
    </div>
  )
}

// ReactNode structure like:
;<GlobalDataProvider>
  <DataRender />
  <DataActions />

  <OverrideProvider>
    <DataRender />
    <DataActions />
  </OverrideProvider>
</GlobalDataProvider>
```

Child components wrapped by `OverrideProvider` will use the overridden atoms, isolated from global atoms. Of course, you can also use it in a nested manner.

```jsx
// ReactNode structure like:
;<GlobalDataProvider>
  <DataRender />
  <DataActions />

  <OverrideProvider>
    <DataRender />
    <DataActions />

    <OverrideProvider>
      <DataRender />
      <DataActions />
    </OverrideProvider>
  </OverrideProvider>
</GlobalDataProvider>
```

#### `createModelDataContext`


TODO

## License

2023 © Innei, Released under the MIT License.

> [Personal Website](https://innei.in/) · GitHub [@Innei](https://github.com/innei/)
