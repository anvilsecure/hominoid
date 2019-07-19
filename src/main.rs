use std::io::{self, Read, Write};
use std::process;
use std::str;
use std::env;
use byteorder::{ByteOrder, NativeEndian};
use base64;
use serde_json;
use log::LevelFilter;
use log::{info, trace, warn, error};

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

    info!("called from browser add-on mode");

    let ret = stdin.read(&mut buf);
    let sz = match ret {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e);
            panic!("I/O error when reading from stdin");
        }
    };
    if sz == 0 {
        process::exit(0);
    }
    else if sz != 4 {
        error!("read total of {:?} bytes", sz);
        panic!("expected 4 bytes to be read");
    }

    info!("read 4 bytes");

    let ln = NativeEndian::read_u32(&buf);

    let mut buf = vec![0u8; ln as usize];
    stdin.read_exact(&mut buf).expect("I/O error when reading from stdin");

    let s = match str::from_utf8(&buf) {
        Ok(v) => v,
        Err(e) => panic!("invalid UTF-8 sequence supplied"),
    };

    info!("read all data");

    let json: serde_json::Value = serde_json::from_str(&s).expect("invalid JSON supplied");

    error!("{:?}", s);
    error!("{:?}", json);
    info!("parsed json");
    let url = json["url"].as_str();
    info!("parsed url - 1");
    error!("{:?}", url);
    let url = url.unwrap();
    error!("{:?}", url);
    info!("parsed url - 2");
    let url = url.to_string();
    info!("parsed url - 3");
    let img = json["img"].as_str().unwrap();
    info!("parsed img");

    info!("extracted fields from json");

    let v = get_image_from_data_url(img).expect("couldn't get image from data url");
    let img = imghash::read_image_from_vec(v).expect("couldn't read image from vector");
    let hash = imghash::hash_image(img);

    info!("opening database");

    let ret = db::open();
    let conn = match db::open() {
        Err(e) => {
            error!("{:?}", e);
            panic!("couldn't open db");
        },
        Ok(v) => v,
    };

    info!("opened database");
    match db::get_hash_for_url(&conn, &url) {
        Ok(v) => {
            info!("d: 0x{:.16x}, a: 0x{:.16x}", hash.d, hash.a);
            info!("d: 0x{:.16x}, a: 0x{:.16x}", v.d, v.a);
            let (d, a) = imghash::hamming_distance(hash, v);
            info!("d-hamming: 0x{:.16x}, a-hamming: 0x{:.16x}", d, a);
            
            let mut buf = [0;4];
            let r = "data back!".as_bytes();
            let ln = NativeEndian::write_u32(&mut buf, r.len() as u32);
            info!("{:?}", buf);
            let ret = io::stdout().write(&buf);
            info!("{:?}", ret);
            let ret = io::stdout().write(&r[0..]);
            info!("{:?}", ret);
            let ret = io::stdout().flush();
            info!("{:?}", ret);
            
            info!("we wrote the bytes");

        },
        Err(e) => {
            /* so a hash for url wasn't found yet; this can mean two things:
             * - either it's a new login page that we haven't seen yet
             * - it hashes to another cached login page and we have detected a phising page
             */
            let mut buf = [0;4];
            let r = "data back!".as_bytes();
            let ln = NativeEndian::write_u32(&mut buf, r.len() as u32);
            let ret = io::stdout().write(&buf);
            info!("{:?}", ret);
            io::stdout().write(&r[0..]);
            io::stdout().flush();
            
            info!("we wrote the bytes2");

            info!("couldnt find entry in db");
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

    simple_logging::log_to_file("/Users/gvb/siguranta/test.log", LevelFilter::Info);
    info!("args len {}", args.len());

    match args.len() {
        1 => {
            info!("browser add_on mode");
            browser_addon_mode();
        }
        2 => {
            info!("calc hash mode");
            calc_hash_mode(&args[1]);
        }
        3 => {
            if args[2] == "siguranta@anvilventures.com" {
                info!("{:?}", args);
                /* this means we're called from the browser */
                loop {
                    browser_addon_mode();
                }
            }
            else {
                info!("compare mode");
                compare_mode(&args[1], &args[2]);
            }
        }
        _ => {
            error!("invalid number of arguments supplied");
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
