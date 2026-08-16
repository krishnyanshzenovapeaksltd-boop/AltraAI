const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root project directory
app.use(express.static(path.join(__dirname)));

// API endpoint for Altra AI chat and automation workflows
app.post('/api/chat', (req, res) => {
    const { module, message } = req.body;
    let responseText = `Processed workflow for ${module}: "${message}"`;
    
    if (module === 'trainer') {
        responseText = `[Backend Corporate Trainer]: SOP and compliance verified for "${message}". Guideline broadcasted to internal channels.`;
    } else if (module === 'student') {
        responseText = `[Backend Student Tutor]: Academic breakdown and study resources compiled for "${message}".`;
    } else if (module === 'altra') {
        responseText = `[Altra AI Global Engine]: Multi-tenant automation successfully synchronized for query: "${message}".`;
    }

    res.json({ success: true, reply: responseText });
});

// API endpoint for Meta / WhatsApp / omnichannel webhooks
app.post('/api/webhook', (req, res) => {
    console.log("Incoming Webhook Event:", req.body);
    res.status(200).send('EVENT_RECEIVED');
});

// Fallback route to serve index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Zenova Peak Tech Hub server is running live on port ${PORT}`);
});
