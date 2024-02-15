const form = document.querySelector("form")
const input = document.querySelector("input")
const reply = document.querySelector(".reply")

form.addEventListener("submit", function (e) {
  e.preventDefault()
  main(input.value)
  input.value = ""
})

async function main(input) {
  try {
    reply.innerHTML = "Thinking..."
    const response = await fetch("http://localhost:3000/ask-prp", {
      // Adjust URL if needed
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: input }),
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const data = await response.json()
    reply.innerHTML = data.answer
  } catch (error) {
    console.error("Error in main function:", error.message)
    reply.innerHTML = "Sorry, something went wrong. Please try again."
  }
}
