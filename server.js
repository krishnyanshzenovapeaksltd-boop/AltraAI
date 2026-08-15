// ==========================================
// ALTRA AI CLIENT AUTOMATION BACKEND
// Zenova Peak Tech Hub(KRISHNYANSH ZENOVA PEAKS) | Founder: RubyGarg
// ==========================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5001;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatSessions = {};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ 
        message: "Altra AI Automation Engine is live!", 
        company: "Zenova Peak Tech Hub",
        founder: "Ruby Garg"
    });
});

// Client Chat Endpoint with Service-Aware System Instructions
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, clientId = "default_client", service = "General Assistant" } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Create or reset session if service changes
        const sessionKey = `${clientId}_${service}`;
        if (!chatSessions[sessionKey]) {
            chatSessions[sessionKey] = ai.chats.create({
                model: 'gemini-3.5-flash',
                config: {
                    systemInstruction: `You are Altra AI, a specialized ${service} module developed by Zenova Peak Tech Hub (Founder: Ruby Garg). Provide expert, professional guidance tailored specifically to ${service}. Always represent Zenova Peak Tech Hub with excellence.`
                }
            });
        }

        const chat = chatSessions[sessionKey];
        const response = await chat.sendMessage({ message: prompt });

        res.json({ 
            success: true, 
            reply: response.text 
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Altra AI Client Server running smoothly on port ${PORT}`);
});
