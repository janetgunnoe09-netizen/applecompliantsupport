const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const complaintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 complaints per hour
    message: 'Too many complaint submissions, please try again later.'
});

app.use('/api/', limiter);
app.post('/api/complaints', complaintLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// File-based data storage
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file
async function initializeData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Create initial data structure
        const initialData = {
            complaints: [],
            admin: {
                username: 'admin',
                password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjO' // 'admin123' hashed
            }
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
}

// Read data from file
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return await initializeData();
    }
}

// Write data to file
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all complaints (admin only)
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submit new complaint
app.post('/api/complaints', [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').trim().isLength({ min: 10, max: 20 }).withMessage('Valid phone number required'),
    body('product').trim().isLength({ min: 1, max: 100 }).withMessage('Product selection required'),
    body('issue').trim().isLength({ min: 10, max: 1000 }).withMessage('Issue description must be 10-1000 characters'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Valid priority required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, product, issue, priority } = req.body;
        
        const data = await readData();
        const complaint = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            product,
            issue,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.complaints.push(complaint);
        await writeData(data);

        res.status(201).json({ 
            message: 'Complaint submitted successfully',
            complaintId: complaint.id,
            trackingNumber: `CMP${complaint.id}`
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track complaint
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readData();
        const complaint = data.complaints.find(c => c.id === id);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update complaint status (admin only)
app.put('/api/complaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        const data = await readData();
        const complaintIndex = data.complaints.findIndex(c => c.id === id);
        
        if (complaintIndex === -1) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        data.complaints[complaintIndex].status = status;
        data.complaints[complaintIndex].adminNotes = adminNotes;
        data.complaints[complaintIndex].updatedAt = new Date().toISOString();
        
        await writeData(data);
        res.json({ message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin login
app.post('/api/admin/login', [
    body('username').trim().isLength({ min: 1 }).withMessage('Username required'),
    body('password').isLength({ min: 1 }).withMessage('Password required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const data = await readData();
        
        if (username !== data.admin.username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, data.admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { username: data.admin.username },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Apple Support Server running on http://localhost:${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔧 Admin panel at http://localhost:${PORT}/admin.html`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log('📝 Using file-based database (data.json)');
});

// Initialize data on startup
initializeData().then(() => {
    console.log('✅ Database initialized');
}).catch(error => {
    console.error('❌ Error initializing database:', error);
});
