const form = document.getElementById("form-el")
const input = document.getElementById("input-el")
const reply = document.getElementById("reply-el")
const historyContainer = document.getElementById("history-container")

form.addEventListener("submit", function (e) {
  e.preventDefault()
  // Check if input is not empty and not just whitespace before calling main()
  if (input.value.trim()) {
    main(input.value)
  }
})

async function main(question) {
  reply.innerHTML = "Thinking..."
  input.value = ""
  try {
    const response = await fetch("http://localhost:3000/ask-prp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    reply.innerHTML = "" // Clear the "Thinking..." message
    document.getElementById("history-container").style.display = "block"
    keepHistory(question, data.answer) // Append the question and its answer to the history
  } catch (error) {
    reply.innerHTML = "Error: " + error.message
  }
}

function keepHistory(question, answer) {
  const historyEntry = document.createElement("div")
  historyEntry.classList.add("history-entry")
  historyEntry.innerHTML = `${question} <br><br> ${answer}`
  historyContainer.appendChild(historyEntry)
}
