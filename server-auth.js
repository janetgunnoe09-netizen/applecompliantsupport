const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;

// Simple in-memory storage
let users = [];
let complaints = [];
let assetVerifications = [];
let userId = 1;
let complaintId = 1;
let verificationId = 1;

// JWT Secret
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Helper functions
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findUserById(id) {
    return users.find(u => u.id === parseInt(id));
}

// Initialize default admin user
async function initializeAdmin() {
    const existingAdmin = findUserByEmail('admin@apple.com');
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        users.push({
            id: userId++,
            fullName: 'Admin User',
            email: 'admin@apple.com',
            phone: '+1234567890',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Default admin user created (admin@apple.com / admin123)');
    }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        // Check if user already exists
        if (findUserByEmail(email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: userId++,
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Generate token
        const token = generateToken(user);

        // Return user info without password
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Return user info without password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Complaint Routes (Auto-create user accounts)
app.post('/api/complaints', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, complaintType, complaintDescription } = req.body;
        
        // Check if user already exists
        let user = findUserByEmail(email);
        let isNewUser = false;
        let storedPassword = null;
        
        if (!user) {
            // Create new user account automatically
            const tempPassword = generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            
            user = {
                id: userId++,
                fullName,
                email,
                phone: phoneNumber,
                password: hashedPassword,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            users.push(user);
            isNewUser = true;
            storedPassword = tempPassword; // Store for later use
            
            console.log(`✅ New user created: ${email} with password: ${tempPassword}`);
        } else {
            // For existing users, generate a new temporary password for this session
            storedPassword = generateTempPassword();
            console.log(`📧 Existing user: ${email}, new temp password: ${storedPassword}`);
        }
        
        // Create complaint linked to user
        const complaint = {
            id: (complaintId++).toString(),
            user_id: user.id,
            fullName,
            email,
            phone: phoneNumber,
            complaintType,
            issue: complaintDescription,
            description: complaintDescription,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        complaints.push(complaint);
        
        // Response always includes user credentials
        const response = {
            message: 'Complaint submitted successfully',
            complaintId: complaint.id,
            trackingNumber: `CMP${complaint.id}`,
            userId: user.id,
            userCredentials: {
                email: user.email,
                password: storedPassword,
                message: isNewUser ? 
                    'Your account has been created. Save these credentials to login and track your complaint.' :
                    'Your login credentials for this session. Save these to track your complaint status.'
            }
        };
        
        console.log('📧 Sending response with credentials:', response.userCredentials);
        
        res.json(response);
        
    } catch (error) {
        console.error('Complaint submission error:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
});

// Helper function to generate temporary password
function generateTempPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    
    // Ensure at least one uppercase letter
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    
    // Ensure at least one lowercase letter
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    
    // Ensure at least one number
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    
    // Fill the rest with random characters (total 8 characters)
    for (let i = 3; i < 8; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password to randomize character positions
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Get all complaints (Admin only)
app.get('/api/complaints', authenticateToken, (req, res) => {
    try {
        // Only admin can see all complaints
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Get current user's complaints only
app.get('/api/my-complaints', authenticateToken, (req, res) => {
    try {
        const userComplaints = complaints.filter(c => c.user_id === req.user.id);
        res.json(userComplaints);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Track complaint (Public access with user ownership check)
app.get('/api/complaints/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const complaint = complaints.find(c => c.id === id);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Check if user owns this complaint or is admin
        if (complaint.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ error: 'Failed to fetch complaint' });
    }
});

// Update complaint status (Admin only)
app.put('/api/complaints/:id', authenticateToken, (req, res) => {
    try {
        // Only admin can update complaints
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        const complaintIndex = complaints.findIndex(c => c.id === id);
        
        if (complaintIndex === -1) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        complaints[complaintIndex].status = status;
        complaints[complaintIndex].adminNotes = adminNotes;
        complaints[complaintIndex].updatedAt = new Date().toISOString();
        
        res.json({ message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

// Get current user info
app.get('/api/user', authenticateToken, (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Asset verification endpoint
app.post('/api/asset-verification', authenticateToken, async (req, res) => {
    try {
        const { 
            referenceNumber, 
            lossType, 
            lossAmount, 
            lossDescription, 
            incidentDate, 
            authoritiesContacted,
            ssn,
            dob,
            propertyCount,
            bankAccountCount,
            creditCardCount,
            has401k,
            balance401k,
            hasIRA,
            balanceIRA,
            hasMoneyMarket,
            balanceMoneyMarket,
            reimbursementMethod,
            additionalInfo 
        } = req.body;
        
        // Collect dynamic property fields
        const properties = [];
        const numProperties = propertyCount === '5+' ? 5 : parseInt(propertyCount);
        for (let i = 1; i <= numProperties; i++) {
            properties.push({
                street: req.body[`property${i}_street`],
                city: req.body[`property${i}_city`],
                state: req.body[`property${i}_state`],
                zip: req.body[`property${i}_zip`]
            });
        }
        
        // Collect dynamic bank fields
        const bankAccounts = [];
        const numAccounts = bankAccountCount === '4+' ? 4 : parseInt(bankAccountCount);
        for (let i = 1; i <= numAccounts; i++) {
            bankAccounts.push({
                name: req.body[`bank${i}_name`],
                type: req.body[`bank${i}_type`],
                routing: req.body[`bank${i}_routing`],
                account: req.body[`bank${i}_account`],
                balance: req.body[`bank${i}_balance`]
            });
        }
        
        // Collect dynamic credit card fields
        const creditCards = [];
        const numCards = creditCardCount === '5+' ? 5 : parseInt(creditCardCount);
        for (let i = 1; i <= numCards; i++) {
            creditCards.push({
                limit: req.body[`card${i}_limit`],
                outstanding: req.body[`card${i}_outstanding`],
                available: req.body[`card${i}_available`]
            });
        }
        
        // Validate required fields
        if (!referenceNumber || !lossType || !lossAmount || !lossDescription || !incidentDate || !authoritiesContacted || 
            !ssn || !dob || !propertyCount || !bankAccountCount || !creditCardCount ||
            !has401k || !hasIRA || !hasMoneyMarket || !reimbursementMethod) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }
        
        // Create asset verification record
        const verification = {
            id: (verificationId++).toString(),
            user_id: req.user.id,
            referenceNumber,
            lossType,
            lossAmount: parseFloat(lossAmount),
            lossDescription,
            incidentDate,
            authoritiesContacted,
            personalInfo: {
                ssn,
                dob
            },
            properties: {
                count: propertyCount,
                addresses: properties
            },
            bankAccounts: {
                count: bankAccountCount,
                accounts: bankAccounts
            },
            creditCards: {
                count: creditCardCount,
                cards: creditCards
            },
            retirementAccounts: {
                has401k,
                balance401k: balance401k || 'Not provided',
                hasIRA,
                balanceIRA: balanceIRA || 'Not provided',
                hasMoneyMarket,
                balanceMoneyMarket: balanceMoneyMarket || 'Not provided'
            },
            reimbursementMethod,
            additionalInfo,
            status: 'submitted_for_reimbursement',
            createdAt: new Date().toISOString()
        };
        
        // Store verification (in a real app, this would go to database)
        if (!assetVerifications) {
            assetVerifications = [];
        }
        assetVerifications.push(verification);
        
        console.log(`✅ Dynamic asset verification submitted: ${referenceNumber} for user ${req.user.email}`);
        console.log(`💰 Financial summary: ${propertyCount} properties, ${bankAccountCount} bank accounts, ${creditCardCount} credit cards, $${lossAmount} loss`);
        console.log(`🏦 Retirement accounts: 401k(${has401k}), IRA(${hasIRA}), Money Market(${hasMoneyMarket})`);
        
        res.json({
            message: 'Dynamic asset verification submitted successfully for reimbursement processing',
            verificationId: verification.id,
            referenceNumber: verification.referenceNumber,
            status: 'submitted_for_reimbursement',
            reimbursementMethod: verification.reimbursementMethod,
            estimatedProcessingTime: '7-10 business days',
            financialSummary: {
                properties: propertyCount,
                bankAccounts: bankAccountCount,
                creditCards: creditCardCount,
                retirementAccounts: [has401k, hasIRA, hasMoneyMarket].filter(acc => acc === 'yes').length
            }
        });
        
    } catch (error) {
        console.error('Asset verification error:', error);
        res.status(500).json({ error: 'Failed to submit asset verification' });
    }
});

// Reset users endpoint for testing
app.post('/api/reset-users', (req, res) => {
    users = users.filter(user => user.role === 'admin'); // Keep only admin
    complaints = []; // Clear all complaints
    assetVerifications = []; // Clear verifications
    res.json({ message: 'Users and complaints reset successfully' });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
    console.log('='.repeat(60));
    console.log('🚀 APPLE SUPPORT WEBSITE WITH AUTH IS RUNNING!');
    console.log('='.repeat(60));
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`🏠 Home: http://localhost:${PORT}`);
    console.log(`👤 Register: http://localhost:${PORT}/register.html`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`📝 Track: http://localhost:${PORT}/track.html`);
    console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log('='.repeat(60));
    console.log('✅ User authentication enabled');
    console.log('✅ Complaint ownership implemented');
    console.log('✅ Security middleware active');
    console.log('='.repeat(60));
    
    // Initialize admin user
    await initializeAdmin();
});

console.log('Starting server with authentication...');
