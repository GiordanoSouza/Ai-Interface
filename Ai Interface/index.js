const API_KEY = "";
const API_URL = "https://api.openai.com/v1/chat/completions";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");

let lastRequestTime = 0;
const REQUEST_INTERVAL = 3000; // 3 segundos

const canMakeRequest = () => {
  const now = Date.now();
  if (now - lastRequestTime >= REQUEST_INTERVAL) {
    lastRequestTime = now;
    return true;
  }
  return false;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const backoff = async (fn, retries = 5) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        resultText.innerText = `Too many requests. Retrying in ${delay / 1000} seconds...`;
        await sleep(delay);
        attempt++;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};

const generate = async () => {
  if (!canMakeRequest()) {
    resultText.innerText = "Please wait a moment before making another request.";
    return;
  }

  try {
    const response = await backoff(() => fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptInput.value }],
      }),
    }));

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      resultText.innerText = data.choices[0].message.content;
    } else {
      resultText.innerText = "No completions received.";
    }
  } catch (error) {
    console.error("Error:", error);
    resultText.innerText = "Error occurred while generating.";
  }
};

generateBtn.addEventListener("click", generate);
promptInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    generate();
  }
});
