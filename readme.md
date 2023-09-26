# Jojoo

A utils and extra react hooks for Jotai v2.

## Install

```bash
pnpm i jojoo
```

## Usage

If you want to use custom store, should `setGlobalStore` first.

```ts
import { setGlobalStore } from 'jojoo'
import { createStore, getDefaultStore } from 'jotai/vanilla'

// if you use custom store
const store = createStore()
setGlobalStore(store)
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

```tsx
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

const DataActions: FC<> = (props) => {
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
const App = () => (
  <GlobalDataProvider>
    <DataRender />
    <DataActions />

    <OverrideProvider>
      <DataRender />
      <DataActions />
    </OverrideProvider>
  </GlobalDataProvider>
)
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

Create a dataset context through `createModelDataContext`, which can manage data with Jotai, and then pass it to descendants through React.context. Utilize the feature of React.context to isolate state in multiple scenarios.

A simple usage example:

```tsx
interface NoteModel {
  title: string
}

const {
  ModelDataProvider,
  ModelDataAtomProvider,
  getGlobalModelData: getModelData,
  setGlobalModelData: setModelData,
  useModelDataSelector,
  useSetModelData,
} = createModelDataProvider<NoteModel>()

export {
  ModelDataProvider as CurrentNoteDataProvider,
  ModelDataAtomProvider as CurrentNoteDataAtomProvider,
  getModelData as getCurrentNoteData,
  setModelData as setCurrentNoteData,
  useModelDataSelector as useCurrentNoteDataSelector,
  useSetModelData as useSetCurrentNoteData,
}

const App = () => {
  return (
    <>
      <CurrentNoteDataProvider data={data} />
      <DataRender />
    </>
  )
}

const DataRender = () => {
  const title = useCurrentNoteDataSelector((n) => n.title)
  return <span>{title}</span>
}
```

You can also use `ModelDataAtomProvider` for scope isolation. In this way, the internal data of `ModelData` in both `App` and `AnotherData` are completely independent.

```tsx
const App = () => (
  <>
    <CurrentNoteDataProvider data={data} />
    <DataRender />
    <AnotherData />
  </>
)

const AnotherData = () => {
  const overrideAtom = useMemo(() => atom(null as null | NoteModel), [])

  return (
    <CurrentNoteDataAtomProvider overrideAtom={overrideAtom}>
      <CurrentNoteDataProvider data={data} />
      <DataRender />
    </CurrentNoteDataAtomProvider>
  )
}
```

## License

2023 © Innei, Released under the MIT License.

> [Personal Website](https://innei.in/) · GitHub [@Innei](https://github.com/innei/)
