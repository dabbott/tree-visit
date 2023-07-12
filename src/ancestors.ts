import { IndexPath } from './indexPath'
import { sortIndexPaths } from './sort'

/**
 * This function cleans up the `indexPaths` array by
 *
 * 1. sorting the `indexPaths`
 * 2. removing any `indexPaths` that are descendants of other `indexPaths`
 * 3. removing any `indexPaths` that are duplicates
 */
export function ancestorIndexPaths(indexPaths: IndexPath[]): IndexPath[] {
  const paths = new Map<string, IndexPath>()

  const sortedIndexPaths = sortIndexPaths(indexPaths)

  for (const indexPath of sortedIndexPaths) {
    const foundParent = indexPath.some((_, index) => {
      const parentKey = indexPath.slice(0, index).join()

      return paths.has(parentKey)
    })

    if (foundParent) continue

    paths.set(indexPath.join(), indexPath)
  }

  return Array.from(paths.values())
}
