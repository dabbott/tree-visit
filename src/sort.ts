import { IndexPath } from './indexPath'

export function compareIndexPaths(a: IndexPath, b: IndexPath): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }

  // If all preceding numbers are equal, the shorter array comes first
  return a.length - b.length
}

export function sortIndexPaths(indexPaths: IndexPath[]): IndexPath[] {
  return indexPaths.sort(compareIndexPaths)
}
