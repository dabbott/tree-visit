import { IndexPath } from '../indexPath'
import { DiagramOptions } from '../diagram'

enum BoxDrawing {
  TopLeft = '┌',
  TopRight = '┐',
  BottomLeft = '└',
  BottomRight = '┘',
  Horizontal = '─',
  Vertical = '│',
  BottomConnectorDown = '┬',
  BottomConnectorUp = '┴',
  TopConnectorUp = '┴',
}

type Box = {
  width: number
  height: number
  contents: string[]
}

function wrapLabelInBox(label: string) {
  const lines = label.split('\n')
  const length = Math.max(...lines.map((line) => line.length))
  const horizontalMargin = 1
  const width = length + horizontalMargin * 2 + 2
  const height = 2 + lines.length
  const diagram = [
    [
      BoxDrawing.TopLeft,
      BoxDrawing.Horizontal.repeat(length + horizontalMargin * 2),
      BoxDrawing.TopRight,
    ],
    ...lines.map((line) => [
      BoxDrawing.Vertical,
      ' '.repeat(horizontalMargin),
      line + (line.length < length ? ' '.repeat(length - line.length) : ''),
      ' '.repeat(horizontalMargin),
      BoxDrawing.Vertical,
    ]),
    [
      BoxDrawing.BottomLeft,
      BoxDrawing.Horizontal.repeat(length + horizontalMargin * 2),
      BoxDrawing.BottomRight,
    ],
  ]

  return {
    width,
    height,
    contents: diagram.map((parts) => parts.join('')),
  }
}

function mergeBoxesHorizontal(boxes: Box[]): Box {
  const horizontalMargin = 1

  if (boxes.length === 0) {
    throw new Error("Can't merge empty array of boxes")
  }

  return boxes.slice(1).reduce((result, box) => {
    const height = Math.max(result.height, box.height)
    const width = result.width + horizontalMargin + box.width
    const contents: string[] = []

    for (let i = 0; i < height; i++) {
      contents.push(
        (result.contents[i] || ' '.repeat(result.width)) +
          ' '.repeat(horizontalMargin) +
          (box.contents[i] || ' '.repeat(box.width))
      )
    }

    return { height, width, contents: centerBlock(contents, width) }
  }, boxes[0])
}

function mergeBoxesVertical(boxes: Box[]): Box {
  const verticalMargin = 1

  if (boxes.length === 0) {
    throw new Error("Can't merge empty array of boxes")
  }

  const width = Math.max(...boxes.map((box) => box.width))

  return boxes.slice(1).reduce((result, box) => {
    const height = result.height + verticalMargin + box.height
    const contents: string[] = []

    for (let i = 0; i < height; i++) {
      if (i < result.height) {
        contents.push(result.contents[i])
      } else if (i === result.height) {
        contents.push(' '.repeat(width))
      } else {
        contents.push(box.contents[i - result.height - 1])
      }
    }

    return { height, width, contents: centerBlock(contents, width) }
  }, boxes[0])
}

function nodeDiagram<T>(
  node: T,
  indexPath: IndexPath,
  options: DiagramOptions<T>
): Box {
  const label = options.getLabel(node, indexPath)
  const box = wrapLabelInBox(label)

  const children = options.getChildren(node, indexPath)

  if (children.length === 0) return box

  const childBoxes = children.map((child, index) => {
    const childBox = nodeDiagram(child, [...indexPath, index], options)

    // Draw top connector for each child
    childBox.contents[0] = insertSubstring(
      childBox.contents[0],
      centerIndex(childBox.contents[0].length),
      BoxDrawing.TopConnectorUp
    )

    return childBox
  })

  const result = mergeBoxesVertical([box, mergeBoxesHorizontal(childBoxes)])

  // Draw connectors
  const contents = result.contents
  const mid = centerIndex(result.width)

  contents[box.height - 1] = insertSubstring(
    contents[box.height - 1],
    mid,
    BoxDrawing.BottomConnectorDown
  )

  let min = contents[box.height + 1].indexOf(BoxDrawing.TopConnectorUp)
  let max = contents[box.height + 1].lastIndexOf(BoxDrawing.TopConnectorUp)

  for (let i = min; i <= max; i++) {
    let character: string

    if (i === mid) {
      character =
        childBoxes.length > 1
          ? BoxDrawing.BottomConnectorUp
          : BoxDrawing.Vertical
    } else if (i === min) {
      character = BoxDrawing.TopLeft
    } else if (i === max) {
      character = BoxDrawing.TopRight
    } else {
      character = BoxDrawing.Horizontal
    }

    result.contents[box.height] = insertSubstring(
      result.contents[box.height],
      i,
      character
    )
  }

  return result
}

export function boxDiagram<T>(node: T, options: DiagramOptions<T>): string {
  return nodeDiagram(node, [], options).contents.join('\n')
}

function centerIndex(width: number): number {
  return Math.floor(width / 2)
}

function centerLine(line: string, width: number): string {
  const remainder = width - line.length

  if (remainder <= 0) return line

  const prefixLength = centerIndex(remainder)
  const suffixLength = centerIndex(remainder)
  const result = ' '.repeat(prefixLength) + line + ' '.repeat(suffixLength)

  return prefixLength + suffixLength + result.length < width
    ? result + ' '
    : result
}

function centerBlock(lines: string[], width: number): string[] {
  return lines.map((line) => centerLine(line, width))
}

function insertSubstring(string: string, index: number, substring: string) {
  if (index > string.length - 1) return string

  return string.substring(0, index) + substring + string.substring(index + 1)
}
