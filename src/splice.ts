import { IndexPath } from './indexPath.js'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
  transformPathsByOperations,
} from './operation.js'
import { MutationBaseOptions } from './options.js'

export type SpliceOptions<T> = MutationBaseOptions<T> & {
  path: IndexPath
  deleteCount?: number
  nodes: T[]
}

export type SpliceWithPathTrackingOptions<T> = SpliceOptions<T> & {
  track: IndexPath[]
}

export function splice<T>(node: T, options: SpliceOptions<T>) {
  return _spliceWithPathTracking(node, options).node
}

export function spliceWithPathTracking<T>(
  node: T,
  options: SpliceWithPathTrackingOptions<T>
) {
  return _spliceWithPathTracking(node, options)
}

function _spliceWithPathTracking<T>(
  node: T,
  options: Omit<SpliceWithPathTrackingOptions<T>, 'track'> & {
    track?: IndexPath[]
  }
) {
  const { path, deleteCount = 0, nodes, track } = options

  if (path.length === 0) {
    throw new Error(`Can't splice at the root`)
  }

  const pathsToRemove = getPathsToRemove(path, deleteCount)

  const operations = getInsertionOperations(
    path,
    nodes,
    getRemovalOperations<T>(pathsToRemove)
  )

  const transformedPaths = track
    ? transformPathsByOperations(track, operations)
    : []

  return {
    node: applyOperations(node, operations, options),
    paths: transformedPaths,
  }
}

function getPathsToRemove(path: IndexPath, deleteCount: number) {
  let pathsToRemove: IndexPath[] = []
  let parentPath = path.slice(0, -1)
  let index = path[path.length - 1]

  for (let i = 0; i < deleteCount; i++) {
    pathsToRemove.push(parentPath.concat(index + i))
  }

  return pathsToRemove
}
