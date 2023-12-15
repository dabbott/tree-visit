import { defineTree } from '../defineTree'

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export const JSONTree = defineTree({
  getEntries(node: JSONValue) {
    if (typeof node === 'object' && node !== null) {
      return Object.entries(node)
    } else {
      return []
    }
  },
}).withOptions({
  getLabel(node, keyPath) {
    const key = keyPath[keyPath.length - 1]
    const text = printJSONValue(node)
    return key === undefined ? text : key + ': ' + text
  },
})

function printJSONValue(value: JSONValue): string {
  if (typeof value === 'object' && value !== null) {
    return `<${Object.prototype.toString.call(value).slice(8, -1)}>`
  } else {
    return JSON.stringify(value)
  }
}
