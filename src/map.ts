import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'
import { visit } from './visit'

export type MapChildrenOptions<T, U> = BaseChildrenOptions<T> & {
  /**
   * Transform the node into a different value.
   */
  transform: (node: T, transformedChildren: U[], indexPath: IndexPath) => U
}

export type MapEntriesOptions<
  T,
  PK extends PropertyKey,
  U
> = BaseEntriesOptions<T, PK> & {
  /**
   * Transform the node into a different value.
   */
  transform: (node: T, transformedEntries: U[], keyPath: PK[]) => U
}

/**
 * Map each node into a new node.
 *
 * The shape of the tree remains the same. You can omit nodes from the tree by
 * filtering them out of the `transformedChildren` argument. The root can't be omitted.
 */
export function map<T, U>(node: T, options: MapChildrenOptions<T, U>): U
export function map<T, PK extends PropertyKey, U>(
  node: T,
  options: MapEntriesOptions<T, PK, U>
): U
export function map<T, PK extends PropertyKey, U>(
  node: T,
  _options: MapChildrenOptions<T, U> | MapEntriesOptions<T, PK, U>
): U {
  const options = mapOptionsInterop<T, PK, U>(_options)

  const childrenMap: Record<string, U[]> = {}

  visit(node, {
    ...options,
    onLeave: (child, path) => {
      // Add a 0 so we can always slice off the last element to get a unique parent id
      const idPath = [0, ...path]

      const id = idPath.join()

      const transformed = options.transform(child, childrenMap[id] ?? [], path)

      const parentId = idPath.slice(0, -1).join()

      const parentChildren = childrenMap[parentId] ?? []

      parentChildren.push(transformed)

      childrenMap[parentId] = parentChildren
    },
  })

  return childrenMap[''][0]
}

function mapOptionsInterop<T, PK extends PropertyKey, R>(
  options: MapChildrenOptions<T, R> | MapEntriesOptions<T, PK, R>
): MapEntriesOptions<T, PK, R> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    transform: options.transform as MapEntriesOptions<T, PK, R>['transform'],
  }
}
