//https://www.twelve21.io/getting-started-with-rust-on-windows-and-visual-studio-code/
//http://nercury.github.io/rust/opengl/tutorial/2018/02/08/opengl-in-rust-from-scratch-01-window.html
extern crate sdl2;
use sdl2::pixels::Color;
fn main() -> Result<(), String>
{
    let sdl = sdl2::init().unwrap();
    let video_subsystem = sdl.video().unwrap();
    let window = video_subsystem
        .window("Game", 1024, 768)
        .resizable()
        .build()
        .unwrap();

    let mut canvas = window.into_canvas().build().map_err(|e| e.to_string())?;
    canvas.set_draw_color(Color::RGBA(195, 217, 255, 255));
    canvas.clear();
    canvas.present();
    let mut event_pump = sdl.event_pump().unwrap();
    'main: loop {
        for event in event_pump.poll_iter() {
            match event {
                sdl2::event::Event::Quit {..} => break 'main,
                _ => {},
            }
        }

        // render window contents here
    }
    Ok(())
}

#[test]
fn should_fail() {
    unimplemented!();
}