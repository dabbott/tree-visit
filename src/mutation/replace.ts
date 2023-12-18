import { IndexPath } from '../indexPath'
import {
  MutationBaseChildrenOptions,
  MutationBaseEntriesOptions,
  convertChildrenToEntries,
} from '../options'
import { applyOperations, getReplaceOperations } from './operation'

export type ReplaceChildrenOptions<T> = MutationBaseChildrenOptions<T> & {
  at: IndexPath
  node: T
}

export type ReplaceEntriesOptions<
  T,
  PK extends PropertyKey
> = MutationBaseEntriesOptions<T, PK> & {
  at: PK[]
  node: [PK, T]
}

/**
 * Replace the node at the given `IndexPath` with another.
 */
export function replace<T>(node: T, options: ReplaceChildrenOptions<T>): T
export function replace<T, PK extends PropertyKey>(
  node: T,
  options: ReplaceEntriesOptions<T, PK>
): T
export function replace<T, PK extends PropertyKey>(
  node: T,
  _options: ReplaceChildrenOptions<T> | ReplaceEntriesOptions<T, PK>
): T {
  const options = replaceOptionsInterop<T, PK>(_options)

  if (options.at.length === 0) return options.node[1]

  const operations = getReplaceOperations<T, PK>(options.at, options.node)

  return applyOperations(node, operations, options)
}

function replaceOptionsInterop<T, PK extends PropertyKey>(
  options: ReplaceChildrenOptions<T> | ReplaceEntriesOptions<T, PK>
): ReplaceEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    at: options.at as PK[],
    node: [options.at[options.at.length - 1] as PK, options.node],
    create(node, entries, path) {
      const children = entries.map(([, child]) => child)
      return options.create(node, children, path as IndexPath)
    },
  }
}
