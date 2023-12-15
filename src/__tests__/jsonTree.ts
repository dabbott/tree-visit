import { JSONTree } from '../trees/JSONTree'

it('displays json tree diagram', () => {
  expect(
    JSONTree.diagram({
      null: null,
      boolean: true,
      number: 42,
      string: 'hello',
      multilineString: 'line1\nline2',
      array: [1, 2, 3],
      object: { foo: 'bar' },
    })
  ).toMatchSnapshot()
})
