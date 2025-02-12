import tkinter as tk
from tkinter import messagebox

def convert_hex_to_binary():
    hex_data = hex_input.get("1.0", tk.END).strip()

    hex_data = ''.join(filter(str.isalnum, hex_data))

    try:
        binary_data = bin(int(hex_data, 16))[2:]
        binary_output.delete("1.0", tk.END)
        binary_output.insert(tk.END, binary_data)
    except ValueError:
        messagebox.showerror("Error", "Invalid hexadecimal input!")

root = tk.Tk()
root.title("Hex to Binary Converter")

input_label = tk.Label(root, text="Paste Hexadecimal Data:")
input_label.pack(pady=5)

hex_input = tk.Text(root, height=10, width=50)
hex_input.pack(pady=5)

convert_button = tk.Button(root, text="Convert to Binary", command=convert_hex_to_binary)
convert_button.pack(pady=5)

output_label = tk.Label(root, text="Binary Output:")
output_label.pack(pady=5)

binary_output = tk.Text(root, height=10, width=50)
binary_output.pack(pady=5)

root.mainloop()
