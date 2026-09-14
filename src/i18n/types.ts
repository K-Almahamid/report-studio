import type { enMessages } from './en/messages'

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>
}

export type Messages = DeepStringRecord<typeof enMessages>

export type Language = 'en' | 'ar'

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never

type Leaves<T, D extends number = 6> = [D] extends [never]
  ? never
  : T extends string
    ? never
    : {
        [K in keyof T]-?: K extends string
          ? T[K] extends string
            ? K
            : Join<K, Leaves<T[K], Prev[D]>>
          : never
      }[keyof T]

type Prev = [never, 0, 1, 2, 3, 4, 5, 6]

export type TranslationKey = Leaves<typeof enMessages>

export type TranslateParams = Record<string, string | number>
