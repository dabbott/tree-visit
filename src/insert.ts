import { IndexPath } from './indexPath'
import { applyOperations, getInsertionOperations } from './operation'
import { MutationBaseOptions } from './options'

export type InsertOptions<T> = MutationBaseOptions<T> & {
  nodes: T[]
  at: IndexPath
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function insert<T>(node: T, options: InsertOptions<T>) {
  const { nodes, at } = options

  if (at.length === 0) {
    throw new Error(`Can't insert nodes at the root`)
  }

  const state = getInsertionOperations(at, nodes)

  return applyOperations(node, state, options)
}
