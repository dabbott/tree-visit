import { IndexPath } from './indexPath'
import { comparePathsByComponent } from './sort'

type TransformPathOperation = 'insert' | 'remove'

export function transformPath<TOperation extends TransformPathOperation>(
  path: IndexPath,
  operation: TOperation,
  otherPath: IndexPath
): TOperation extends 'insert' ? IndexPath : IndexPath | undefined {
  if (
    otherPath.length <= path.length &&
    comparePathsByComponent(otherPath, path) <= 0
  ) {
    if (otherPath.length === 0 && operation === 'remove') {
      return undefined as unknown as IndexPath
    }
    const adjustmentIndex = otherPath.length - 1

    const prefixIsEqual =
      comparePathsByComponent(
        otherPath.slice(0, adjustmentIndex),
        path.slice(0, adjustmentIndex)
      ) === 0

    if (prefixIsEqual) {
      if (operation === 'insert') {
        const newPath = [...path]

        newPath[adjustmentIndex]++

        return newPath
      } else if (operation === 'remove') {
        if (
          otherPath.length < path.length ||
          comparePathsByComponent(otherPath, path) === 0
        ) {
          return undefined as unknown as IndexPath
        }

        const newPath = [...path]

        newPath[adjustmentIndex]--

        return newPath
      }
    }
  }

  return path
}
