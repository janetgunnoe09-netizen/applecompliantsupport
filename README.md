# Apple Support Complaint Portal

A modern, Apple Support-inspired website with a comprehensive complaint management system. This project includes both a customer-facing interface and an admin dashboard for managing complaints.

## Features

### Customer Interface
- **Apple Support-style Design**: Clean, modern interface inspired by Apple's official support website
- **Responsive Design**: Fully mobile-responsive layout that works on all devices
- **Comprehensive Complaint Form**:
  - Full Name, Phone, Email (required)
  - Apple ID (optional)
  - Complaint Type dropdown (Fraud, Purchase, Product, Other)
  - Detailed description textarea
- **Real-time Form Validation**: Input validation with error messages
- **Security Features**: Rate limiting, input sanitization, CAPTCHA placeholder

### Admin Dashboard
- **Secure Authentication**: JWT-based login system
- **Complaint Management**: View, filter, and update complaint statuses
- **Statistics Dashboard**: Real-time statistics for pending, in-progress, and resolved complaints
- **Advanced Filtering**: Filter by status, complaint type, and search functionality
- **Pagination**: Handle large numbers of complaints efficiently
- **Status Updates**: Change complaint status (Pending, In Progress, Resolved)

### Backend Features
- **Node.js + Express**: Robust REST API
- **MongoDB Integration**: Secure database storage
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Proper error responses and logging

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Apple-inspired design
- **JavaScript (ES6+)**: Interactive functionality
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Clone or download the project files**

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```
PORT=3000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/apple_complaints
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Start the application**:
```bash
# For development
npm run dev
# For production
npm start
```

6. **Access the application**:
- Main website: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin.html

## Usage

### For Customers
1. Visit the main website
2. Fill out the complaint form in the right sidebar
3. All required fields must be completed
4. Submit the form to receive confirmation

### For Admin Staff
1. Navigate to `/admin.html`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. View and manage complaints
4. Update complaint statuses as needed
5. Use filters and search to find specific complaints

## Default Admin Account

For development and testing, a default admin account is automatically created:
- **Username**: admin
- **Password**: admin123

**Important**: Change the default password in production!

## Security Features

- **Rate Limiting**: Prevents spam submissions
- **Input Sanitization**: Removes malicious content
- **JWT Authentication**: Secure admin access
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for frontend-backend communication
- **Helmet**: Security headers for Express

## API Endpoints

### Public Endpoints
- `GET /` - Serve main website
- `POST /api/complaints` - Submit a new complaint

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin login
- `GET /api/complaints` - Get all complaints (with filtering/pagination)
- `PATCH /api/complaints/:id` - Update complaint status

## Database Schema

### Complaint
```javascript
{
  name: String (required, 2-100 chars),
  phone: String (required, validated phone format),
  email: String (required, email format),
  appleId: String (optional, email format),
  complaintType: String (required, enum: ['fraud', 'purchase', 'product', 'other']),
  description: String (required, 10-2000 chars),
  status: String (default: 'pending', enum: ['pending', 'in_progress', 'resolved']),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Admin
```javascript
{
  username: String (required, unique, 3+ chars),
  password: String (required, hashed),
  role: String (default: 'admin'),
  createdAt: Date (default: Date.now)
}
```

## Project Structure
```
apple-complaint-portal/
|-- index.html          # Main customer interface
|-- admin.html          # Admin dashboard
|-- styles.css          # Main website styles
|-- admin-styles.css    # Admin dashboard styles
|-- script.js           # Main website JavaScript
|-- admin-script.js     # Admin dashboard JavaScript
|-- server.js           # Express server
|-- package.json        # Node.js dependencies
|-- .env.example        # Environment variables template
|-- README.md           # This file
```

## Development

### Adding New Features
1. Frontend changes: Modify HTML, CSS, or JavaScript files
2. Backend changes: Update `server.js` and add new API endpoints
3. Database changes: Update Mongoose schemas

### Testing
- Test form validation by submitting invalid data
- Test admin authentication with wrong credentials
- Test rate limiting by submitting multiple forms quickly
- Test responsive design on different screen sizes

## Deployment

### Production Setup
1. Set up MongoDB (MongoDB Atlas recommended)
2. Configure environment variables
3. Use a process manager like PM2
4. Set up reverse proxy (nginx) if needed
5. Configure SSL certificate
6. Update CORS settings for production domain

### Environment Variables for Production
```
PORT=3000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apple_complaints
JWT_SECRET=your-production-secret-key
```

## Contributing
1. Follow the existing code style
2. Add comments for complex logic
3. Test all changes thoroughly
4. Update documentation as needed

## License
This project is for educational purposes. Please ensure compliance with Apple's branding guidelines if using in production.

## Support
For issues or questions:
1. Check the console for error messages
2. Verify MongoDB connection
3. Check environment variables
4. Ensure all dependencies are installed

---

**Note**: This is a demonstration project inspired by Apple's support website. It's not affiliated with Apple Inc. and should not be used for malicious purposes.
