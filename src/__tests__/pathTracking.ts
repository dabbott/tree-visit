import { createNode, example, getChildren } from '../__mocks__/node'
import { insertWithPathTracking } from '../insert'
import { removeWithPathTracking } from '../remove'
import { spliceWithPathTracking } from '../splice'

const x = { name: 'x', indexPath: [] }

describe('insert', () => {
  it('insert before', () => {
    const result = insertWithPathTracking(example, {
      at: [0],
      nodes: [x],
      create: createNode,
      getChildren,
      track: [[0]],
    })

    expect(result.paths).toEqual([[1]])
  })

  it('insert multiple nodes', () => {
    const result = insertWithPathTracking(example, {
      at: [0],
      nodes: [x, x],
      create: createNode,
      getChildren,
      track: [[1]],
    })

    expect(result.paths).toEqual([[3]])
  })

  it('insert nested', () => {
    const result = insertWithPathTracking(example, {
      at: [1, 0],
      nodes: [x],
      create: createNode,
      getChildren,
      track: [[1, 1]],
    })

    expect(result.paths).toEqual([[1, 2]])
  })
})

describe('remove', () => {
  it('removes self', () => {
    const result = removeWithPathTracking(example, {
      paths: [[0]],
      track: [[0]],
      create: createNode,
      getChildren,
    })

    expect(result.paths).toEqual([undefined])
  })

  it('removes before', () => {
    const result = removeWithPathTracking(example, {
      paths: [[0]],
      track: [[1]],
      create: createNode,
      getChildren,
    })

    expect(result.paths).toEqual([[0]])
  })

  it('remove multiple', () => {
    const result = removeWithPathTracking(example, {
      paths: [[0], [1]],
      track: [[2]],
      create: createNode,
      getChildren,
    })

    expect(result.paths).toEqual([[0]])
  })

  it('remove multiple reverse', () => {
    const result = removeWithPathTracking(example, {
      paths: [[1], [0]],
      track: [[2]],
      create: createNode,
      getChildren,
    })

    expect(result.paths).toEqual([[0]])
  })

  it('remove and track deeper', () => {
    const result = removeWithPathTracking(example, {
      paths: [[1, 0]],
      track: [[1, 1, 1]],
      create: createNode,
      getChildren,
    })

    expect(result.paths).toEqual([[1, 0, 1]])
  })
})

describe('splice', () => {
  it('splice', () => {
    const result = spliceWithPathTracking(example, {
      path: [0],
      deleteCount: 2,
      nodes: [x, x, x],
      create: createNode,
      getChildren,
      track: [[0], [1], [2]],
    })

    expect(result.paths).toEqual([undefined, undefined, [3]])
  })

  it('splices node with path tracking', () => {
    const result = spliceWithPathTracking(example, {
      path: [0],
      deleteCount: 1,
      nodes: [{ name: 'x', indexPath: [] }],
      track: [[1, 0]],
      getChildren,
      create: createNode,
    })

    expect(result.paths).toEqual([[1, 0]])
  })
})
