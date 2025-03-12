import { IndexPath } from './indexPath'
import { KeyPath } from './types'

export function comparePathsByComponent<TPath extends IndexPath | KeyPath>(
  a: TPath,
  b: TPath
): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }

  // If all preceding components are equal, the shorter array comes first
  return a.length - b.length
}

export function sortPaths<TPath extends IndexPath | KeyPath>(
  indexPaths: TPath[]
): TPath[] {
  return [...indexPaths].sort(comparePathsByComponent)
}
