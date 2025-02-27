import tkinter as tk
from PIL import Image, ImageTk, ImageOps
import os

image_path = r"C:\Users\janelike\Desktop\duck\duck.png"

if not os.path.exists(image_path):
    print(f"Error: The image file '{image_path}' does not exist.")
    exit()

root = tk.Tk()
root.attributes("-fullscreen", True)
root.attributes("-topmost", True)  
root.attributes("-transparentcolor", "white"

# Load the image and resize it
try:
    original_duck_image = Image.open(image_path).resize((100, 100), Image.Resampling.LANCZOS)
    flipped_duck_image = ImageOps.mirror(original_duck_image)

    right_duck_photo = ImageTk.PhotoImage(original_duck_image)
    left_duck_photo = ImageTk.PhotoImage(flipped_duck_image)

    current_duck_photo = right_duck_photo
except Exception as e:
    print(f"Error loading or resizing image: {e}")
    root.destroy()
    exit()

canvas = tk.Canvas(root, width=root.winfo_screenwidth(), height=root.winfo_screenheight(), highlightthickness=0, bg="white")
canvas.pack()

duck = canvas.create_image(root.winfo_screenwidth() // 2, root.winfo_screenheight() // 2, image=current_duck_photo)

speed = 110

current_direction = "right"

def move_duck(event):
    global current_duck_photo, current_direction

    if event.keysym == "w":
        canvas.move(duck, 0, -speed)
    elif event.keysym == "s":
        canvas.move(duck, 0, speed)
    elif event.keysym == "a":
        if current_direction != "left":
            canvas.itemconfig(duck, image=left_duck_photo)
            current_duck_photo = left_duck_photo
            current_direction = "left"
        canvas.move(duck, -speed, 0)
    elif event.keysym == "d":
        if current_direction != "right":
            canvas.itemconfig(duck, image=right_duck_photo)
            current_duck_photo = right_duck_photo
            current_direction = "right"
        canvas.move(duck, speed, 0)
    elif event.keysym == "x":
        root.destroy()

root.bind("<KeyPress>", move_duck)

root.mainloop()
