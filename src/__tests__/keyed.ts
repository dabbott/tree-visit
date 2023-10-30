import { Node, example } from '../__mocks__/node'
import { access } from '../access'

const getEntries = (node: Node) =>
  (node.children || []).map((n): [string, Node] => [n.name, n])

describe('keyed access', () => {
  it('accesses by key', () => {
    expect(
      access(example, {
        getEntries,
        keyPath: ['b', 'b2'],
      }).name
    ).toEqual('b2')
  })
})
