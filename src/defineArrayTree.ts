import { ApplyableOptions, FindOptionsWB } from './defineTree'
import { find, FindOptions, FindOptionsTyped } from './find'
import { IndexPath } from './indexPath'
import { BaseOptions, TraversalContext } from './options'

type Overloads<T> = {
  find: {
    (array: T[], predicate: FindOptions<T>['predicate']): T | undefined
    (array: T[], options: FindOptionsWB<T>): T | undefined
    <S extends T>(
      array: T[],
      predicate: FindOptionsTyped<T, S>['predicate']
    ): S | undefined
    <S extends T>(
      array: T[],
      predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
    ): S | undefined
  }
}

class ArrayTree<T, AppliedOptions extends Partial<ApplyableOptions<T>>> {
  root = Symbol('root')

  get _t(): T | typeof this.root {
    throw new Error('Not implemented')
  }

  _isRoot(node: T | typeof this.root): node is typeof this.root {
    return node === this.root
  }

  constructor(
    getChildrenOrBaseOptions: BaseOptions<T> | BaseOptions<T>['getChildren'],
    public appliedOptions: AppliedOptions
  ) {
    const baseOptions: BaseOptions<T> =
      typeof getChildrenOrBaseOptions === 'function'
        ? { getChildren: getChildrenOrBaseOptions }
        : getChildrenOrBaseOptions

    this.baseOptions = baseOptions
  }

  createGetChildren =
    (array: T[]) =>
    (
      node: typeof this._t,
      indexPath: IndexPath,
      context?: TraversalContext<T>
    ): T[] =>
      this._isRoot(node)
        ? array
        : this.baseOptions.getChildren(
            node,
            indexPath,
            context as TraversalContext<T>
          )

  baseOptions: BaseOptions<T>

  mergeOptions = <O extends Record<string, any>>(
    options: O
  ): BaseOptions<T> & AppliedOptions & O => ({
    ...this.baseOptions,
    ...this.appliedOptions,
    ...options,
  })

  find: Overloads<T>['find'] = (
    array: T[],
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ) => {
    const options =
      typeof predicateOrOptions === 'function'
        ? this.mergeOptions({ predicate: predicateOrOptions })
        : this.mergeOptions(predicateOrOptions)

    const found = find(this.root as T, {
      ...options,
      getChildren: this.createGetChildren(array),
      predicate: (node, indexPath) => {
        if (this._isRoot(node)) return false
        return options.predicate(node, indexPath)
      },
    })

    return found as T | undefined
  }
}

export const defineArrayTree = <T>(
  getChildren: BaseOptions<T> | BaseOptions<T>['getChildren']
) => {
  return new ArrayTree(getChildren, {})
}
