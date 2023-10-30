import { IndexPath, KeyPath } from './indexPath'

export type BaseOptions<T> = {
  getChildren: (node: T, indexPath: IndexPath) => T[]

  /**
   * By default, a new IndexPath array is allocated on every callback.
   *
   * For maximum performance, you can reuse the same IndexPath array
   * by setting this option to `true`. If you do this, make sure to
   * clone the IndexPath array if you store it for later use.
   */
  reuseIndexPath?: boolean
}

// export type AdvancedBaseOptions<T, PK extends PathKey> = {
//   reuseIndexPath?: boolean
// } & (PK extends string
//   ? {
//       getEntries: (node: T, indexPath: KeyPath) => T[]
//     }
//   : {
//       getChildren: (node: T, indexPath: IndexPath) => T[]
//     })

export type BaseEntriesOptions<T> = {
  getEntries: (node: T, keyPath: KeyPath) => [PropertyKey, T][]
  getChild?: (parent: T, parentKeyPath: KeyPath, childKey: PropertyKey) => T
  reuseIndexPath?: boolean
}

// export type ConditionalBaseOptions<
//   T,
//   PK extends PathKey,
//   KeyedOptions,
//   IndexedOptions
// > = AdvancedBaseOptions<T, PK> extends { getEntries: any }
//   ? AdvancedBaseOptions<T, PK> & KeyedOptions
//   : AdvancedBaseOptions<T, PK> & IndexedOptions

// export type ExtractPathType<T, O extends AdvancedBaseOptions<T>> = O extends {
//   getEntries: any
// }
//   ? KeyPath
//   : IndexPath

export type MutationBaseOptions<T> = BaseOptions<T> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}
