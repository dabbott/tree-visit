import { IndexPath } from './indexPath'
import { BaseOptions } from './options'

export function access<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T {
  if (indexPath.length === 0) return node

  const children = options.getChildren(node, indexPath)

  return access(children[indexPath[0]], indexPath.slice(1), options)
}
