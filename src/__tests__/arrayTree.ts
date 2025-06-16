import { example, getChildren } from '../__mocks__/node'
import { defineArrayTree } from '../defineArrayTree'

const exampleArray = example.children!

it('finds node', () => {
  const Tree = defineArrayTree(getChildren)

  const result = Tree.find(exampleArray, {
    predicate: (node) => node.name === 'b1',
  })

  expect(result?.name).toEqual('b1')
})
