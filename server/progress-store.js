// تنها جایی که node:sqlite را می‌شناسد. یک جدول، یک ردیف به‌ازای هر
// (ایمیل، موضوع)، و read_ids همان رشته‌ای که localStorage نگه می‌دارد —
// پس بین دو طرف هیچ تبدیلی لازم نیست.
import { DatabaseSync } from 'node:sqlite';
import { parseProgress, serializeProgress } from '../assets/js/roadmap.js';

export function openStore(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      email      TEXT NOT NULL,
      topic_id   TEXT NOT NULL,
      read_ids   TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (email, topic_id)
    )
  `);

  const selectAll = db.prepare('SELECT topic_id, read_ids FROM progress WHERE email = ?');
  const selectOne = db.prepare('SELECT read_ids FROM progress WHERE email = ? AND topic_id = ?');
  const upsert = db.prepare(`
    INSERT INTO progress (email, topic_id, read_ids, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(email, topic_id) DO UPDATE SET
      read_ids = excluded.read_ids,
      updated_at = excluded.updated_at
  `);

  return {
    getAll(email) {
      const result = {};
      for (const row of selectAll.all(email)) {
        result[row.topic_id] = [...parseProgress(row.read_ids)];
      }
      return result;
    },
    put(email, topicId, readIds, now) {
      upsert.run(email, topicId, serializeProgress(new Set(readIds)), now);
    },
    /** خواندن و نوشتن پشت سر هم و همگام است، پس بین آن دو درخواست دیگری نمی‌نشیند. */
    applyDelta(email, topicId, add, remove, now) {
      const row = selectOne.get(email, topicId);
      const set = parseProgress(row?.read_ids);
      for (const id of add) set.add(id);
      for (const id of remove) set.delete(id);
      upsert.run(email, topicId, serializeProgress(set), now);
    },
    close() {
      db.close();
    },
  };
}
