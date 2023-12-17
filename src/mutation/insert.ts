import { IndexPath } from '../indexPath'
import { MutationBaseOptions } from '../options'
import { applyOperations, getInsertionOperations } from './operation'

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
