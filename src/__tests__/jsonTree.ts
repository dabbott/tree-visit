import { resolveIndexPath } from '../entriesTree'
import { JSONTree, JSONValue } from '../jsonTree'

it('resolves index path', () => {
  const map = new Map<string, string>([
    ['0', 'foo'],
    ['0.0', 'bar'],
    ['0.0.0', 'baz'],
    ['0.0.1', 'qux'],
    ['0.1', 'quux'],
    ['1', 'corge'],
  ])

  expect(resolveIndexPath(map, [])).toEqual([])
  expect(resolveIndexPath(map, [0])).toEqual(['foo'])
  expect(resolveIndexPath(map, [0, 0])).toEqual(['foo', 'bar'])
  expect(resolveIndexPath(map, [0, 0, 0])).toEqual(['foo', 'bar', 'baz'])
  expect(resolveIndexPath(map, [0, 0, 1])).toEqual(['foo', 'bar', 'qux'])
  expect(resolveIndexPath(map, [0, 1])).toEqual(['foo', 'quux'])
  expect(resolveIndexPath(map, [1])).toEqual(['corge'])
})

it('displays json tree diagram', () => {
  expect(
    JSONTree.diagram(
      {
        null: null,
        boolean: true,
        number: 42,
        string: 'hello',
        multilineString: 'line1\nline2',
        array: [1, 2, 3],
        object: { foo: 'bar', baz: { qux: 'quux' } },
      },
      {
        getLabel,
      }
    )
  ).toMatchSnapshot()
})

it('finds node', () => {
  const node = {
    foo: {
      bar: {
        baz: 'hello',
      },
    },
  }

  const result = JSONTree.find(node, {
    predicate: (node, path) => {
      return path.join('.') === 'foo.bar'
    },
  })

  expect(result).toEqual({ baz: 'hello' })
})

function getLabel(node: JSONValue, keyPath: string[]) {
  // console.log({ node, keyPath })
  const key = keyPath[keyPath.length - 1]
  const text = printJSONValue(node)
  return `${key === undefined ? text : key + ': ' + text} [${keyPath.join(
    '/'
  )}]`
}

function printJSONValue(value: JSONValue): string {
  if (typeof value === 'object' && value !== null) {
    return `<${Object.prototype.toString.call(value).slice(8, -1)}>`
  } else {
    return JSON.stringify(value)
  }
}
