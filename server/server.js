const express = require("express")
const cors = require("cors")
const fs = require("fs").promises
const path = require("path")
require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")
const { OpenAI } = require("openai")

const server = express()
const PORT = process.env.PORT || 3000

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

// OpenAI client initialization as per the OpenAI documentation
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

server.use(express.json())
server.use(cors())

// Serve static files from the 'public' directory
server.use(express.static(path.join(__dirname, "..", "public")))

// Function to read the context from prp_treatment.txt
async function getPrpContext() {
  const contextFilePath = path.join(__dirname, "data", "prp_treatment.txt")
  try {
    const contextData = await fs.readFile(contextFilePath, "utf8")
    return contextData
  } catch (error) {
    console.error("Error reading PRP context file:", error)
    return "" // return empty context if file read fails
  }
}

// POST route for PRP questions
server.post("/ask-prp", async (req, res) => {
  const { question } = req.body
  const context = await getPrpContext()

  try {
    // Updated as per the OpenAI documentation
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `${context} You are a PRP AI Assistant, 
          helping people with answering thier quesions on PRP treatments, 
          based on this information, 
          answer the question, if you coludn't find the answer, 
          do your best: ${question}`,
        },
      ],
      stream: true,
    })

    let responseContent = ""
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0 && chunk.choices[0].delta) {
        responseContent += chunk.choices[0].delta.content || ""
      }
    }

    // Trim the response content and ensure it's not undefined or null
    responseContent = responseContent.trim()
    if (!responseContent) {
      responseContent = "No answer was provided by the AI."
    }

    // Send the response content back to the client
    res.json({ answer: responseContent })
  } catch (error) {
    console.error("Error in OpenAI request:", error.message)
    res.status(500).json({ error: "Failed to process the question." })
  }
})

// Handle GET request for root
server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
