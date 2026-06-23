const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Simple in-memory storage
let complaints = [];
let complaintId = 1;

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// API Routes
app.get('/api/complaints', (req, res) => {
    res.json(complaints);
});

app.post('/api/complaints', (req, res) => {
    const complaint = {
        id: (complaintId++).toString(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    complaints.push(complaint);
    res.json({ message: 'Complaint submitted', id: complaint.id });
});

app.get('/api/complaints/:id', (req, res) => {
    const complaint = complaints.find(c => c.id === req.params.id);
    if (complaint) {
        res.json(complaint);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 APPLE SUPPORT WEBSITE IS RUNNING!');
    console.log('='.repeat(60));
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`🏠 Home: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`📝 Track: http://localhost:${PORT}/track.html`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log('='.repeat(60));
    console.log('✅ Server is ready!');
    console.log('📝 Open your browser and visit: http://localhost:8080');
    console.log('⚠️  Press Ctrl+C to stop the server');
    console.log('='.repeat(60));
});

console.log('Starting server...');
