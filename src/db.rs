use rusqlite::{Connection, Result, NO_PARAMS, params};
use dirs::home_dir;

use crate::imghash::ImageHash;

pub fn open() -> Result<Connection> {
    let mut path = match home_dir() {
        Some(v) => v,
        None => {
            panic!("couldn't find homedir");
        }
    };
    path.push(".hominoid.db");

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
            let _url: String = row.get(1)?;
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
    let mut stmt = conn.prepare(
        "INSERT INTO entries (url, d_hash_hi, d_hash_lo, a_hash_hi, a_hash_lo) VALUES (?,?,?,?,?)"
    )?;
    let (d_hi, d_lo) = split_value(hash.d);
    let (a_hi, a_lo) = split_value(hash.a);
    //stmt.execute(&[&url, d_hi, d_lo, a_hi, a_lo]);
    //stmt.execute(&[&url, 5, d_lo, a_hi, a_lo]);
    let mut _rows = stmt.execute(params![url, d_hi, d_lo, a_hi, a_lo]);
    Ok(())
}

#[inline]
fn split_value(val: u64) -> (u32, u32) {
    let hi: u32 = ((val >> 32) & 0xffffffff) as u32;
    let lo: u32 = (val & 0xffffffff) as u32;
    return (hi, lo)
}

pub fn get_urls_for_hash(conn: &Connection, hash: &ImageHash, distance: u32) -> Result<Vec<String>> {

    if distance > 2 {
        return Err(rusqlite::Error::InvalidParameterName("only allow a maximum hamming distance search of 2".to_string()));
    }

    let mut ret = vec![];
    let mut stmt = conn.prepare(
        "SELECT * FROM entries WHERE
            (d_hash_hi = ? AND d_hash_lo = ?) OR
            (a_hash_hi = ? AND a_hash_lo = ?)"
    )?;
    let (d_hi, d_lo) = split_value(hash.d);
    let (a_hi, a_lo) = split_value(hash.a);
    let mut rows = stmt.query(&[d_hi, d_lo, a_hi, a_lo])?;
    while let Some(row) = rows.next()? {
        let url: String = row.get(1)?;
        ret.push(url);
    };

    Ok(ret)
}
