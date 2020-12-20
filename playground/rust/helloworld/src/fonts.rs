use std::fs::File;
use std::io::Write;

const CHARACTER: char = 'A';
const SIZE: f32 = 64.0;

pub fn fontexample() {
    // Loading and rasterization
    let font = include_bytes!("../resources/Roboto-Regular.ttf") as &[u8];
    let settings = fontdue::FontSettings {
        scale: SIZE,
        ..fontdue::FontSettings::default()
    };
    let font = fontdue::Font::from_bytes(font, settings).unwrap();
    let (metrics, bitmap) = font.rasterize(CHARACTER, SIZE);
    let mut o = File::create("fontdue.pgm").unwrap();
    let _ = o.write(format!("P5\n{} {}\n255\n", metrics.width, metrics.height).as_bytes());
    let _ = o.write(&bitmap);
}
