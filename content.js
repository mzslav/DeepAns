const MODELS = [
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "deepseek/deepseek-r1-distill-llama-70b", name: "DeepSeek R1" },
  { id: "google/gemini-2.0-flash-thinking-exp:free", name: "Gemini 2.0" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Meta Lama 3.1" },
  { id: "eva-unit-01/eva-qwen-2.5-72b", name: "Qwen2.5" },
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
    
    chrome.storage.sync.get(['enabled'], (result) => {
      if (result.enabled && selectedText.length > 5) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect(); 

        const button = document.createElement("button");
        button.id = "deepans-selection-button";
        button.classList.add("deepans-selection-button");  
        const img = document.createElement("img");
        img.alt = "Analyze";
        img.classList.add("deepans-selection-img"); 
        img.src = "https://static.thenounproject.com/png/2486994-200.png";
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

        button.style.top = `${window.scrollY + rect.bottom + 5}px`;
        button.style.left = `${window.scrollX + rect.left + 5}px`;
      }
    });
  }, 100);
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showModal") {
    const existingModal = document.getElementById("deepans-modal");
    if (existingModal) existingModal.remove();


    const modal = document.createElement("div");
    modal.id = "deepans-modal";
    modal.classList.add("deepans-modal");
    const button = document.getElementById("deepans-selection-button");
    if (button) {
      const btnRect = button.getBoundingClientRect();
      modal.style.top = `${window.scrollY + btnRect.bottom + 5}px`;
      modal.style.left = `${window.scrollX + btnRect.right + 5}px`;
    }


    const header = document.createElement("div");
    header.classList.add("deepans-modal-header");


    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;";
    closeButton.classList.add("deepans-modal-close");
    closeButton.addEventListener("click", () => modal.remove());


    let isDragging = false;
    let startX, startY, initialX, initialY;

    const initDrag = (e) => {
      
      if (e.target.tagName === "TEXTAREA" || e.target.closest('.deepans-modal-response')) {
        return;
      }
    
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


    modal.addEventListener("mousedown", initDrag);


    document.addEventListener("click", (e) => {
      if (!modal.contains(e.target)) {
        modal.remove();
      }
    });

    const toggleContainer = document.createElement("div");
    toggleContainer.classList.add("toggle-container");
    
    const fastModeContainer = document.createElement("div");
    fastModeContainer.classList.add("fast-mode-container");
    
    const fastModeLabel = document.createElement("span");
    fastModeLabel.innerText = "Fast Mode";
    fastModeLabel.classList.add("fast-mode-label");
    
    const fastModeToggleLabel = document.createElement("label");
    fastModeToggleLabel.classList.add("switch");
    
    const fastModeToggleInput = document.createElement("input");
    fastModeToggleInput.type = "checkbox";
    
    const fastModeToggleSlider = document.createElement("span");
    fastModeToggleSlider.classList.add("slider", "round");
    
    fastModeToggleLabel.appendChild(fastModeToggleInput);
    fastModeToggleLabel.appendChild(fastModeToggleSlider);
    
    fastModeContainer.appendChild(fastModeLabel);
    fastModeContainer.appendChild(fastModeToggleLabel);
    
    const streamContainer = document.createElement("div");
    streamContainer.classList.add("stream-container");
    
    const streamLabel = document.createElement("span");
    streamLabel.innerText = "Stream";
    streamLabel.classList.add("stream-label");
    
    const streamToggleLabel = document.createElement("label");
    streamToggleLabel.classList.add("switch");
    
    const streamToggleInput = document.createElement("input");
    streamToggleInput.type = "checkbox";
    
    const streamToggleSlider = document.createElement("span");
    streamToggleSlider.classList.add("slider", "round");
    
    streamToggleLabel.appendChild(streamToggleInput);
    streamToggleLabel.appendChild(streamToggleSlider);
    
    streamContainer.appendChild(streamLabel);
    streamContainer.appendChild(streamToggleLabel);
    
    toggleContainer.appendChild(fastModeContainer);
    toggleContainer.appendChild(streamContainer);
    

    chrome.storage.sync.get(["fastModeEnabled", "streamEnabled"], (data) => {
        if (data.fastModeEnabled === undefined) {
            chrome.storage.sync.set({ fastModeEnabled: false });
            fastModeToggleInput.checked = false;
        } else {
            fastModeToggleInput.checked = data.fastModeEnabled;
        }
    
        if (data.streamEnabled === undefined) {
            chrome.storage.sync.set({ streamEnabled: true });
            streamToggleInput.checked = true;
        } else {
            streamToggleInput.checked = data.streamEnabled;
        }
    });
    

    fastModeToggleInput.addEventListener("change", () => {
        chrome.storage.sync.set({ fastModeEnabled: fastModeToggleInput.checked });
    });
    
    streamToggleInput.addEventListener("change", () => {
        chrome.storage.sync.set({ streamEnabled: streamToggleInput.checked });
    });
    
    const textarea = document.createElement("textarea");
    textarea.classList.add("deepans-modal-textarea");
    textarea.value = message.text;
    
    const responseContainer = document.createElement("div");
    responseContainer.classList.add("deepans-modal-response-container");
    
    const modelSelect = document.createElement("select");
    modelSelect.classList.add("deepans-modal-select");
    
    getModels().forEach((model) => {
      const option = document.createElement("option");
      option.value = model.id;
      option.innerText = model.name;
      modelSelect.appendChild(option);
    });
    
    const sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.classList.add("deepans-modal-send-button");



  sendButton.addEventListener("click", async () => {
  const selectedModel = modelSelect.value;
  const apiKey = "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";
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  const isStreamEnabled = streamToggleInput.checked;
  const isFastModeEnabled = fastModeToggleInput.checked;
  const models = isFastModeEnabled ? Array.from(modelSelect.options).map(opt => ({ value: opt.value, text: opt.innerText })) : [{ value: selectedModel, text: modelSelect.selectedOptions[0].innerText }];



  models.forEach(async ({ value: model, text: modelText }) => {
    const loadingMessage = document.createElement("div");
    loadingMessage.innerText = `Loading... (${modelText})`;
    responseContainer.appendChild(loadingMessage);

    const requestBody = {
      model,
      messages: [
        {
          role: "user",
          content: `You answer briefly. If you need to choose one or more answers from the given options, write only the answers. ${textarea.value}`
        }
      ],
      stream: isStreamEnabled
    };

    if (isStreamEnabled) {
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
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let content = "";

          const modelResponse = document.createElement("div");
          modelResponse.classList.add("deeepans-modal-respons");

          const modelTitle = document.createElement("strong");
          modelTitle.innerText = `${modelText}:`;
          modelResponse.appendChild(modelTitle);

          const modelContent = document.createElement("p");
          modelResponse.appendChild(modelContent);

          const copyButton = document.createElement("button");
          copyButton.innerText = "Copy";
          copyButton.classList.add("deepans-modal-copy-button");

          copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(modelContent.innerText).then(() => {
              const confirmationMessage = document.createElement("div");
              confirmationMessage.classList.add("deepans-modal-copy-confirmation");
              confirmationMessage.innerText = "Text copied!";
              document.body.appendChild(confirmationMessage);

              setTimeout(() => {
                confirmationMessage.remove();
              }, 2000);
            }).catch(err => console.error("Error copying text: ", err));
          });

          responseContainer.removeChild(loadingMessage);
          responseContainer.appendChild(modelResponse);
          responseContainer.appendChild(copyButton);

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value, { stream: true });
            const responseParts = chunk.split('\n');

            for (let part of responseParts) {
              if (part.startsWith("data:")) {
                const data = JSON.parse(part.slice(5));
                const contentPart = data.choices?.[0]?.delta?.content;
                if (contentPart) {
                  content += contentPart;
                  modelContent.innerText = content;
                }
              }
            }
          }
        } else {
          loadingMessage.innerText = `Error: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        loadingMessage.innerText = `Error: ${error.message}`;
      }
    } else {
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
          modelResponse.classList.add("deepans-modal-response");

          const modelTitle = document.createElement("strong");
          modelTitle.innerText = `${modelText}:`;
          modelResponse.appendChild(modelTitle);

          const modelContent = document.createElement("p");
          modelContent.innerText = content;
          modelResponse.appendChild(modelContent);

          const copyButton = document.createElement("button");
          copyButton.innerText = "Copy";
          copyButton.classList.add("deepans-modal-copy-button");

          copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(modelContent.innerText).then(() => {
              const confirmationMessage = document.createElement("div");
              confirmationMessage.classList.add("deepans-modal-copy-confirmation");
              confirmationMessage.innerText = "Text copied!";
              document.body.appendChild(confirmationMessage);

              setTimeout(() => {
                confirmationMessage.remove();
              }, 2000);
            }).catch(err => console.error("Error copying text: ", err));
          });

          responseContainer.removeChild(loadingMessage);
          responseContainer.appendChild(modelResponse);
          responseContainer.appendChild(copyButton);
        } else {
          loadingMessage.innerText = `Error: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        loadingMessage.innerText = `Error: ${error.message}`;
      }
    }
  });
});

    

  
    header.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(toggleContainer);
    modal.appendChild(modelSelect);
    modal.appendChild(textarea);
    modal.appendChild(sendButton);
    modal.appendChild(responseContainer);
    document.body.appendChild(modal);
  }
});
