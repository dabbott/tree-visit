import { IndexPath } from './indexPath'
import {
  applyOperations,
  getInsertionOperations,
  transformPathsByOperations,
} from './operation'
import { MutationBaseOptions } from './options'

export type InsertOptions<T> = MutationBaseOptions<T> & {
  nodes: T[]
  at: IndexPath
}

export type InsertWithPathTrackingOptions<T> = MutationBaseOptions<T> & {
  nodes: T[]
  at: IndexPath
  track: IndexPath[]
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function insert<T>(node: T, options: InsertOptions<T>) {
  return _insertWithPathTracking(node, options).node
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function insertWithPathTracking<T>(
  node: T,
  options: InsertWithPathTrackingOptions<T>
) {
  return _insertWithPathTracking(node, options)
}

function _insertWithPathTracking<T>(
  node: T,
  options: Omit<InsertWithPathTrackingOptions<T>, 'track'> & {
    track?: IndexPath[]
  }
) {
  const { nodes, at, track } = options

  if (at.length === 0) {
    throw new Error(`Can't insert nodes at the root`)
  }

  const state = getInsertionOperations(at, nodes)

  const transformedPaths = track ? transformPathsByOperations(track, state) : []

  return {
    node: applyOperations(node, state, options),
    paths: transformedPaths,
  }
}
