import { FindOptionsWB, WithoutBase } from './defineTree'
import { find, FindOptions, FindOptionsTyped } from './find'
import { IndexPath } from './indexPath'
import { BaseOptions, TraversalContext } from './options'

export const defineArrayTree = <T>(
  getChildren: BaseOptions<T> | BaseOptions<T>['getChildren']
) => {
  const root = Symbol('root')

  type TreeNode = T | typeof root

  const baseOptions: BaseOptions<T> =
    typeof getChildren === 'function' ? { getChildren } : getChildren

  const createGetChildren =
    (array: T[]) =>
    (
      node: TreeNode,
      indexPath: IndexPath,
      context?: TraversalContext<TreeNode>
    ): TreeNode[] =>
      node === root
        ? array
        : baseOptions.getChildren(
            node,
            indexPath,
            context as TraversalContext<T>
          )

  function arrayTreeFind(
    array: T[],
    predicate: FindOptions<T>['predicate']
  ): T | undefined
  function arrayTreeFind(array: T[], options: FindOptionsWB<T>): T | undefined
  function arrayTreeFind<S extends T>(
    array: T[],
    predicate: FindOptionsTyped<T, S>['predicate']
  ): S | undefined
  function arrayTreeFind<S extends T>(
    array: T[],
    options: WithoutBase<FindOptionsTyped<T, S>>
  ): S | undefined
  function arrayTreeFind(
    array: T[],
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ): T | undefined {
    const { predicate, ...options } =
      typeof predicateOrOptions === 'function'
        ? { predicate: predicateOrOptions }
        : predicateOrOptions

    const found = find(root, {
      ...options,
      getChildren: createGetChildren(array),
      predicate: (node, indexPath) => {
        if (node === root) return false
        return predicate(node, indexPath)
      },
    })

    return found as T | undefined
  }

  return {
    find: arrayTreeFind,
  }
}
