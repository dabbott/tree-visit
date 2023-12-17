import { BaseChildrenOptions, BaseEntriesOptions } from './options'
import { ChildrenTree } from './tree/childrenTree'
import { EntriesTree } from './tree/entriesTree'

export function defineTree<T>(
  getChildren: ((node: T) => T[]) | BaseChildrenOptions<T>
): ChildrenTree<T, {}>

export function defineTree<T, PK extends PropertyKey>(
  getChildren: BaseEntriesOptions<T, PK>
): EntriesTree<T, PK, {}>

export function defineTree<T, PK extends PropertyKey>(
  getChildren:
    | ((node: T) => T[])
    | BaseChildrenOptions<T>
    | BaseEntriesOptions<T, PK>
) {
  if (typeof getChildren === 'function') {
    return new ChildrenTree({ getChildren }, {})
  } else if ('getEntries' in getChildren) {
    return new EntriesTree(getChildren, {})
  } else {
    return new ChildrenTree(getChildren, {})
  }
}

/**
 * Return every tree utility function with options partially applied.
 *
 * @deprecated Use `defineTree` instead
 */
export const withOptions = defineTree
