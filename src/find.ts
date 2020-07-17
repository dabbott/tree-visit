import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { visit, STOP } from './visit'

type FindOptions<T> = BaseOptions<T> & {
  predicate: (node: T, indexPath: IndexPath) => boolean
}

export function find<T>(node: T, options: FindOptions<T>): T | undefined {
  let found: T | undefined

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = child
        return STOP
      }
    },
    getChildren: options.getChildren,
  })

  return found
}

export function findAll<T>(node: T, options: FindOptions<T>): T[] {
  let found: T[] = []

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found.push(child)
      }
    },
    getChildren: options.getChildren,
  })

  return found
}

export function findIndexPath<T>(
  node: T,
  options: FindOptions<T>
): IndexPath | undefined {
  let found: IndexPath | undefined

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        // Copy the indexPath, since indexPath may be mutated
        found = [...indexPath]
        return STOP
      }
    },
    getChildren: options.getChildren,
  })

  return found
}
