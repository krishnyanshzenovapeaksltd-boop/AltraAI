const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// In-memory global logs to track worldwide app usage
global.appLogs = {
    bookings: [],
    invoices: [],
    queries: [],
    activeUsers: 0
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Worldwide Activity Receiver Endpoint
app.post('/api/telemetry', (req, res) => {
    const event = req.body;
    console.log(`[WORLDWIDE EVENT - ${event.type.toUpperCase()}]:`, event.data);
    
    if (event.type === 'booking') global.appLogs.bookings.push(event.data);
    if (event.type === 'invoice') global.appLogs.invoices.push(event.data);
    if (event.type === 'query') global.appLogs.queries.push(event.data);

    res.json({ success: true, message: "Telemetry recorded on Zenova Peak server." });
});

// Admin Dashboard Endpoint to view worldwide activity
app.get('/api/admin/logs', (req, res) => {
    res.json(global.appLogs);
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Zenova Peak Tech Hub backend tracking live on port ${PORT}`);
});
