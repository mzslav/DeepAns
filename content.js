const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat" },
  { id: "deepseek/deepseek-r1-distill-llama-70b", name: "DeepSeek R1" },
];

function getModels() {
  return MODELS;
}

document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    const existingButton = document.getElementById("deepans-selection-button");
    if (existingButton) existingButton.remove();
    

    if (selectedText.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const button = document.createElement("button");
      button.id = "deepans-selection-button";
      button.style.cssText = `
        position: absolute;
        top: ${window.scrollY + rect.bottom + 5}px;
        left: ${window.scrollX + rect.left + 5}px;
        z-index: 10000;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
      `;

      const img = document.createElement("img");
      img.alt = "Analyze";
      img.style.cssText = "width:24px;height:24px;";
      img.src = "https://static.thenounproject.com/png/209393-200.png";
      button.appendChild(img);

      button.addEventListener("click", () => {
        const btnRect = button.getBoundingClientRect();
        chrome.runtime.sendMessage({
          action: "showModal",
          text: selectedText,
          top: window.scrollY + btnRect.bottom + 5,
          left: window.scrollX + btnRect.right + 5
        });
      });

      document.body.appendChild(button);
    }
  }, 100);
});

// Основна логіка
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showModal") {
    const existingModal = document.getElementById("deepans-modal");
    if (existingModal) existingModal.remove();

    // Створюємо модальне вікно
    const modal = document.createElement("div");
    modal.id = "deepans-modal";
    modal.style.cssText = `
      position: absolute;
      width: 420px;
      padding: 15px;
      padding-top: 5px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      cursor: default;
    `;
    const button = document.getElementById("deepans-selection-button");
    if (button) {
      const btnRect = button.getBoundingClientRect();
      modal.style.top = `${window.scrollY + btnRect.bottom + 5}px`;
      modal.style.left = `${window.scrollX + btnRect.right + 5}px`;
    }

    // Заголовок для перетягування
    const header = document.createElement("div");
    header.style.cssText = `
      cursor: move;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    // Хрестик для закриття
    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;";
    closeButton.style.cssText = `
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0 5px;
      padding-bottom: 15px;
      margin-left: auto;
    `;
    closeButton.addEventListener("click", () => modal.remove());

    // Логіка перетягування вікна
    let isDragging = false;
    let startX, startY, initialX, initialY;

    const initDrag = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = modal.offsetLeft;
      initialY = modal.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      modal.style.left = `${initialX + dx}px`;
      modal.style.top = `${initialY + dy}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    // Додаємо можливість перетягування для всіх сторін вікна
    modal.addEventListener("mousedown", initDrag);

    // Закриття вікна при кліку за його межами
    document.addEventListener("click", (e) => {
      if (!modal.contains(e.target)) {
        modal.remove();
      }
    });

    // Поле для введення тексту
    const textarea = document.createElement("textarea");
    textarea.style.cssText = `
      width: 100%;
      height: 80px;
      margin-bottom: 12px;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 14px;
      resize: none;
    `;
    textarea.value = message.text;

    // Контейнер для відповіді
    const responseContainer = document.createElement("div");
    responseContainer.style.cssText = "margin-top: 12px; font-size: 14px;";

    // Випадаючий список моделей
    const modelSelect = document.createElement("select");
    modelSelect.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      width: 100%;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 14px;
    `;

    getModels().forEach((model) => {
      const option = document.createElement("option");
      option.value = model.id;
      option.innerText = model.name;
      modelSelect.appendChild(option);
    });

    // Кнопка "Send"
    const sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.style.cssText = `
      background-color:rgb(88, 140, 238);
      color: white;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;

    sendButton.addEventListener("click", async () => {
      const selectedModel = modelSelect.value;
      const apiKey = "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";
      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

      const loadingMessage = document.createElement("div");
      loadingMessage.innerText = `Loading... (${modelSelect.selectedOptions[0].innerText})`;
      responseContainer.appendChild(loadingMessage);

      const requestBody = {
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: `You answer briefly. If you need to choose one or more answers from the given options, write only the answers. ${textarea.value}`
          }
        ]
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "No response received.";

          const modelResponse = document.createElement("div");
          modelResponse.style.cssText = `
            margin-top: 12px;
            padding: 10px;
            border-radius: 6px;
            background-color: #f1f1f1;
          `;

          const modelTitle = document.createElement("strong");
          modelTitle.innerText = `${modelSelect.selectedOptions[0].innerText}:`;
          modelResponse.appendChild(modelTitle);

          const modelContent = document.createElement("p");
          modelContent.innerText = content;
          modelResponse.appendChild(modelContent);

          responseContainer.removeChild(loadingMessage);
          responseContainer.appendChild(modelResponse);
        } else {
          loadingMessage.innerText = `Error: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        loadingMessage.innerText = `Error: ${error.message}`;
      }
    });

    // Складання елементів
    header.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(modelSelect);
    modal.appendChild(textarea);
    modal.appendChild(sendButton);
    modal.appendChild(responseContainer);
    document.body.appendChild(modal);
  }
});
