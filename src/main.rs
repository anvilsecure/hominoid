use std::io::{self, Read};
use byteorder::{ByteOrder, NativeEndian};
use base64;

use imghash;

/*
 * The image suppliedto use will be base64 encoded and look something like
 *  `data:image/png;base64,iVBOR...`
 */
fn read_image(buf: &str) -> Result<Vec<u8>, &'static str> {
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

fn main() {
    let img = imghash::read_image_from_file(r"/home/gvb/index.png").expect("couldn't decode PNG properly");
    let hash = imghash::hash_image(img);
    println!("{:?}", hash);
    let mut stdin = io::stdin();

    let mut buf = [0u8; 4];

    let sz = stdin.read(&mut buf).expect("I/O error when reading from stdin");
    if sz != 4 {
        panic!("expected 4 bytes to be read");
    }

    let ln = NativeEndian::read_u32(&buf);

    let mut buf = vec![0u8; ln as usize];
    stdin.read_exact(&mut buf).expect("I/O error when reading from stdin");

    let image = String::from_utf8(buf).expect("invalid UTF-8");
    let _pixels = read_image(&image).expect("couldn't read image");
}

#[cfg(test)]
#[test]
fn test_read_image() {
    assert!(read_image("bla").is_err());
    assert!(read_image("data:image/png;base64,AAAAA").is_err());
    assert!(read_image("data:image/png;base64,BBBB").is_ok());
}
