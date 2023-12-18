import { access } from '../access'
import { IndexPath } from '../indexPath'
import {
  MutationBaseChildrenOptions,
  MutationBaseEntriesOptions,
  convertChildrenToEntries,
} from '../options'
import { ancestorIndexPaths } from './ancestors'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
} from './operation'

export type MoveChildrenOptions<T> = MutationBaseChildrenOptions<T> & {
  indexPaths: IndexPath[]
  to: IndexPath
}

export type MoveEntriesOptions<
  T,
  PK extends PropertyKey
> = MutationBaseEntriesOptions<T, PK> & {
  indexPaths: PK[][]
  to: PK[]
}

export function move<T>(node: T, options: MoveChildrenOptions<T>): T
export function move<T, PK extends PropertyKey>(
  node: T,
  options: MoveEntriesOptions<T, PK>
): T
export function move<T, PK extends PropertyKey>(
  node: T,
  _options: MoveChildrenOptions<T> | MoveEntriesOptions<T, PK>
): T {
  const options = moveOptionsInterop<T, PK>(_options)

  if (options.indexPaths.length === 0) return node

  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't move the root node`)
    }
  }

  if (options.to.length === 0) {
    throw new Error(`Can't move nodes to the root`)
  }

  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths)

  const nodesToInsert = _ancestorIndexPaths.map(
    (indexPath) =>
      [
        indexPath[indexPath.length - 1],
        access(node, { ...options, path: indexPath }),
      ] as [PK, T]
  )

  const operations = getInsertionOperations(
    options.to,
    nodesToInsert,
    getRemovalOperations<T, PK>(_ancestorIndexPaths)
  )

  return applyOperations(node, operations, options)
}

function moveOptionsInterop<T, PK extends PropertyKey>(
  options: MoveChildrenOptions<T> | MoveEntriesOptions<T, PK>
): MoveEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    indexPaths: options.indexPaths as PK[][],
    to: options.to as PK[],
    create(node, entries, path) {
      const children = entries.map(([, child]) => child)
      return options.create(node, children, path as IndexPath)
    },
  }
}
