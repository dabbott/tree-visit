import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { visit } from './visit'

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
