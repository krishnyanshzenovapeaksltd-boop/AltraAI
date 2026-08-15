const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, icon.png, images) from the root directory
app.use(express.static(__dirname));

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Serve your index.html frontend file on the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Unified Chat API Endpoint for Dashboard Modules (AltraAI, Trainer, Student)
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, service, country, currency, category } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        let systemInstruction = `You are Altra AI, a multi-tenant business automation platform and executive assistant created by Krishnyansh Zenova Peak Tech Hub (founded by Ruby Garg). Operating in ${country} with currency ${currency} for category "${category}".`;
        
        if (service === 'trainer') {
            systemInstruction = `You are the Corporate Trainer Bot for Krishnyansh Zenova Peak Tech Hub (founded by Ruby Garg). Train internal staff on company SOPs, terms & conditions, customer handling protocols, and compliance rules in a professional and clear tone.`;
        } else if (service === 'student') {
            systemInstruction = `You are the Student Tutor Bot for Krishnyansh Zenova Peak Tech Hub. Provide interactive academic, coding, and skill-building tutorials for programming, math, science, and languages.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// WhatsApp Webhook Verification (Meta Cloud API requirement)
app.get('/api/whatsapp-webhook', (req, res) => {
    const VERIFY_TOKEN = "altra_secure_token";
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// WhatsApp Inbound Message Handler
app.post('/api/whatsapp-webhook', async (req, res) => {
    try {
        const body = req.body;
        if (body.object) {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const senderPhone = message.from;
                const messageText = message.text?.body;

                // Generate AI reply using Gemini
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: messageText,
                    config: {
                        systemInstruction: `You are Altra AI, the official automated business assistant for Krishnyansh Zenova Peak Tech Hub (founded by Ruby Garg). Answer the client professionally on WhatsApp.`
                    }
                });

                console.log(`[WhatsApp Bot] Reply to ${senderPhone}: ${response.text}`);
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('WhatsApp Webhook Error:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Altra AI Server running smoothly on port ${PORT}`);
});
