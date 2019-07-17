use std::fs::File;
use png::{Decoder, ColorType, BitDepth};

pub struct Image {
    w: u32,
    h: u32,
    pixels: Vec<u8>,
}

#[derive(Debug)]
pub struct ImageHash {
}

fn load_image<T: std::io::Read>(decoder: Decoder<T>) -> Result<Image, String> {
    let (info, mut reader) = match decoder.read_info(){
        Ok(v) => v,
        Err(_) => {
            return Err("error while decoding image".to_string());
        }
    };

    if info.color_type != ColorType::RGBA {
        return Err("expected RGBA image".to_string());
    }
    else if info.bit_depth != BitDepth::Eight {
        return Err("expected bit depth of 8".to_string());
    }

    let mut buf = vec![0; info.buffer_size()];
    reader.next_frame(&mut buf).unwrap();

    println!("w: {}, h: {}, bit: {:?}", info.width, info.height, info.color_type);
    println!("a: {}, b:{}", buf.len(), info.width*info.height);

    Ok(Image { w:info.width, h:info.height, pixels: buf})
}

pub fn read_image_from_vec(img: Vec<u8>) -> Result<Image, String> {
    let decoder = Decoder::new(&*img);
    load_image(decoder)
}

pub fn read_image_from_file(filename: &str) -> Result<Image, String> {
    let file = File::open(filename);
    if file.is_err() {
        return Err("error while opening file".to_string());
    }
    let decoder = Decoder::new(file.unwrap());
    load_image(decoder)
}

pub fn hash_image(input_img: Image) -> Result<ImageHash, String> {
    let img = gray_and_resize_image(input_img, 8, 8);
    Ok(ImageHash{})
}


/* reference: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
 *
 * http://tech-algorithm.com/articles/nearest-neighbor-image-scaling/
 * */
fn gray_and_resize_image(img: Image, w: u32, h: u32) -> Result<Image, String> {

    let w_ratio = (img.w as f64) / (w as f64);
    let h_ratio = (img.h as f64) / (h as f64);
    let buf = vec![0u8;(w*h) as usize];


    println!("w_ratio: {:?}, h_ratio: {:?}", w_ratio, h_ratio);

    for i in 0..h {
        for j in 0..w {
            let px = (f64::from(j)*w_ratio).floor();
            let py = (f64::from(i)*h_ratio).floor();

            let off = ((py as u32)*img.w*4) + ((px as u32)*4);

            for x in (px as u32)..((px + w_ratio) as u32) {
                for y in (py as u32)..((py + h_ratio) as u32) {
                    let off = (y*img.w*4) + x*4;
                    println!("off: {:?}, x: {}, y: {}, len: {}", off, x, y, img.pixels.len());
                }
            }
            println!("done\n");

        }
    }

    Ok(Image { w:w, h:h, pixels: buf})
}

#[cfg(test)]
#[test]
fn test_read_image_from_file() {
    assert!(read_image_from_file(r"/home/gvb/index.png").is_ok());
    assert!(read_image_from_file(r"/doesnotexist").is_err());
}

#[test]
fn test_read_image_from_vec() {
    assert!(read_image_from_vec(vec![0u8; 10]).is_err());
}

#[test]
fn test_hash() {
    let img = read_image_from_file(r"/home/gvb/index.png");
    assert!(img.is_ok());
    let hash = hash_image(img.unwrap());
    assert!(hash.is_ok());
}
