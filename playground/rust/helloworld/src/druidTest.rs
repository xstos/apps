use druid::{AppLauncher, LocalizedString, PlatformError, Widget, WidgetExt, WindowDesc};
use druid::widget::{Label, Button, Flex, CrossAxisAlignment};

pub fn druidTest() -> Result<(), PlatformError> {
    let main_window = WindowDesc::new(ui_builder);
    let data = 0_u32;
    AppLauncher::with_window(main_window)
        .use_simple_logger()
        .launch(data)
}

fn ui_builder() -> impl Widget<u32> {
    // The label text will be computed dynamically based on the current locale and count
    let text =
        LocalizedString::new("hello-counter").with_arg("count", |data: &u32, _env| (*data).into());
    //let label = Label::new(text).padding(5.0).center();
    //
    // let button = Button::new("increment")
    //     .on_click(|_ctx, data, _env| *data += 1)
    //     .padding(5.0);

    let mut fx = Flex::row().cross_axis_alignment(CrossAxisAlignment::Start).must_fill_main_axis(true);

    for i in 0..1000 {
        let str = i.to_string();
        let label = Label::new(str);
        //fx.add_flex_child(label,0.0);
        fx.add_flex_child(label,0.0);
    }
    fx
}