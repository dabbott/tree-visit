import { IndexPath } from './indexPath'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
} from './operation'
import { MutationBaseOptions } from './options'

export type SpliceOptions<T> = MutationBaseOptions<T> & {
  path: IndexPath
  deleteCount?: number
  nodes: T[]
}

export function splice<T>(node: T, options: SpliceOptions<T>) {
  const { path, deleteCount = 0, nodes } = options

  if (path.length === 0) {
    throw new Error(`Can't splice at the root`)
  }

  let indexPathsToRemove: IndexPath[] = []
  let parentIndexPath = path.slice(0, -1)
  let index = path[path.length - 1]

  for (let i = 0; i < deleteCount; i++) {
    indexPathsToRemove.push(parentIndexPath.concat(index + i))
  }

  const operations = getInsertionOperations(
    path,
    nodes,
    getRemovalOperations<T>(indexPathsToRemove)
  )

  return applyOperations(node, operations, options)
}
