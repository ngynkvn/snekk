import Database from 'better-sqlite3';
import path from 'path';
const db = new Database(path.resolve('/db/bot.db'), {
    fileMustExist: true
});



function query(sql, params) {
  return db.prepare(sql).all(params);
}

module.exports = {
  query
}