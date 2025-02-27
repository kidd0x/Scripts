import os
import string
import tkinter as tk
from tkinter import messagebox
import random
import time
import subprocess
import sys

# Constants
USERNAME = "1"
PASSWORD = "1"
MAX_ATTEMPTS = 3
SHUTDOWN_COMMAND = "shutdown /s /t 1"  # Command to shut down the PC

# Global variable to track login attempts
attempts = 0

# Function to generate random colors
def random_color():
    return f'#{random.randint(0, 255):02x}{random.randint(0, 255):02x}{random.randint(0, 255):02x}'

# Function to find Steam.exe path on all disks
def find_steam_path():
    # Get all available drives on the system
    drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\")]

    # Common directories where Steam might be installed
    common_dirs = ["Steam", "Program Files\\Steam", "Program Files (x86)\\Steam"]

    # Search for Steam.exe in all drives and common directories
    for drive in drives:
        for common_dir in common_dirs:
            steam_path = os.path.join(drive, common_dir, "Steam.exe")
            if os.path.isfile(steam_path):
                return steam_path

    # If Steam.exe is not found in common directories, perform a broader search
    for drive in drives:
        for root, dirs, files in os.walk(drive):
            if "Steam.exe" in files:
                return os.path.join(root, "Steam.exe")

    return None  # Return None if Steam.exe is not found

# Function to simulate kernel server loading
def simulate_kernel_loading():
    for i in range(101):
        progress_label.config(text=f"Kernel server is loading ({i} %)")
        console_window.update()
        time.sleep(0.1)  # Simulate delay
    progress_label.config(text="Kernel Driver Loaded on CheatKTest", fg="green")
    console_window.update()
    time.sleep(1)
    progress_label.config(text="Searching for cs2.exe process...")
    console_window.update()
    time.sleep(2)
    open_steam_and_run_cs2()

# Function to open Steam and run CS2
def open_steam_and_run_cs2():
    steam_path = find_steam_path()
    if steam_path:
        try:
            subprocess.Popen([steam_path])
            progress_label.config(text="cs2.exe found")
            console_window.update()
            time.sleep(2)
            progress_label.config(text="Cheat Injected, waiting for confirmation...")
            console_window.update()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open Steam: {e}")
    else:
        messagebox.showerror("Error", "Steam.exe not found on this PC.")

# Function to open the main console window
def open_console():
    global console_window
    console_window = tk.Tk()
    console_window.title("Kernel Cheat by Janel")
    console_window.geometry("800x600")
    console_window.configure(bg="black")

    # Center the window on the screen
    window_width = 800
    window_height = 600
    screen_width = console_window.winfo_screenwidth()
    screen_height = console_window.winfo_screenheight()
    x = (screen_width // 2) - (window_width // 2)
    y = (screen_height // 2) - (window_height // 2)
    console_window.geometry(f"{window_width}x{window_height}+{x}+{y}")

    # Create a Label widget for the typing effect with random colors
    text_label = tk.Label(console_window, text="", fg="white", bg="black", font=("Courier", 14))
    text_label.pack(expand=True)  # Center the label vertically and horizontally

    # Simulate typing effect with random colors
    text = "[\\/] Janel WallHack Cheat on Kernel"
    delay = 0.1
    for i in range(len(text)):
        color = random_color()
        text_label.config(text=text_label.cget("text") + text[i], fg=color)
        console_window.update()
        time.sleep(delay)

    # Clear the label after the typing effect
    text_label.config(text="")

    # Add progress label
    global progress_label
    progress_label = tk.Label(console_window, text="", fg="white", bg="black", font=("Courier", 12))
    progress_label.pack(pady=20)

    # Start simulating kernel loading
    simulate_kernel_loading()

    # Run the console window
    console_window.mainloop()

# Function to check login credentials
def check_credentials():
    global attempts
    username = username_entry.get()
    password = password_entry.get()

    if username == USERNAME and password == PASSWORD:
        login_window.destroy()
        open_console()
    else:
        attempts += 1
        if attempts >= MAX_ATTEMPTS:
            messagebox.showerror("Error", "Incorrect credentials. Shutting down the PC.")
            subprocess.run(SHUTDOWN_COMMAND, shell=True)
            sys.exit()
        else:
            messagebox.showerror("Error", f"Incorrect credentials. {MAX_ATTEMPTS - attempts} attempts remaining.")

# Create the login window
login_window = tk.Tk()
login_window.title("Login")
login_window.geometry("300x150")

# Center the window on the screen
window_width = 300
window_height = 150
screen_width = login_window.winfo_screenwidth()
screen_height = login_window.winfo_screenheight()
x = (screen_width // 2) - (window_width // 2)
y = (screen_height // 2) - (window_height // 2)
login_window.geometry(f"{window_width}x{window_height}+{x}+{y}")

# Username label and entry
username_label = tk.Label(login_window, text="Username:")
username_label.pack()
username_entry = tk.Entry(login_window)
username_entry.pack()

# Password label and entry
password_label = tk.Label(login_window, text="Password:")
password_label.pack()
password_entry = tk.Entry(login_window, show="*")
password_entry.pack()

# Login button
login_button = tk.Button(login_window, text="Login", command=check_credentials)
login_button.pack(pady=10)

# Run the login window
login_window.mainloop()