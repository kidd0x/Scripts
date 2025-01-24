import time
import pyautogui
import pyperclip
import tkinter as tk
from tkinter import messagebox


def send_messages():
    """Send messages to the current WhatsApp chat."""
    message = message_box.get("1.0", tk.END).strip()
    num_messages = num_messages_entry.get().strip()

    if not message:
        messagebox.showerror("Error", "Message cannot be empty.")
        return
    if not num_messages.isdigit():
        messagebox.showerror("Error", "Number of messages must be a valid number.")
        return

    num_messages = int(num_messages)

    messagebox.showinfo("Ready", "Hover over the WhatsApp input field, then press OK to start.")
    time.sleep(2)

    try:
        for _ in range(num_messages):
            pyperclip.copy(message)
            pyautogui.hotkey("ctrl", "v")
            pyautogui.press("enter")
            time.sleep(0.1)
        messagebox.showinfo("Success", f"Sent {num_messages} messages to the open conversation.")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to send messages: {e}")


root = tk.Tk()
root.title("WhatsApp Spammer")

tk.Label(root, text="Message:").pack(pady=5)
message_box = tk.Text(root, width=40, height=5)
message_box.pack(pady=5)

# Number of Messages
tk.Label(root, text="Number of Messages:").pack(pady=5)
num_messages_entry = tk.Entry(root, width=10)
num_messages_entry.pack(pady=5)

# Send Button
send_button = tk.Button(root, text="Send Messages", command=send_messages)
send_button.pack(pady=20)

# Run the GUI
root.mainloop()
