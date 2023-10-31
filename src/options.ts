import { IndexPath } from './indexPath'

export type BaseChildrenOptions<T> = {
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

export type BaseEntriesOptions<T, PK extends PropertyKey> = {
  getEntries: (node: T, keyPath: PK[]) => [PK, T][]
  getChild?: (parent: T, parentKeyPath: PK[], childKey: PK) => T
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

export type MutationBaseOptions<T> = BaseChildrenOptions<T> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}
