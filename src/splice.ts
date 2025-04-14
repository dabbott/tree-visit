import { IndexPath } from './indexPath'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
} from './operation'
import { MutationBaseOptions } from './options'

export type SpliceOptions<T> = MutationBaseOptions<T> & {
  at: IndexPath
  deleteCount?: number
  nodes: T[]
}

export function splice<T>(node: T, options: SpliceOptions<T>) {
  const { at, deleteCount = 0, nodes } = options

  if (at.length === 0) {
    throw new Error(`Can't splice at the root`)
  }

  let indexPathsToRemove: IndexPath[] = []
  let parentIndexPath = at.slice(0, -1)
  let index = at[at.length - 1]

  for (let i = 0; i < deleteCount; i++) {
    indexPathsToRemove.push(parentIndexPath.concat(index + i))
  }

  const operations = getInsertionOperations(
    at,
    nodes,
    getRemovalOperations<T>(indexPathsToRemove)
  )

  return applyOperations(node, operations, options)
}
