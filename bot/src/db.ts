import Database from 'better-sqlite3';
import path from 'path';
import {log} from './log';

export const db = new Database(path.resolve('/db/bot.db'), {
    fileMustExist: true
});
log.info("Database connected", db.name)

export function query(sql: any, params: any) {
  return db.prepare(sql).all(params);
}