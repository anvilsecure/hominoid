use std::fs::File;
use std::path::Path;
use std::io::BufWriter;
use png::{Decoder, Encoder, ColorType, BitDepth};
use png::HasParameters;

pub struct Image {
    w: u32,
    h: u32,
    pixels: Vec<u8>,
}

#[derive(Debug)]
pub struct ImageHash {
    pub d: u64,
    pub a: u64,
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

/*
 * This writes the provided Image to a file pointed to by filename. The output
 * file will be overwritten. This function assumes that the Image is already
 * properly converted to a grayscale image without an alpha channel. 
 */
pub fn write_grayscale_image(img: Image, filename: &str) -> Result<(), String> {
    let path = Path::new(filename);
    let file = File::create(path).unwrap();
    let ref mut w = BufWriter::new(file);
    let mut encoder = Encoder::new(w, img.w, img.h);
    encoder.set(ColorType::Grayscale).set(BitDepth::Eight);
    let mut writer = encoder.write_header().unwrap();
    writer.write_image_data(&img.pixels).unwrap();
    Ok(())
}

fn dhash_image(img: &Image) -> u64 {
    let img = gray_and_resize_image(img, 9, 8);
    let mut res: u64 = 0;
    for i in 0..8 {
        for j in 0..8 {
            let off = i*9 + j;
            let v = match img.pixels[off] < img.pixels[off+1] {
                true => 1,
                false => 0
            };
            res = (res << 1) | v;
        }
    }
    return res;
}

fn ahash_image(img: &Image) -> u64 {
    let img = gray_and_resize_image(img, 8, 8);
    let mut res: u64 = 0;
    let mut mc: u64 = 0;

    /* calculate mean */
    for i in 0..8 {
        for j in 0..8 {
            mc = mc + img.pixels[i*8 + j] as u64;
        }
    }
    let mc: u8 = (mc / 64) as u8;

    for i in 0..8 {
        for j in 0..8 {
            let off = i*8 + j;
            let v = match img.pixels[off] < mc {
                true => 1,
                false => 0
            };
            res = (res << 1) | v;
        }
    }

    return res;
}

fn hamming(i: u64, j: u64) -> u64 {
    let mut c: u64 = 0;
    let r: u64 = i ^ j;
    for k in 0..64 {
        c = c + ((r >> k) & 0x1);
    }
    return c;
}

pub fn hamming_distance(h1: ImageHash, h2: ImageHash) -> (u64, u64) {
    (hamming(h1.d, h2.d),
    hamming(h1.a, h2.a))
}

pub fn hash_image(img: Image) -> ImageHash {
    ImageHash {
        d: dhash_image(&img),
        a: ahash_image(&img),
    }
}


/* reference: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
 *
 * http://tech-algorithm.com/articles/nearest-neighbor-image-scaling/
 * */
fn gray_and_resize_image(img: &Image, w: usize, h: usize) -> Image {

    let w_ratio = img.w as f64 / w as f64;
    let h_ratio = img.h as f64 / h as f64;
    let sz = w * h;
    let mut buf = vec![0u8; sz];

    for i in 0..h {
        for j in 0..w {
            let px = ((j as f64) * w_ratio).floor();
            let px_end = (px + w_ratio).floor() as usize;
            let px = px as usize;

            let py = ((i as f64) * h_ratio).floor();
            let py_end = (py + h_ratio).floor() as usize;
            let py = py as usize;

            let mut grays = 0.0;
            let mut alphas = 0.0;
            let mut k = 0;

            for x in px ..px_end {
                for y in py ..py_end {
                    let off = (y*(img.w as usize)*4) + x*4;
                    let pixels = &img.pixels[off..off+4];

                    let red = pixels[0] as f64;
                    let green = pixels[1] as f64;
                    let blue = pixels[2] as f64;
                    let gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;
                    grays += gray;

                    let alpha = pixels[3] as f64;
                    alphas += alpha;

                    k += 1;
                }
            }

            let k = k as f64;
            let gray = grays / k;
            let alpha_ratio = alphas / k / 255.0;
            let gray = gray * alpha_ratio + ((1.0 - alpha_ratio) * 255.0);

            buf[i*w + j] = gray.floor() as u8;
        }
    }

    Image { w:w as u32, h:h as u32, pixels: buf}
}

#[cfg(test)]
#[test]
fn test_read_image_from_file() {
    assert!(read_image_from_file(r"/doesnotexist").is_err());
}

#[test]
fn test_read_image_from_vec() {
    assert!(read_image_from_vec(vec![0u8; 10]).is_err());
}
