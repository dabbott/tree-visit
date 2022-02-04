# tree-visit

A tree traversal library.

```bash
npm install --save tree-visit
```

OR

```bash
yarn add tree-visit
```

## API

All functions take an `options` parameter that must contain _at least_ a `getChildren` function which specifies how to find a node's children. The `withOptions` API returns a version of every function with the `getChildren` option already set. Using `withOptions` instead of the bare functions is recommended for convenience.

Most functions, such as `getChildren`, `predicate`, `onEnter`, and `onLeave`, are passed an `IndexPath` as the second argument, containing an array of integer indexes that identify that node. The root node is implicitly included in the `IndexPath` (i.e. there's no `0` first in every `IndexPath`).

- [access](#access)
- [accessPath](#accessPath)
- [diagram](#diagram)
- [find](#find)
- [findAll](#findAll)
- [findIndexPath](#findIndexPath)
- [flat](#flat)
- [visit](#visit)
- [withOptions](#withOptions)

---

### `access`

Returns a node by its `IndexPath`.

**Type**: `function access<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T`

#### Example

```js
import { access } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

access(rootNode, [1, 0], { getChildren })
// #=> { name: 'd' }
```

---

### `accessPath`

Returns an array of each node in an `IndexPath`.

**Type**: `function accessPath<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T`

#### Example

```js
import { accessPath } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

accessPath(rootNode, [1, 0], { getChildren })
// #=> [{ name: 'a', children: [...] }, { name: 'c', children: [...] }, { name: 'd' }]
```

---

### `diagram`

Generate a diagram of the tree, as a string.

**Type**: `function diagram<T>(node: T, options: DiagramOptions<T>): string`

#### Example

```js
import { diagram } from 'tree-visit'

const getChildren = (node) => node.children || []
const getLabel = (node) => node.name

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

diagram(rootNode, { getChildren, getLabel })
// #=> a
// #=> ├── b
// #=> └── c / d
```

---

### `find`

Find a node matching a predicate function.

**Type**: `function find<T>(node: T, options: FindOptions<T>): T | undefined`

#### Example

```js
import { find } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

find(rootNode, { getChildren, predicate: (node) => node.name === 'd' })
// #=> { name: 'd' }
```

---

### `findAll`

Find all nodes matching a predicate function.

**Type**: `findAll<T>(node: T, options: FindOptions<T>): T[]`

#### Example

```js
import { findAll } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

findAll(rootNode, { getChildren, predicate: (node) => node.name === 'd' })
// #=> [{ name: 'd' }]
```

---

### `findIndexPath`

Find the `IndexPath` of a node matching a predicate function.

**Type**: `findIndexPath<T>(node: T, options: FindOptions<T>): T[]`

#### Example

```js
import { findIndexPath } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

findIndexPath(rootNode, { getChildren, predicate: (node) => node.name === 'd' })
// #=> [1, 0]
```

---

### `findAllIndexPaths`

Find the `IndexPath` of all nodes matching a predicate function.

**Type**: `findAllIndexPaths<T>(node: T, options: FindOptions<T>): T[]`

#### Example

```js
import { findAllIndexPaths } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

findAllIndexPaths(rootNode, {
  getChildren,
  predicate: (node) => node.name === 'c' || node.name === 'd',
})
// #=> [[1], [1, 0]]
```

---

### `flat`

Returns an array containing the root node and all of its descendants.

This is analogous to `Array.prototype.flat` for flattening arrays.

**Type**: `function flat<T>(node: T, options: BaseOptions<T>): T[]`

#### Example

```js
import { flat } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

flat(rootNode, { getChildren }).map((node) => node.name)
// #=> ['a', 'b', 'c', 'd']
```

---

### `visit`

Visit each node in the tree, calling an optional `onEnter` and `onLeave` for each.

From `onEnter`:

- return nothing or `undefined` to continue
- return `"skip"` to skip the children of that node and the subsequent `onLeave`
- return `"stop"` to end traversal

From `onLeave`:

- return nothing or `undefined` to continue
- return `"stop"` to end traversal

**Type**: `function visit<T>(node: T, options: VisitOptions<T>): void`

#### Example

```js
import { visit } from 'tree-visit'

const getChildren = (node) => node.children || []

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

visit(rootNode, {
  getChildren,
  onEnter: (node) => {
    console.log(node)
  },
})
// #=> a, b, c, d
```

---

### `withOptions`

Returns a version of every function with the `getChildren` option already set.

This allows for more concise calls to most functions.

**Type**: `function withOptions<T>(baseOptions: BaseOptions<T>): WithOptions<T>`

#### Example

```js
import { withOptions } from 'tree-visit'

const getChildren = (node) => node.children || []

const { visit, find } = withOptions({ getChildren })

const rootNode = {
  name: 'a',
  children: [
    { name: 'b' },
    {
      name: 'c',
      children: [{ name: 'd' }],
    },
  ],
}

visit(rootNode, (node) => {
  console.log(node)
})
// #=> a, b, c, d

find(rootNode, (node) => node.name === 'd')
// #=> { name: 'd' }
```
