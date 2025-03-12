let dataTransfer = new DataTransfer();
let box = document.querySelectorAll("[role='textbox']")[1];

if (!box) {
  alert("No chat open. Make sure you have opened the chat you want to spam.");
  throw new Error("No chat open. Make sure you have opened the chat you want to spam.");
}

let count = parseInt(prompt("Enter number of messages (between 1 and 100):", "10"), 10);

if (isNaN(count) || count < 1 || count > 100) {
  alert("Invalid input! Enter a NUMBER between 1 and 100.");
  throw new Error("Invalid input for message count.");
}

let message = prompt("Enter the MESSAGE to spam:", "Hello from spammer...");
if (!message) {
  alert("Message cannot be empty. Re-run the script to try again.");
  throw new Error("Empty message input.");
}

dataTransfer.setData("text/plain", message);

function findSendButton() {
  return document.querySelector("button[aria-label='Send']");
}

(async () => {
  console.clear();

  for (let i = 0; i < count; i++) {
    box.focus();

    box.dispatchEvent(new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    }));

    await new Promise((resolve) => setTimeout(resolve, 100));

    let sendButton = findSendButton();
    if (sendButton) {
      sendButton.click();
      console.log(`"${message}" sent -> ${i + 1} times`);
    } else {
      console.warn("Send button not found. Stopping script.");
      break;
    }
  }
})();
