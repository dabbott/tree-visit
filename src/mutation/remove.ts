import { IndexPath } from '../indexPath'
import {
  MutationBaseChildrenOptions,
  MutationBaseEntriesOptions,
  convertChildrenToEntries,
} from '../options'
import { applyOperations, getRemovalOperations } from './operation'

export type RemoveChildrenOptions<T> = MutationBaseChildrenOptions<T> & {
  indexPaths: IndexPath[]
}

export type RemoveEntriesOptions<
  T,
  PK extends PropertyKey
> = MutationBaseEntriesOptions<T, PK> & {
  indexPaths: PK[][]
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function remove<T>(node: T, options: RemoveChildrenOptions<T>): T
export function remove<T, PK extends PropertyKey>(
  node: T,
  options: RemoveEntriesOptions<T, PK>
): T
export function remove<T, PK extends PropertyKey>(
  node: T,
  _options: RemoveChildrenOptions<T> | RemoveEntriesOptions<T, PK>
): T {
  const options = removeOptionsInterop(_options)

  if (options.indexPaths.length === 0) return node

  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }
  }

  const operations = getRemovalOperations<T, PK>(options.indexPaths)

  return applyOperations(node, operations, options)
}

function removeOptionsInterop<T, PK extends PropertyKey>(
  options: RemoveChildrenOptions<T> | RemoveEntriesOptions<T, PK>
): RemoveEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    indexPaths: options.indexPaths as PK[][],
    create(node, entries, path) {
      const children = entries.map(([, child]) => child)
      return options.create(node, children, path as IndexPath)
    },
  }
}
