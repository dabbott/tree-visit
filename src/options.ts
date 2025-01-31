import { IndexPath } from './indexPath'

export type TraversalContext<T> = {
  getRoot(): T
  getParent(): T | undefined
  getAncestors(): T[]
}

export type BaseOptions<T> = {
  getChildren: (
    node: T,
    indexPath: IndexPath,
    context?: TraversalContext<T>
  ) => T[]

  /**
   * By default, a new IndexPath array is allocated on every callback.
   *
   * For maximum performance, you can reuse the same IndexPath array
   * by setting this option to `true`. If you do this, make sure to
   * clone the IndexPath array if you store it for later use.
   */
  reuseIndexPath?: boolean

  /**
   * If true, the `context` object will be included in the callback.
   */
  includeTraversalContext?: boolean
}

export type MutationBaseOptions<T> = BaseOptions<T> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}
