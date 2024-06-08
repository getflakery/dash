import { createClient as createLibSQLClient } from '@libsql/client/http'
import { drizzle as drizzleLibSQL, LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
// @ts-ignore
import Database from 'better-sqlite3'
import { join } from 'pathe'

export * as tables from '~/server/database/schema'

let _db: BetterSQLite3Database | LibSQLDatabase | null = null

export const useDB = () => {
  const config = useRuntimeConfig()

  if (!_db) {

    if (config.db_url && config.turso_token) {
      _db = drizzleLibSQL(createLibSQLClient({
        url: config.db_url,
        authToken: config.turso_token,
      }))
    } else {
      // local sqlite in development
      const sqlite = new Database(join(process.cwd(), './db.sqlite'))
      _db = drizzle(sqlite)
    } 

  }
  return _db
}

