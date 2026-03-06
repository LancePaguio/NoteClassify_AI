require("dotenv").config();

const express = require("express");
const path    = require("path");

const app  = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.static(__dirname));

// the gemini model used for this app. This is the free version, you can change this to any model that you like.
const GEMINI_MODEL = "gemini-2.5-flash-lite";

// you can change the properties here.
const SYSTEM_PROMPT = `Classify these notes. First, analyse the provided note or image, and return ONLY a YAML block. No markdown fences and no extra prose with exactly these fields:

domain: (Example: Technology, Science, Mathematics, Humanities, Arts, Business, Health, Law)
sub-domain: (specific area within the domain)
branch: (specific branch or subfield within the sub-domain)
topic: (the topic)
summary: (brief description of the note in one sentence)
tags:
  - tag1
  - tag2
  - tag3
`;

app.post("/api/classify", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set in .env" });
    }

    const { type, text, filename, base64, mimeType } = req.body;

    let parts;
    if (type === "image") {
      parts = [
        { text: SYSTEM_PROMPT },
        { inlineData: { mimeType, data: base64 } },
        { text: "Classify this note image. If it contains handwriting, read it carefully before classifying." },
      ];
    } else {
      parts = [
        { text: SYSTEM_PROMPT },
        { text: `Classify this note (filename: ${filename}):\n\n${text}` },
      ];
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      const msg = err.error?.message || `Gemini API error ${geminiRes.status}`;
      return res.status(geminiRes.status).json({ error: msg });
    }

    const data   = await geminiRes.json();
	const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

	if (!result) {
	  return res.status(500).json({ error: "No response from Gemini" });
	}

	// Change this part here to 24 hour or 12 hour clock format

    // 12 hour clock format
	const now = new Date();
	const date = now.toISOString().split("T")[0];
	const hours = now.getHours();
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const seconds = now.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;
	const time = `${hours12}:${minutes}:${seconds} ${ampm}`;

	const yamlWithDate = `date: ${date}\ntime: ${time}\n${result}`;

    // 24 hour clock
	// const now = new Date();
	// const date = now.toISOString().split("T")[0];
	// const time = now.toTimeString().split(" ")[0];
	//
	// const yamlWithDate = `date: ${date}\ntime: ${time}\n${result}`;
	//
	// res.json({ result });
	// res.json({ result: yamlWithDate });

res.json({ result: yamlWithDate });

  } catch (err) {
    console.error("Classification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/login.html"));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
