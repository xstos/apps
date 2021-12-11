#  pyinstaller -F main.py

import dearpygui.dearpygui as dpg
from dearpygui.demo import show_demo

dpg.create_context()
dpg.create_viewport()
dpg.setup_dearpygui()


# show_demo()
def _on_demo_close(sender, app_data, user_data):
    pass


with dpg.window(label="Dear PyGui Demo", on_close=_on_demo_close, pos=(100, 100),
                tag="__demo_id", autosize=True):
    a_list = list(range(1, 10000))
    map(lambda a:  dpg.add_text(default_value=a_list), a_list)

    pass

dpg.show_viewport()
dpg.start_dearpygui()
dpg.destroy_context()

_vars = []

s = """
def print_hi(name):
    x= 'derp'
    def derp(foo):
        return x+foo
    print(f'Hi, {derp(name)}')
    """


class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    p1 = Person("John", 36)
    exec(s)
    exec("print_hi('PyCharm')")

    print(p1.name)
    exec("print_hi('PyCharm')")

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
