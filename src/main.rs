use std::io::{self, Read, Write};
use std::process;
use std::str;
use std::env;
use byteorder::{ByteOrder, NativeEndian};
use base64;
use serde_json;
use dirs::home_dir;
use log::LevelFilter;
use log::{info, error};

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

fn read_message() -> serde_json::Value {
    let mut stdin = io::stdin();
    let mut buf = [0u8; 4];

    info!("reading from stdin!");
    let ret = stdin.read(&mut buf);

    info!("{:?}", ret);
    let sz = match ret {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e);
            panic!("I/O error when reading from stdin");
        }
    };
    info!("read bytes: {:?}", sz);
    if sz == 0 {
        process::exit(0);
    }
    let ln = NativeEndian::read_u32(&buf);
    let mut buf = vec![0u8; ln as usize];
    match stdin.read_exact(&mut buf) {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e);
            panic!("I/O error when reading from stdin");
        },
    };
    let s = match str::from_utf8(&buf) {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e);
            panic!("invalid UTF-8 sequence supplied");
        }
    };
    let json: serde_json::Value = match serde_json::from_str(&s) {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e);
            panic!("invalid JSON supplied");
        }
    };
    json
}

fn write_message(msg: &str) {
    let mut buf = [0;4];
    let json = serde_json::json!(
        {"result":msg}
        );
    let msg = match serde_json::to_string(&json) {
        Err(_) => {
            error!("error while serializing message");
            panic!("serde_json failed");
        },
        Ok(v) => v,
    };
    let msg = msg.as_bytes();
    NativeEndian::write_u32(&mut buf, msg.len() as u32);
    if io::stdout().write(&buf).is_err() {
        panic!("error while writing 4-byte length");
    }
    if io::stdout().write(&msg).is_err() {
        panic!("error while writing message");
    }
    if io::stdout().flush().is_err() {
        panic!("error while flushing stdout");
    }
}

fn browser_addon_mode() {

    let conn = match db::open() {
        Err(e) => {
            error!("{:?}", e);
            panic!("couldn't open db");
        },
        Ok(v) => v,
    };

    loop {
        let json = read_message();

        let url = match json["url"].as_str() {
            Some(v) => v,
            None => {
                error!("invalid URL supplied");
                continue;
            }
        };
        let url = url.to_string();

        let img = match json["img"].as_str() {
            Some(v) => v,
            None => {
                error!("invalid IMG supplied");
                continue;
            }
        };

        info!("looking into database");
        let v = get_image_from_data_url(img).expect("couldn't get image from data url");
        let img = imghash::read_image_from_vec(v).expect("couldn't read image from vector");
        let hash = imghash::hash_image(img);
        info!("done calculating hashes");

        let ret = db::get_hash_for_url(&conn, &url);

        /* if we found a match calculate the hamming distances */
        if ret.is_ok() {
            let db_hash = ret.unwrap();
            info!("d: 0x{:.16x}, a: 0x{:.16x}", hash.d, hash.a);
            info!("d: 0x{:.16x}, a: 0x{:.16x}", db_hash.d, db_hash.a);
            let (d, a) = imghash::hamming_distance(hash, db_hash);
            info!("d-hamming: 0x{:.16x}, a-hamming: 0x{:.16x}", d, a);
        }
        else {
            /* so a hash for url wasn't found yet; this can mean two things:
             * - either it's a new login page that we haven't seen yet
             * - it hashes to another cached login page and we have detected a phising page
             */

            let db_urls = match db::get_urls_for_hash(&conn, &hash, 2) {
                Err(e) => {
                    error!("error while trying to get urls for hash");
                    panic!("error: {:?}", e);
                },
                Ok(v) => v,
            };
            let ln = db_urls.len();

            /* if we found matches for the hash within a hamming distance of 2 or less the pages
             * are very similar; we'll check to see if there's a url match; if there isn't it is
             * likely a phising page */
            for db_url in db_urls {
            }

            if ln != 0 {
                let mut phishing = true;
                for db_url in db_urls {
                    info!("url found for hashes: {:?}", db_url);
                    if url == db_url {
                        info!("Found exact url match: {:?}", url);
                        phishing = false;
                        break;
                    }
                }
                if phishing {
                    let b: Vec<String> = db_urls.into_iter().collect();
                    write_message(format!("phishing detected: {:?} seems to be phishing {:?}", b, url).as_str());
                }
                else {
                    write_message(format!("full match detected for {:?}", url).as_str());
                }
            }
            else {
                db::insert_hash_for_url(&conn, &url, &hash);
                info!("inserted new entry into database");
                write_message(format!("new entry for {:?} inserted in database", url).as_str());
            }
        }

        write_message("hello world!!! 2");
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut path = match home_dir() {
        Some(v) => v,
        None => {
            panic!("couldn't find homedir");
        }
    };
    path.push(".siguranta.log");

    let ret = simple_logging::log_to_file(&path, LevelFilter::Info);
    if ret.is_err() {
        panic!("error while setting up logging");
    }

    match args.len() {
        1 => {
            /* if no arguments we also go into browser add-on mode; this
             * is mostly useful for testing without the browser via
             * a seperate testing script */
            browser_addon_mode();
        }
        2 => {
            calc_hash_mode(&args[1]);
        }
        3 => {
            /* if args[2] is set to the add-on application identifier we got most likely called
             * from the browser so go into add-on mode too */
            if args[2] == "siguranta@anvilventures.com" {
                /* this means we're called from the browser */
                browser_addon_mode();
            }
            else {
                compare_mode(&args[1], &args[2]);
            }
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
