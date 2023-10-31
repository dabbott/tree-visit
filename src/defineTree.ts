import { BaseChildrenOptions } from './options'
import { ChildrenTree } from './tree/childrenTree'

export function defineTree<T>(
  getChildren: ((node: T) => T[]) | BaseChildrenOptions<T>
) {
  return new ChildrenTree(
    typeof getChildren === 'function' ? { getChildren } : getChildren,
    {}
  )
}
