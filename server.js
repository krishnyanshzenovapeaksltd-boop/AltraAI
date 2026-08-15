const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatSessions = {};

// Serve your index.html frontend file on the main homepage URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, clientId, service, country, currency, category } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        if (!chatSessions[clientId]) {
            chatSessions[clientId] = ai.chats.create({
                model: 'gemini-3.5-flash',
                config: {
                    systemInstruction: `You are Altra AI, a multi-tenant business automation platform and executive assistant created by Krishnyansh Zenova Peak Tech Hub (founded by Ruby Garg). 
                    The current user is operating in ${country}, using currency ${currency}, within the business category "${category}". 
                    You are currently acting within the module: "${service}". 
                    Provide professional, accurate, and localized business guidance tailored specifically to their industry.`
                }
            });
        }

        const chat = chatSessions[clientId];
        const result = await chat.sendMessage({ message: prompt });
        
        res.json({ success: true, reply: result.text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Altra AI Client Server running smoothly on port ${PORT}`);
});
