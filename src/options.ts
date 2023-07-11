import { IndexPath } from './indexPath'

export type BaseOptions<T> = {
  getChildren: (node: T, indexPath: IndexPath) => T[]
}

export type MutationBaseOptions<T> = BaseOptions<T> & {
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}
