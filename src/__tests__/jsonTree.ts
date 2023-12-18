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

it('renames keys and modifies values', () => {
  const result = JSONTree.mapEntries(
    {
      foo: 'bar',
      baz: 'qux',
      nested: {
        a: 1,
        b: 2,
      },
    },
    (node, entries) => {
      if (entries.length === 0) {
        if (typeof node === 'number') {
          return node * 2
        }

        return node
      }

      const result = Object.fromEntries(
        entries.map(([key, value]) => [key.toUpperCase(), value])
      )

      return result
    }
  )

  // Double check key order, which isn't clear from the jest snapshot
  expect(Object.keys(result as any)).toEqual(['FOO', 'BAZ', 'NESTED'])

  expect(result).toMatchSnapshot()
})
