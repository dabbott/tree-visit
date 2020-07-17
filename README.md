# buffs

A filesystem utility, supporting batch & in-memory operations.

```bash
npm install --save buffs
```

## API

Every API works both on the real filesystem and in-memory filesystems created by [`createFs`](#createFs).

- [copy](#copy)
- [createFs](#createFs)
- [describe](#describe)
- [describeComparison](#describeComparison)

---

### `copy`

Copy a file or directory from the source to the target filesystem recursively.

**Type**: `(source: IFS, target: IFS, sourcePath: string, targetPath?: string, options?: CopyOptions) => void`

#### Example

```js
import fs from 'fs'
import process from 'process'
import { copy, createFs } from 'buffs'

// Create files using in-memory filesystem
const { fs: source } = createFs({
  '/a.txt': 'a',
  '/b/b.txt': 'b',
})

// Copy all files from source to your current directory
copy(source, fs, '/', process.cwd())
```

---

### `createFs`

Create an in-memory filesystem.

This is a wrapper around [`memfs`](https://github.com/streamich/memfs).

**Type**: `(json: DirectoryJSON = {}, cwd?: string) => { volume: VolumeType; fs: IFS }`

```js
import fs from 'fs'
import { createFs } from 'buffs'

// Create files using in-memory filesystem
const { volume, fs } = createFs({
  '/a.txt': 'a',
  '/b/b.txt': 'b',
})
```

---

### `describe`

Create a description of all files in the source filesystem.

**Type**: `(source: IFS, filePath: string) => string`

#### Example

```js
import { describe, createFs } from 'buffs'

// Create files using in-memory filesystem
const { fs: source } = createFs({
  '/a.txt': 'a',
  '/b/b.txt': 'b',
})

const description = describe(source, '/')

console.log(description)
// ├── a.txt
// └── b / b.txt
```

---

### `describeComparison`

Create a description of all files in the "updated" source filesystem, relative to the state of the "original" target filesystem.

**Type**: `(source: IFS, target: IFS, filePath: string, { colorize?: boolean }): string`

#### Example

```js
import { describeComparison, createFs } from 'buffs'

const { fs: source } = createFs({
  '/a.txt': 'a',
  '/b/b.txt': 'b',
})

const { fs: target } = createFs({
  '/b/b.txt': 'b',
})

const description = describeComparison(source, target, '/', { colorize: true })

console.log(description)
// ├── a.txt (printed in green, since it was "added")
// └── b / b.txt
```
