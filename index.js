import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const mySecret = process.env["openaikey"];
const messages = [];
const client = new OpenAI({
  apiKey: mySecret,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json()); // Parse JSON request bodies

async function main(userInput) {
  messages.push({ role: "user", content: userInput });

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo", // changed to GPT-3.5-turbo
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    console.log(reply);
    messages.push({ role: "assistant", content: reply }); // Store assistant response
    return reply;
  } catch (error) {
    console.error("Error:", error);
    return "Error: " + error.message; // Return error message to client
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});

app.post("/api", async (req, res) => {
  try {
    const userInput = req.body.input;
    if (!userInput) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide user input" });
    }
    const mes = await main(userInput);
    res.json({ success: true, message: mes });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Express server initialized");
});
