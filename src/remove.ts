import { IndexPath } from './indexPath.js'
import {
  applyOperations,
  getRemovalOperations,
  transformPathsByOperations,
} from './operation.js'
import { MutationBaseOptions } from './options.js'

export type RemoveOptions<T> = MutationBaseOptions<T> & {
  paths: IndexPath[]
}

export type RemoveWithPathTrackingOptions<T> = MutationBaseOptions<T> & {
  paths: IndexPath[]
  track: IndexPath[]
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  return _removeWithPathTracking(node, options).node
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function removeWithPathTracking<T>(
  node: T,
  options: RemoveWithPathTrackingOptions<T>
) {
  return _removeWithPathTracking(node, options)
}

function _removeWithPathTracking<T>(
  node: T,
  options: Omit<RemoveWithPathTrackingOptions<T>, 'track'> & {
    track?: IndexPath[]
  }
) {
  const { paths, track } = options

  const operations = getRemovalOperations<T>(paths)

  const transformedPaths = track
    ? transformPathsByOperations(track, operations)
    : []

  return {
    node: applyOperations(node, operations, options),
    paths: transformedPaths,
  }
}
