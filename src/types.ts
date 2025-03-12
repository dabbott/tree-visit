export type KeyPath = string[]

export type ExtractRequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

export type OptionCheck<
  AppliedOptions,
  OptionKey extends string,
  R extends { [K in OptionKey]: any }
> = AppliedOptions extends Record<OptionKey, any>
  ? { [K in OptionKey]?: R[K] }
  : { [K in OptionKey]: R[K] }

/**
 * Improve the type displayed in tooltips by flattening utility types.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
