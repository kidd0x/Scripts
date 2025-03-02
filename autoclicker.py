import time
import threading
from pynput.mouse import Controller, Button
from pynput import mouse

autoclicking = False
click_interval = 0.001
mouse_controller = Controller()

def autoclicker():
    while True:
        if autoclicking:
            mouse_controller.click(Button.left)
            time.sleep(click_interval)

def on_click(x, y, button, pressed):
    global autoclicking

    if button == Button.right and pressed:
        autoclicking = not autoclicking
        print(f"Autoclicker {'started' if autoclicking else 'stopped'}")

autoclicker_thread = threading.Thread(target=autoclicker)
autoclicker_thread.daemon = True
autoclicker_thread.start()

with mouse.Listener(on_click=on_click) as listener:
    listener.join()
