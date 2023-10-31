import { Node, example } from '../__mocks__/node'
import { access } from '../access'
import { defineTree } from '../defineTree'
import { visit } from '../visit'

const getEntries = (node: Node) =>
  (node.children || []).map((n): [string, Node] => [n.name, n])

describe('keyed access', () => {
  it('accesses by key', () => {
    expect(
      access(example, {
        getEntries,
        path: ['b', 'b2'],
      }).name
    ).toEqual('b2')
  })

  it('visits by key', () => {
    const result: string[] = []

    visit(example, {
      getEntries,
      onEnter(node) {
        result.push(node.name)
      },
    })

    expect(result).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  })
})

describe('keyed partially applied', () => {
  const Tree = defineTree({ getEntries }).withOptions({
    getLabel: (node, keyPath) =>
      [example.name, ...keyPath].join('/') + ': ' + node.name,
  })

  it('renders diagram', () => {
    expect(Tree.diagram(example)).toMatchSnapshot()
  })
})
