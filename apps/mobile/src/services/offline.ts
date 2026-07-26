import * as SQLite from 'expo-sqlite';
let dbPromise: ReturnType<typeof SQLite.openDatabaseAsync> | undefined;
const db=()=>dbPromise??=SQLite.openDatabaseAsync('novel-reader.db');
export async function initOffline(){const x=await db(); await x.execAsync(`CREATE TABLE IF NOT EXISTS chapters(id TEXT PRIMARY KEY,book_id TEXT,title TEXT,content_json TEXT,updated_at TEXT); CREATE TABLE IF NOT EXISTS sync_queue(id TEXT PRIMARY KEY,kind TEXT,payload TEXT,updated_at TEXT);`)}
export async function cacheChapters(chapters:any[]){const x=await db(); await x.withTransactionAsync(async()=>{for(const c of chapters) await x.runAsync('INSERT OR REPLACE INTO chapters VALUES(?,?,?,?,?)',c.id,c.book_id,c.title,JSON.stringify(c.content_json),c.updated_at)})}
export async function queueOffline(kind:string,payload:unknown){const x=await db(); const now=new Date().toISOString(); await x.runAsync('INSERT OR REPLACE INTO sync_queue VALUES(?,?,?,?)',`${kind}:${Date.now()}`,kind,JSON.stringify(payload),now)}
export async function pendingSync(){const x=await db(); return x.getAllAsync<{id:string;kind:string;payload:string;updated_at:string}>('SELECT * FROM sync_queue ORDER BY updated_at')}
