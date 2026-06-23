// Enhanced Login Authentication - Client-side Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Login enhancements loaded');
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('❌ Login form not found');
        return;
    }
    
    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🚀 Login form submitted');
        
        const submitBtn = this.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        const errorDiv = document.getElementById('error-message') || createErrorDiv();
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        errorDiv.style.display = 'none';
        
        try {
            // Get form data
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            
            console.log('📋 Login attempt:', { email, password: '***' });
            
            // Client-side authentication using localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            console.log('👥 Available users:', users.length);
            
            // Find user by email and password
            const user = users.find(u => 
                u.email === email && u.password === password
            );
            
            if (user) {
                console.log('✅ Login successful for:', email);
                
                // Generate authentication token (for demo purposes)
                const token = 'TOKEN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                
                // Store authentication data
                localStorage.setItem('authToken', token);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userInfo', JSON.stringify({
                    email: user.email,
                    trackingNumber: user.trackingNumber,
                    complaintData: user.complaintData
                }));
                
                // Show success message
                showSuccessMessage('Login successful! Redirecting to dashboard...');
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
                    console.log('🔄 Redirecting to:', redirectUrl);
                    window.location.href = redirectUrl;
                }, 1500);
                
            } else {
                console.log('❌ Invalid credentials for:', email);
                throw new Error('Invalid email or password. Please check your credentials and try again.');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Show error message
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            
            // Shake animation for error
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
            
        } finally {
            // Hide loading state
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            loadingSpinner.style.display = 'none';
        }
    });
    
    // Create error message div if it doesn't exist
    function createErrorDiv() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            background: #d32f2f;
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
            font-size: 14px;
        `;
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
        return errorDiv;
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            background: #34c759;
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        successDiv.textContent = message;
        
        const existingError = document.getElementById('error-message');
        if (existingError) {
            existingError.style.display = 'none';
        }
        
        loginForm.insertBefore(successDiv, loginForm.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translateY(-20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Check if user is already logged in
    function checkExistingLogin() {
        const token = localStorage.getItem('authToken');
        const userEmail = localStorage.getItem('userEmail');
        
        if (token && userEmail) {
            console.log('🔄 User already logged in, redirecting to dashboard');
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
            window.location.href = redirectUrl;
        }
    }
    
    // Check existing login on page load
    checkExistingLogin();
});
