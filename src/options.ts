import { IndexPath } from './indexPath'

type CommonOptions = {
  /**
   * By default, a new IndexPath array is allocated on every callback.
   *
   * For maximum performance, you can reuse the same IndexPath array
   * by setting this option to `true`. If you do this, make sure to
   * clone the IndexPath array if you store it for later use.
   */
  reuseIndexPath?: boolean
}

export type BaseChildrenOptions<T> = CommonOptions & {
  getChildren: (node: T, indexPath: IndexPath) => T[]
}

export type BaseEntriesOptions<T, PK extends PropertyKey> = CommonOptions & {
  getEntries: (node: T, keyPath: PK[]) => [PK, T][]
  getChild?: (parent: T, parentKeyPath: PK[], childKey: PK) => T
}

export type MutationBaseChildrenOptions<T> = BaseChildrenOptions<T> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

export type MutationBaseEntriesOptions<
  T,
  PK extends PropertyKey
> = BaseEntriesOptions<T, PK> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, entries: [PK, T][], keyPath: PK[]) => T
}

export function getChild<T, PK extends PropertyKey>(
  node: T,
  options: BaseEntriesOptions<T, PK>,
  keyPath: PK[],
  key: PK
): T {
  if (options.getChild) {
    return options.getChild(node, keyPath, key)
  } else {
    const entries = options.getEntries(node, keyPath)
    const entry = entries.find(([k]) => k === key)
    return entry![1]
  }
}

export function convertChildrenToEntries<T, PK extends PropertyKey>(
  options: BaseChildrenOptions<T>
): BaseEntriesOptions<T, PK> {
  const { getChildren, ...rest } = options

  const result: BaseEntriesOptions<T, number> = {
    ...rest,
    getEntries: (node, keyPath) =>
      getChildren(node, keyPath).map((child, index) => [index, child]),
    getChild: (parent, parentKeyPath, childKey) =>
      getChildren(parent, parentKeyPath)[childKey],
  }

  return result as BaseEntriesOptions<T, any> as BaseEntriesOptions<T, PK>
}
