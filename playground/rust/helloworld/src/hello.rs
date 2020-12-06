//https://stackoverflow.com/questions/34054669/how-to-compile-and-run-an-optimized-rust-program-with-overflow-checking-enabled
//https://medium.com/journey-to-rust/simple-2d-9ce10d933ae3
extern crate minifb;

//pub(crate) static mut N: i32 = 5;
use std::time::{Instant};
use self::minifb::{Window, WindowOptions, Key, MouseMode};

pub fn makeColor(red: u32, green: u32, blue: u32) -> u32 {
    (red << 16) | (green << 8) | blue
}
fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}
pub fn main2() {
    let w = 1920;
    let h = 1080;
    let len = w * h;
    let mut buffer: Vec<u32> = vec![0; len];
    let mut window = Window::new("", w, h, WindowOptions::default()).unwrap();
    let mut colorIndex: u32 = 0;
    let mut startTime = Instant::now();
    let mut numframes = 0;
    while window.is_open() && !window.is_key_down(Key::Escape) {

        //fill the buffer with a new color
        let mycolor = makeColor(colorIndex, 0, 0);
        for i in 0..len {
            buffer[i] = mycolor
        }
        colorIndex = (colorIndex + 1) % 255;

        //update title bar with fps and mouse pos
        let duration = startTime.elapsed().as_secs_f32();
        if duration >= 1.0 {
            let pos = window.get_mouse_pos(MouseMode::Clamp).unwrap();
            let info = [numframes.to_string(), pos.0.to_string(), pos.1.to_string()].join(" ");
            window.set_title(&info);
            numframes = 0;
            startTime = Instant::now(); //reset time counter
        }

        //copy the back buffer to the window
        window.update_with_buffer(&buffer, w, h).unwrap();

        numframes = numframes + 1;
    }
}