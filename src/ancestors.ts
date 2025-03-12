import { IndexPath } from './indexPath'
import { comparePathsByComponent } from './sort'
import { KeyPath } from './types'

type AncestorPathsOptions<TPath extends KeyPath | IndexPath> = {
  /**
   * The function to use to compare the paths.
   *
   * Returns a number that is less than 0 if `a` should come before `b`,
   * 0 if they are equal, and greater than 0 if `a` should come after `b`.
   *
   * @default comparePathsByComponent
   */
  compare?: (a: TPath, b: TPath) => number
}

/**
 * This function cleans up the `indexPaths` array by
 *
 * 1. sorting the `indexPaths`
 * 2. removing any `indexPaths` that are descendants of other `indexPaths`
 * 3. removing any `indexPaths` that are duplicates
 */
export function ancestorPaths<TPath extends KeyPath | IndexPath>(
  paths: TPath[],
  options?: AncestorPathsOptions<TPath>
): TPath[] {
  const result = new Map<string, TPath>()
  const compare = options?.compare ?? comparePathsByComponent

  const sortedIndexPaths = paths.sort(compare)

  for (const indexPath of sortedIndexPaths) {
    const foundParent = indexPath.some((_, index) => {
      const parentKey = indexPath.slice(0, index).join()

      return result.has(parentKey)
    })

    if (foundParent) continue

    result.set(indexPath.join(), indexPath)
  }

  return Array.from(result.values())
}
