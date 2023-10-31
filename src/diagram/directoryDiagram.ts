import { DiagramEntriesOptions } from '../diagram'

enum LinePrefix {
  Child = `├── `,
  LastChild = `└── `,
  NestedChild = `│   `,
  LastNestedChild = `    `,
}

type Line = {
  label: string
  depth: number
  prefix: string
  multilinePrefix: string
}

function nodeDiagram<T, PK extends PropertyKey>(
  node: T,
  keyPath: PK[],
  options: DiagramEntriesOptions<T, PK>
): Line[] {
  const label = options.getLabel(node, keyPath)
  const depth = keyPath.length

  let rootLine = { label, depth, prefix: '', multilinePrefix: '' }

  const entries = options.getEntries(node, keyPath)

  if (entries.length === 0) return [rootLine]

  // Special-case nodes with a single child, collapsing their labels to a single line
  if (
    options.flattenSingleChildNodes &&
    entries.length === 1 &&
    !isMultiline(label)
  ) {
    const [key, entry] = entries[0]
    const [line] = nodeDiagram(entry, [...keyPath, key], options)
    const hideRoot = keyPath.length === 0 && label === ''
    rootLine.label = hideRoot
      ? `/ ${line.label}`
      : `${rootLine.label} / ${line.label}`
    return [rootLine]
  }

  const nestedLines: Line[] = entries.flatMap(([key, entry], index, array) => {
    const childIsLast = index === array.length - 1
    const childLines = nodeDiagram(entry, [...keyPath, key], options)
    const childPrefix = childIsLast ? LinePrefix.LastChild : LinePrefix.Child
    const childMultilinePrefix = childIsLast
      ? LinePrefix.LastNestedChild
      : LinePrefix.NestedChild

    childLines.forEach((line) => {
      if (line.depth === depth + 1) {
        line.prefix = childPrefix + line.prefix
        line.multilinePrefix = childMultilinePrefix + line.multilinePrefix
      } else if (childIsLast) {
        line.prefix = LinePrefix.LastNestedChild + line.prefix
        line.multilinePrefix = LinePrefix.LastNestedChild + line.multilinePrefix
      } else {
        line.prefix = LinePrefix.NestedChild + line.prefix
        line.multilinePrefix = LinePrefix.NestedChild + line.multilinePrefix
      }
    })

    return childLines
  })

  return [rootLine, ...nestedLines]
}

export function directoryDiagram<T, PK extends PropertyKey>(
  node: T,
  options: DiagramEntriesOptions<T, PK>
): string {
  const lines = nodeDiagram(node, [], options)
  const strings = lines.map((line) =>
    prefixBlock(line.label, line.prefix, line.multilinePrefix)
  )
  return strings.join('\n')
}

export function isMultiline(line: string): boolean {
  return line.includes('\n')
}

export function prefixBlock(
  block: string,
  prefix: string,
  multilinePrefix: string
): string {
  if (!isMultiline(block)) return prefix + block

  return block
    .split('\n')
    .map((line, index) => (index === 0 ? prefix : multilinePrefix) + line)
    .join('\n')
}
