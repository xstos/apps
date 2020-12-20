//https://www.twelve21.io/getting-started-with-rust-on-windows-and-visual-studio-code/
//http://nercury.github.io/rust/opengl/tutorial/2018/02/08/opengl-in-rust-from-scratch-01-window.html
//https://pramode.in/2016/10/12/conway-game-of-life-rust-sdl2/
//https://github.com/ysgard/sprite-blitting-rs
//https://stackoverflow.com/questions/19605132/is-it-possible-to-use-global-variables-in-rust
extern crate sdl2;
extern crate fontdue;
extern crate druid;
use sdl2::pixels::Color;
use sdl2::rect::Point;
use std::time::{ Instant};

mod hello;
mod fonts;
mod druidTest;

fn main() -> Result<(), String>
{
    druidTest::druidTest();
    return Ok(());
    fonts::fontexample();
    hello::main2();

    let sdl_context = sdl2::init().unwrap();
    let video_subsystem = sdl_context.video().unwrap();
    let width = 1024;
    let height= 768;
    let window = video_subsystem
        .window("Game", width, 768)
        .resizable()
        .build()
        .unwrap();

    let mut canvas = window.into_canvas().build().map_err(|e| e.to_string())?;
    canvas.set_draw_color(Color::RGBA(195, 217, 255, 255));
    let start = Instant::now();
    for x in 1..width {
        for y in 1..height {
            canvas.draw_point(Point::new(x as i32, y as i32));
        }
    }
    let duration = start.elapsed();
    println!("Time elapsed in expensive_function() is: {:?}", duration);
    //canvas.clear();
    canvas.present();
    let mut event_pump = sdl_context.event_pump().unwrap();
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