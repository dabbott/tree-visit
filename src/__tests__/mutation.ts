import {
  createCountGetChildren,
  example,
  getChildren,
  getLabel,
} from '../__mocks__/node'
import { diagram } from '../diagram'
import { insert, remove } from '../mutation'

describe('insert', () => {
  it('inserts node at start', () => {
    const result = insert(example, {
      at: [0],
      nodes: [{ name: 'x', indexPath: [] }],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts node in middle', () => {
    const result = insert(example, {
      at: [1],
      nodes: [{ name: 'x', indexPath: [] }],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts node at end', () => {
    const result = insert(example, {
      at: [2],
      nodes: [{ name: 'x', indexPath: [] }],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts nested node', () => {
    const result = insert(example, {
      at: [1, 1],
      nodes: [{ name: 'x', indexPath: [] }],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts multiple nodes', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = insert(example, {
      at: [0, 1],
      nodes: [
        { name: 'x', indexPath: [] },
        { name: 'y', indexPath: [] },
        { name: 'z', indexPath: [] },
      ],
      create: (node, children) => ({ ...node, children }),
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toBe(2)
  })
})

describe('remove', () => {
  it('removes node at start', () => {
    const result = remove(example, {
      indexPaths: [[0]],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes node at end', () => {
    const result = remove(example, {
      indexPaths: [[1]],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes nested node', () => {
    const result = remove(example, {
      indexPaths: [[1, 1]],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes multiple nodes', () => {
    const result = remove(example, {
      indexPaths: [[1], [0, 1], [0, 0]],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes multiple nodes with common ancestor', () => {
    const result = remove(example, {
      indexPaths: [[0, 1], [0]],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })
})
