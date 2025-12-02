import { IndexPath } from './indexPath.js'
import { BaseOptions } from './options.js'
import { visit } from './visit.js'

export function entries<T>(node: T, options: BaseOptions<T>): [IndexPath, T][] {
  let result: [IndexPath, T][] = []

  visit(node, {
    ...options,
    onEnter: (item, indexPath) => {
      result.push([indexPath, item])
    },
  })

  return result
}
