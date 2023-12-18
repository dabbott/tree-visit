import { defineEntriesTree } from './entriesTree'

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export const JSONTree = defineEntriesTree({
  getEntries(node: JSONValue) {
    if (typeof node === 'object' && node !== null) {
      return Object.entries(node)
    } else {
      return []
    }
  },
})
