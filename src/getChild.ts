import { IndexPath, KeyPath } from './indexPath'
import { BaseEntriesOptions, BaseOptions } from './options'

export function getEntriesChild<T>(
  node: T,
  options: BaseEntriesOptions<T> & { keyPath: KeyPath; key: PropertyKey }
): T {
  if (options.getChild) {
    return options.getChild(node, options.keyPath, options.key)
  } else {
    const entries = options.getEntries(node, options.keyPath)
    const entry = entries.find(([k]) => k === options.key)
    return entry![1]
  }
}

export function convertChildrenToEntries<T>(
  options: BaseOptions<T>
): BaseEntriesOptions<T> {
  const { getChildren, ...rest } = options

  return {
    ...rest,
    getChild(parent, parentKeyPath, childKey) {
      return getChildren(parent, parentKeyPath as IndexPath)[childKey as number]
    },
    getEntries: (node, keyPath) => {
      return getChildren(node, keyPath as IndexPath).map((child, index) => [
        index,
        child,
      ])
    },
  }
}
