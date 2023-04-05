import type { Knex } from 'knex'
import knex from 'knex'
import { useRuntimeConfig } from '#imports'

let db: Knex

export const getDb = (): Knex => {
  if (!db) {
    const dbConfig = useRuntimeConfig().hc.db
    db = knex({
      client: 'mysql',
      connection: {
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
      },
    })
  }

  return db
}
