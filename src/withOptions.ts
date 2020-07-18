import { BaseOptions } from './options'
import { visit, VisitOptions } from './visit'
import { IndexPath } from './indexPath'
import { access, accessPath } from './access'
import { find, findAll, findIndexPath, FindOptions } from './find'

export type WithOptions<T> = {
  access(node: T, indexPath: IndexPath): T
  accessPath(node: T, indexPath: IndexPath): T[]
  find(node: T, options: FindOptions<T>['predicate']): T | undefined
  find(
    node: T,
    options: Omit<FindOptions<T>, keyof BaseOptions<T>>
  ): T | undefined
  findAll(node: T, options: FindOptions<T>['predicate']): T[]
  findAll(node: T, options: Omit<FindOptions<T>, keyof BaseOptions<T>>): T[]
  findIndexPath(
    node: T,
    options: FindOptions<T>['predicate']
  ): IndexPath | undefined
  findIndexPath(
    node: T,
    options: Omit<FindOptions<T>, keyof BaseOptions<T>>
  ): IndexPath | undefined
  visit(node: T, options: NonNullable<VisitOptions<T>>['onEnter']): void
  visit(node: T, options: Omit<VisitOptions<T>, keyof BaseOptions<T>>): void
}

/**
 * Return every tree utility function with options partially applied.
 *
 * @param baseOptions
 */
export function withOptions<T>(baseOptions: BaseOptions<T>): WithOptions<T> {
  return {
    access: (node, indexPath) => access(node, indexPath, baseOptions),
    accessPath: (node, indexPath) => accessPath(node, indexPath, baseOptions),
    find: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | Omit<FindOptions<T>, keyof BaseOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? find(node, { ...baseOptions, predicate: predicateOrOptions })
        : find(node, { ...baseOptions, ...predicateOrOptions }),
    findAll: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | Omit<FindOptions<T>, keyof BaseOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? findAll(node, { ...baseOptions, predicate: predicateOrOptions })
        : findAll(node, { ...baseOptions, ...predicateOrOptions }),
    findIndexPath: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | Omit<FindOptions<T>, keyof BaseOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? findIndexPath(node, { ...baseOptions, predicate: predicateOrOptions })
        : findIndexPath(node, { ...baseOptions, ...predicateOrOptions }),
    visit: (
      node: T,
      predicateOrOptions:
        | NonNullable<VisitOptions<T>>['onEnter']
        | Omit<VisitOptions<T>, keyof BaseOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? visit(node, { ...baseOptions, onEnter: predicateOrOptions })
        : visit(node, { ...baseOptions, ...predicateOrOptions }),
  }
}
