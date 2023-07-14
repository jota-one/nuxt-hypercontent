import type { Knex } from 'knex'
import type { QueryValue } from 'ufo'
import { createError } from 'h3'

export const toInt = (queryValue: QueryValue | QueryValue[]): number =>
  parseInt((queryValue || '').toString())

export const toBoolean = (queryValue: QueryValue | QueryValue[]): boolean => {
  const value = (queryValue || '').toString()
  return !(value === 'false' || value === '0' || !value)
}

export const toSqlDate = (date: number) =>
  new Date(date).toISOString().slice(0, 19).replace('T', ' ')

// TODO: did not find a way to define a correct knex based return type but it would be worth investing time to implement it correctly. The any[] is the most simplistic return type for get queries...
export const secureQuery = async (
  query: () => Knex.QueryBuilder,
): Promise<any[]> => {
  let r
  try {
    r = await query()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)

    throw createError({
      statusCode: 500,
      statusMessage: 'Bad query',
      stack: '',
    })
  }
  return r
}

export const getNow = () => {
  let now = 'NOW()'

  const timeZoneOffset = new Date().getTimezoneOffset()

  if (timeZoneOffset) {
    now += ` ${timeZoneOffset < 0 ? '+' : '-'} INTERVAL ${Math.abs(
      timeZoneOffset,
    )} MINUTE`
  }

  return now
}
