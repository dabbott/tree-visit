import { IndexPath } from '../indexPath'
import {
  MutationBaseChildrenOptions,
  MutationBaseEntriesOptions,
  convertChildrenToEntries,
} from '../options'
import { applyOperations, getInsertionOperations } from './operation'

export type InsertChildrenOptions<T> = MutationBaseChildrenOptions<T> & {
  nodes: T[]
  at: IndexPath
}

export type InsertEntriesOptions<
  T,
  PK extends PropertyKey
> = MutationBaseEntriesOptions<T, PK> & {
  nodes: [PK, T][]
  at: PK[]
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function insert<T>(node: T, options: InsertChildrenOptions<T>): T
export function insert<T, PK extends PropertyKey>(
  node: T,
  options: InsertEntriesOptions<T, PK>
): T
export function insert<T, PK extends PropertyKey>(
  node: T,
  _options: InsertChildrenOptions<T> | InsertEntriesOptions<T, PK>
): T {
  const options = insertOptionsInterop(_options)

  const { nodes, at } = options

  if (at.length === 0) {
    throw new Error(`Can't insert nodes at the root`)
  }

  const state = getInsertionOperations<T, PK>(at, nodes)

  return applyOperations(node, state, options)
}

function insertOptionsInterop<T, PK extends PropertyKey>(
  options: InsertChildrenOptions<T> | InsertEntriesOptions<T, PK>
): InsertEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    at: options.at as PK[],
    nodes: options.nodes.map((node, index) => [index as PK, node]),
    create(node, entries, path) {
      const children = entries.map(([, child]) => child)
      return options.create(node, children, path as IndexPath)
    },
  }
}
