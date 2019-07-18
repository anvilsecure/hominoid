use rusqlite::types::ToSql;
use rusqlite::{Connection, Result, NO_PARAMS, params};

use crate::imghash::ImageHash;

pub fn open() -> Result<Connection> {
    let path = "test.db";
    let conn = Connection::open(&path)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS entries 
          (id INTEGER PRIMARY KEY AUTOINCREMENT,
           url TEXT, 
           d_hash_hi INTEGER,
           d_hash_lo INTEGER,
           a_hash_hi INTEGER,
           a_hash_lo INTEGER
          )", NO_PARAMS
    )?;
    conn.execute("INSERT INTO entries VALUES (null, 'https://unreachable', 55, 44, 33, 22)", NO_PARAMS)?;
    Ok(conn)
}

pub fn get_hash_for_url(conn: &Connection, url: &String) -> Result<ImageHash> {
    let mut stmt = conn.prepare("SELECT * FROM entries WHERE url = ? LIMIT 1;")?;
    let mut rows = stmt.query(&[url])?;
    let row = rows.next()?;
    match row {
        Some(row) => {
            let url: String = row.get(1)?;
            let d_hash_hi: u32 = row.get(2)?;
            let d_hash_lo: u32 = row.get(3)?;
            let a_hash_hi: u32 = row.get(4)?;
            let a_hash_lo: u32 = row.get(5)?;

            let d_hash = ((d_hash_hi as u64) << 32) | d_hash_lo as u64;
            let a_hash = ((a_hash_hi as u64) << 32) | a_hash_lo as u64;
            return Ok(ImageHash{a:a_hash, d:d_hash});
        },
        None => return Err(rusqlite::Error::QueryReturnedNoRows),
    };
}

pub fn insert_hash_for_url(conn: &Connection, url: &String, hash: &ImageHash) -> Result<()> {
    Ok(())
}
