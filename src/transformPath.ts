import { IndexPath } from './indexPath'
import { comparePathsByComponent } from './sort'

type TransformPathOperation = 'insert' | 'remove'

function commonAncestor(path: IndexPath, otherPath: IndexPath): IndexPath {
  const length = Math.min(path.length, otherPath.length)

  for (let i = 0; i < length; i++) {
    if (path[i] !== otherPath[i]) {
      return path.slice(0, i)
    }
  }

  return path.slice(0, length)
}

export function transformPath<TOperation extends TransformPathOperation>(
  path: IndexPath,
  operation: TOperation,
  otherPath: IndexPath,
  count = 1
): TOperation extends 'insert' ? IndexPath : IndexPath | undefined {
  if (
    otherPath.length > path.length ||
    comparePathsByComponent(otherPath, path) > 0
  ) {
    return path
  }

  if (otherPath.length === 0 && operation === 'remove') {
    return undefined as unknown as IndexPath
  }

  const common = commonAncestor(path, otherPath)
  const adjustmentIndex =
    common.length === path.length || common.length === otherPath.length
      ? common.length - 1
      : common.length
  const pathValue = path[adjustmentIndex]
  const otherPathValue = otherPath[adjustmentIndex]

  if (operation === 'insert' && otherPathValue <= pathValue) {
    const newPath = [...path]

    newPath[adjustmentIndex] += count

    return newPath
  } else if (operation === 'remove') {
    if (otherPathValue === pathValue) {
      return undefined as unknown as IndexPath
    } else if (otherPathValue < pathValue) {
      const newPath = [...path]

      newPath[adjustmentIndex] -= count

      return newPath
    }
  }

  return path
}
