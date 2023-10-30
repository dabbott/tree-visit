import { IndexPath, KeyPath } from './indexPath'
import { BaseEntriesOptions, BaseOptions } from './options'

export function getChild<T>(
  node: T,
  options:
    | (BaseEntriesOptions<T> & { keyPath: KeyPath; key: string })
    | (BaseOptions<T> & { indexPath: IndexPath; index: number })
): T {
  if ('getEntries' in options) {
    if (options.getChild) {
      return options.getChild(node, options.keyPath, options.key)
    } else {
      const entries = options.getEntries(node, options.keyPath)
      const entry = entries.find(([k]) => k === options.key)
      return entry![1]
    }
  } else {
    return options.getChildren(node, options.indexPath)[options.index]
  }
}
