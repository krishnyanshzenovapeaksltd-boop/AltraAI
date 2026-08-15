const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Serve static files (like icon.png, CSS, images) from the root directory
app.use(express.static(__dirname));

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatSessions = {};

// Serve your index.html frontend file on the main homepage URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Chat API endpoint supporting multi-bot personas and global configurations
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, clientId, service, country, currency, category } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        const sessionKey = `${clientId}_${service}`;

        if (!chatSessions[sessionKey]) {
            let roleInstruction = `You are Altra AI, a multi-tenant business automation platform and executive assistant created by Krishnyansh Zenova Peak Tech Hub (founded by Ruby Garg).`;
            
            if (service === 'trainer') {
                roleInstruction = `You are the Corporate Trainer Bot for Krishnyansh Zenova Peak Tech Hub. Your role is to train internal staff on company SOPs, customer handling protocols, compliance rules, and professional software engineering guidelines.`;
            } else if (service === 'student') {
                roleInstruction = `You are the Student Tutor Bot for Krishnyansh Zenova Peak Tech Hub. Your role is to provide interactive academic, coding, and skill-building tutorials for programming, math, science, and languages.`;
            } else {
                roleInstruction = `You are AltraAI, operating globally for ${category} under country ${country} with currency ${currency}. You assist clients with automated workflows and bookkeeping reconciliation.`;
            }

            chatSessions[sessionKey] = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: roleInstruction
                }
            });
        }

        const chat = chatSessions[sessionKey];
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
