import { defineEventHandler } from 'h3'
import { TABLE } from '../constants'
import { getDb } from '../helpers/db'
import { secureQuery } from '../helpers/sql'

type LangRecord = {
  id: number
  code: string
  label: string
  is_default: boolean
  sort: number
}
export default defineEventHandler(async () => {
  const db = await getDb()

  const getLangs = () =>
    secureQuery(() =>
      db(TABLE.LANGS)
        .select('id', 'code', 'label', 'is_default', 'sort')
        .orderBy('sort', 'asc'),
    )

  const res = {
    langs: (await getLangs()).map((lang: LangRecord) => ({
      ...lang,
      is_default: Boolean(lang.is_default),
    })),
  }
  return res
})
