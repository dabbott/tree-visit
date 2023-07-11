import { example, getChildren, getLabel } from '../__mocks__/node'
import { diagram } from '../diagram'
import { insert } from '../mutation'

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
    const result = insert(example, {
      at: [0, 1],
      nodes: [
        { name: 'x', indexPath: [] },
        { name: 'y', indexPath: [] },
        { name: 'z', indexPath: [] },
      ],
      create: (node, children) => ({ ...node, children }),
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })
})
