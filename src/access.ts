import { IndexPath } from './indexPath'
import { BaseOptions, TraversalContext } from './options'

/**
 * Returns a node by its `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function get<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T | undefined {
  if (options.includeTraversalContext) {
    const accessed = _getPath(node, indexPath, options)
    return accessed[accessed.length - 1]
  }

  let path = indexPath.slice()

  while (path.length > 0) {
    let index = path.shift()!

    const children = options.getChildren(node, path)

    const child = children[index]

    if (!child) {
      return undefined
    }

    node = child
  }

  return node
}

/**
 * Returns an array of each node in an `IndexPath`, excluding the last node.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function ancestors<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T[] {
  return _getPath(node, indexPath, options).slice(0, -1)
}

function _getPath<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T[] {
  let path = indexPath.slice()
  let result: T[] = [node]

  while (path.length > 0) {
    let index = path.shift()!

    const context: TraversalContext<T> | undefined =
      options.includeTraversalContext ? makeTraversalContext(result) : undefined

    const children = options.getChildren(node, path, context)

    const child = children[index]

    if (!child) {
      return result
    }

    node = child
    result.push(node)
  }

  return result
}

/**
 * Returns a node by its `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function access<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T {
  if (options.includeTraversalContext) {
    const accessed = accessPath(node, indexPath, options)
    return accessed[accessed.length - 1]
  }

  let path = indexPath.slice()

  while (path.length > 0) {
    let index = path.shift()!
    node = options.getChildren(node, path)[index]
  }

  return node
}

/**
 * Returns an array of each node in an `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function accessPath<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T[] {
  let path = indexPath.slice()
  let result: T[] = [node]

  while (path.length > 0) {
    let index = path.shift()!

    const context: TraversalContext<T> | undefined =
      options.includeTraversalContext ? makeTraversalContext(result) : undefined

    node = options.getChildren(node, path, context)[index]
    result.push(node)
  }

  return result
}

function makeTraversalContext<T>(array: T[]): TraversalContext<T> {
  return {
    getRoot: () => array[0],
    getParent: () => array[array.length - 2],
    getAncestors: () => array.slice(0, -1),
  }
}
