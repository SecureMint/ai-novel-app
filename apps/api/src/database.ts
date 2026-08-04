import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { books as seedBooks, chapters as seedChapters } from "./data.js";

export type DbBook = (typeof seedBooks)[number];

const defaultPath = fileURLToPath(new URL("../data/novel.db", import.meta.url));

export function createDatabase(filename = process.env.DATABASE_PATH || defaultPath) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      score REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(book_id, chapter_number)
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_bookshelves (
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(user_id, book_id)
    );
    CREATE TABLE IF NOT EXISTS user_histories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_annotations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      selected_text TEXT NOT NULL,
      annotation_text TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  const insertBook = db.prepare("INSERT OR IGNORE INTO books VALUES (?, ?, ?, ?, ?)");
  const insertChapter = db.prepare("INSERT OR IGNORE INTO chapters VALUES (?, ?, ?, ?, ?, ?)");
  for (const book of seedBooks)
    insertBook.run(book.id, book.title, book.author, JSON.stringify(book.tags), book.score);
  for (const chapter of seedChapters)
    insertChapter.run(
      chapter.id,
      chapter.book_id,
      chapter.chapter_number,
      chapter.title,
      JSON.stringify(chapter.content_json),
      chapter.updated_at,
    );

  return {
    filename,
    health() {
      const row = db.prepare("SELECT COUNT(*) AS bookCount FROM books").get() as {
        bookCount: number;
      };
      return {
        connected: true,
        engine: "sqlite",
        bookCount: Number(row.bookCount),
        filename,
      };
    },
    books(): DbBook[] {
      const rows = db
        .prepare("SELECT id, title, author, tags_json, score FROM books ORDER BY id")
        .all() as Array<{
        id: string;
        title: string;
        author: string;
        tags_json: string;
        score: number;
      }>;
      return rows.map(row => ({
        ...seedBooks.find(book => book.id === row.id)!,
        id: row.id,
        title: row.title,
        author: row.author,
        tags: JSON.parse(row.tags_json),
        score: row.score,
      }));
    },
    chapters(bookId: string) {
      const rows = db
        .prepare("SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_number")
        .all(bookId) as Array<Record<string, unknown> & { content_json: string }>;
      return rows.map(row => ({
        ...row,
        content_json: JSON.parse(row.content_json),
      }));
    },
    ensureUser(id: string, username: string) {
      db.prepare("INSERT OR IGNORE INTO users VALUES (?, ?, ?)").run(
        id,
        username,
        new Date().toISOString(),
      );
    },
    addShelf(userId: string, bookId: string) {
      db.prepare(
        "INSERT INTO user_bookshelves VALUES (?, ?, ?) ON CONFLICT(user_id, book_id) DO UPDATE SET updated_at = excluded.updated_at",
      ).run(userId, bookId, new Date().toISOString());
    },
    batchShelf(userId: string, bookIds: string[], action: string) {
      if (action === "delete") {
        const statement = db.prepare(
          "DELETE FROM user_bookshelves WHERE user_id = ? AND book_id = ?",
        );
        for (const bookId of bookIds) statement.run(userId, bookId);
      }
      return bookIds.length;
    },
    deleteHistory(id: string) {
      db.prepare("DELETE FROM user_histories WHERE id = ?").run(id);
    },
    close() {
      db.close();
    },
  };
}
