import { BaseOptions } from './options'
import { visit, VisitOptions } from './visit'
import { IndexPath } from './indexPath'
import { access, accessPath } from './access'
import { find, findAll, findIndexPath, FindOptions } from './find'

export type WithOptions<T> = {
  visit(node: T, options: Omit<VisitOptions<T>, keyof BaseOptions<T>>): void
  access(node: T, indexPath: IndexPath): T
  accessPath(node: T, indexPath: IndexPath): T[]
  find(
    node: T,
    options: Omit<FindOptions<T>, keyof BaseOptions<T>>
  ): T | undefined
  findAll(node: T, options: Omit<FindOptions<T>, keyof BaseOptions<T>>): T[]
  findIndexPath(
    node: T,
    options: Omit<FindOptions<T>, keyof BaseOptions<T>>
  ): IndexPath | undefined
}

/**
 * Return every tree utility function with options partially applied.
 *
 * @param baseOptions
 */
export function withOptions<T>(baseOptions: BaseOptions<T>): WithOptions<T> {
  return {
    visit: (node, options) => visit(node, { ...baseOptions, ...options }),
    access: (node, indexPath) => access(node, indexPath, baseOptions),
    accessPath: (node, indexPath) => accessPath(node, indexPath, baseOptions),
    find: (node, options) => find(node, { ...baseOptions, ...options }),
    findAll: (node, options) => findAll(node, { ...baseOptions, ...options }),
    findIndexPath: (node, options) =>
      findIndexPath(node, { ...baseOptions, ...options }),
  }
}
