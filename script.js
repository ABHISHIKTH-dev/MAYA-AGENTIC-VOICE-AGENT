
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const sendButton = document.getElementById("sendButton");

const newChatButton = document.getElementById("newChat");
const clearChatButton = document.getElementById("clearChat");
const suggestions = document.querySelectorAll(".suggestion");

// Change this to your deployed backend URL if it is
// hosted separately from your GitHub Pages website.
const API_URL = "/api/chat";

function addMessage(text, role) {
  welcome.style.display = "none";

  const row = document.createElement("div");
  row.className = "message-row";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "assistant" ? "✦" : "A";

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  if (role === "user") {
    row.classList.add("user-row");
    row.appendChild(content);
  } else {
    row.appendChild(avatar);
    row.appendChild(content);
  }

  messages.appendChild(row);

  const conversation = document.getElementById("conversation");
  conversation.scrollTop = conversation.scrollHeight;

  return content;
}

async function sendMessage(message) {
  const cleanMessage = message.trim();

  if (!cleanMessage || sendButton.disabled) return;

  addMessage(cleanMessage, "user");

  input.value = "";
  input.style.height = "auto";
  sendButton.disabled = true;

  const replyElement = addMessage("Maya is thinking...", "assistant");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: cleanMessage
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The server could not answer."
      );
    }

    replyElement.textContent =
      data.reply || "I didn't receive a response.";

  } catch (error) {
    replyElement.textContent =
      "Sorry, I couldn't connect to Maya's AI service. " +
      "Check that your backend is running and API_URL is correct.";
    console.error(error);
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

// Enter sends; Shift + Enter creates a new line.
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Automatically increase the input height.
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height =
    Math.min(input.scrollHeight, 150) + "px";
});

// Suggested prompt buttons.
suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.querySelector("strong").textContent;

    const prompts = {
      "Write an email":
        "Help me write a professional email.",
      "Research a topic":
        "Help me research a topic and explain it clearly.",
      "Make a plan":
        "Help me create an organized plan for my tasks.",
      "Improve my writing":
        "Help me improve a piece of writing."
    };

    sendMessage(prompts[title] || title);
  });
});

// Start a new conversation.
function clearConversation() {
  messages.innerHTML = "";
  welcome.style.display = "block";
  input.value = "";
  input.style.height = "auto";
  input.focus();
}

newChatButton.addEventListener("click", clearConversation);
clearChatButton.addEventListener("click", clearConversation);
