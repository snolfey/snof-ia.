const form = document.getElementById("chatForm");
const input = document.getElementById("prompt");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");

let history = [];

function addMessage(role, content) {
  const welcome = document.querySelector(".welcome");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = "msg " + role;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "✦";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;
  row.append(avatar, bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function setLoading(value) {
  sendBtn.disabled = value;
  input.disabled = value;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;

  addMessage("user", text);
  history.push({ role: "user", content: text });
  input.value = "";
  input.style.height = "auto";
  setLoading(true);

  const bubble = addMessage("assistant", "Pensando...");
  bubble.classList.add("typing");

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro ao falar com a IA.");

    bubble.classList.remove("typing");
    bubble.textContent = data.reply;
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    bubble.classList.remove("typing");
    bubble.textContent = "Não consegui responder agora. Confira a configuração da API no Netlify.";
    console.error(err);
  } finally {
    setLoading(false);
    input.focus();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

newChat.addEventListener("click", () => {
  history = [];
  messages.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">✦</div>
      <h2>Olá! Eu sou a SNOF.</h2>
      <p>Digite uma mensagem abaixo para começar.</p>
    </div>`;
  input.value = "";
  input.focus();
});
