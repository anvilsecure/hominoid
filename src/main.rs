use std::io::{self, Read};
use std::env;
use byteorder::{ByteOrder, NativeEndian};
use base64;

use siguranta::imghash;
use siguranta::db;

/*
 * The image supplied to use will be base64 encoded and look something like
 *  `data:image/png;base64,iVBOR...`
 */
fn get_image_from_data_url(buf: &str) -> Result<Vec<u8>, &'static str> {
    let preamble = "data:image/png;base64,";

    if !buf.starts_with(preamble) {
        return Err("invalid preamble");
    }

    let img = match base64::decode(&buf[preamble.len()..]) {
        Ok(v) => v,
        Err(_) => return Err("invalid base64 data supplied")
    };
    Ok(img)
}

fn browser_addon_mode() {
    let mut stdin = io::stdin();

    let mut buf = [0u8; 4];

    let sz = stdin.read(&mut buf).expect("I/O error when reading from stdin");
    if sz != 4 {
        panic!("expected 4 bytes to be read");
    }

    let ln = NativeEndian::read_u32(&buf);

    let mut buf = vec![0u8; ln as usize];
    stdin.read_exact(&mut buf).expect("I/O error when reading from stdin");

    let url_sz = NativeEndian::read_u32(&buf) as usize;
    let url = String::from_utf8(buf[4..4+url_sz].to_vec()).expect("invalid UTF-8");

    let img_sz = NativeEndian::read_u32(&buf[4+url_sz..8+url_sz]) as usize;
    let buf = String::from_utf8(buf[8+url_sz..].to_vec()).expect("invalid UTF-8");
    let v = get_image_from_data_url(&buf).expect("couldn't get image from data url");
    let img = imghash::read_image_from_vec(v).expect("couldn't read image from vector");
    let hash = imghash::hash_image(img);

    let conn = db::open().expect("ugh");
    match db::get_hash_for_url(&conn, &url) {
        Ok(v) => {
            println!("d: 0x{:.16x}, a: 0x{:.16x}", hash.d, hash.a);
            println!("d: 0x{:.16x}, a: 0x{:.16x}", v.d, v.a);
            let (d, a) = imghash::hamming_distance(hash, v);
            println!("d-hamming: 0x{:.16x}, a-hamming: 0x{:.16x}", d, a);
        

        },
        Err(e) => {
            /* so a hash for url wasn't found yet; this can mean two things:
             * - either it's a new login page that we haven't seen yet
             * - it hashes to another cached login page and we have detected a phising page
             */

            db::insert_hash_for_url(&conn, &url, &hash);
            let hamming_distance = 2;
            match db::get_urls_for_hash(&conn, &hash, hamming_distance) {
                Ok(v) => {
                },
                Err(e) => {
                    /* nothing find; looks like a fully new entry? */
                }
            }

            return;
        }
    }
}

fn calc_hash_mode(file: &String) -> () {
    let img = imghash::read_image_from_file(&file).expect("couldn't decode PNG properly");
    let hash = imghash::hash_image(img);
    println!("dhash: {}, ahash: {}", hash.d, hash.a);
}

fn compare_mode(file1: &String, file2: &String) -> () {
    let img1 = imghash::read_image_from_file(&file1).expect("couldn't decode PNG properly");
    let img2 = imghash::read_image_from_file(&file2).expect("couldn't decode PNG properly");

    let h1 = imghash::hash_image(img1);
    let h2 = imghash::hash_image(img2);

    println!("{:?}, {:?}", h1, h2);
}

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            browser_addon_mode();
        }
        2 => {
            calc_hash_mode(&args[1]);
        }
        3 => {
            compare_mode(&args[1], &args[2]);
        }
        _ => {
            panic!("invalid number of arguments supplied!");
        }
    }
}

#[cfg(test)]
#[test]
fn test_read_image() {
    assert!(read_image("bla").is_err());
    assert!(read_image("data:image/png;base64,AAAAA").is_err());
    assert!(read_image("data:image/png;base64,BBBB").is_ok());
}
