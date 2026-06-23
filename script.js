// Check authentication and update UI
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM loaded, checking elements...');
    
    updateAuthUI();
    
    const form = document.getElementById('complaintForm');
    console.log('📋 Form element found:', form);
    
    if (!form) {
        console.log('ℹ️ Form element not found on this page (expected on index.html)');
        // Don't return error, just continue - form is only on support.html
        return;
    }
    
    const submitBtn = form.querySelector('.submit-btn') || form.querySelector('.btn-primary');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const loadingSpinner = submitBtn ? submitBtn.querySelector('.loading-spinner') : null;
    const successMessage = form.querySelector('.success-message');
    
    console.log('🔘 Submit button found:', submitBtn);
    console.log('📝 Button text found:', btnText);
    console.log('🔄 Loading spinner found:', loadingSpinner);
    console.log('✅ Success message found:', successMessage);
    
    // Check if user is authenticated before allowing complaint submission
    function checkAuthentication() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Redirect to login with return URL
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }
    
    // Update authentication UI
    function updateAuthUI() {
        const authLinks = document.getElementById('authLinks');
        const token = localStorage.getItem('authToken');
        const userEmail = localStorage.getItem('userEmail');
        
        if (token && userEmail) {
            // User is logged in
            authLinks.innerHTML = `
                <a href="dashboard.html" style="color: #f5f5f7;">Dashboard</a>
                <a href="#" onclick="logout()" style="color: #f5f5f7;">Logout</a>
            `;
        } else {
            // User is not logged in - show simple login link
            authLinks.innerHTML = `
                <a href="login.html" style="color: #0071e3; text-decoration: none; font-weight: 500;">Login</a>
            `;
        }
    }
    
    // Global logout function
    window.logout = function() {
        console.log('🚪 Logging out...');
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('users');
            localStorage.removeItem('complaints');
            localStorage.removeItem('assetVerifications');
            
            console.log('✅ LocalStorage cleared');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Error during logout:', error);
            window.location.href = 'login.html';
        }
    };
    
    // Also make logout available as direct function
    function logout() {
        console.log('🚪 Logging out...');
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('users');
            localStorage.removeItem('complaints');
            localStorage.removeItem('assetVerifications');
            
            console.log('✅ LocalStorage cleared');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Error during logout:', error);
            window.location.href = 'login.html';
        }
    }
    
    // Form validation rules
    const validators = {
        fullName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s\-\.']+$/,
            message: 'Please enter a valid full name (minimum 2 characters)'
        },
        phoneNumber: {
            required: true,
            pattern: /^[\d\s\-\(\)]+$/,
            message: 'Please enter a valid phone number'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        appleId: {
            required: false,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid Apple ID email address'
        },
        complaintType: {
            required: true,
            message: 'Please select a complaint type'
        },
        complaintDescription: {
            required: true,
            minLength: 10,
            message: 'Please provide a detailed description (minimum 10 characters)'
        },
        recaptcha: {
            required: true,
            custom: (field) => field.checked,
            message: 'Please confirm you are not a robot'
        }
    };
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Only validate inputs that have names and corresponding validators
        if (!input.name || !validators[input.name]) {
            return;
        }
        
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            // Special handling for phone number - only allow digits
            if (input.id === 'phoneNumber') {
                input.value = input.value.replace(/\D/g, '').slice(0, 10);
            }
            if (input.parentElement.classList.contains('error')) {
                validateField(input);
            }
            checkFormValidity();
        });
        
        // Special handling for checkbox - validate on click
        if (input.type === 'checkbox') {
            input.addEventListener('click', () => {
                validateField(input);
                checkFormValidity();
            });
        }
    });
    
    // Field validation
    function validateField(field) {
        const fieldName = field.name;
        const isCheckbox = field.type === 'checkbox';
        const value = isCheckbox ? field.checked : field.value.trim();
        const validator = validators[fieldName];
        const formGroup = field.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (!validator) return true;
        
        // Reset error state only if error message element exists
        if (errorMessage) {
            formGroup.classList.remove('error');
            errorMessage.textContent = '';
        }
        
        // Check if required and empty
        if (validator.required && !value) {
            let labelText = field.previousElementSibling ? field.previousElementSibling.textContent.replace(' *', '') : fieldName;
            if (isCheckbox) {
                labelText = field.parentElement.querySelector('label').textContent.replace(' *', '');
            }
            if (errorMessage) {
                showError(formGroup, errorMessage, `${labelText} is required`);
            }
            return false;
        }
        
        // Skip validation for optional fields that are empty
        if (!validator.required && !value) {
            return true;
        }
        
        // Pattern validation (only for non-checkbox fields)
        if (validator.pattern && !isCheckbox && value && !validator.pattern.test(value)) {
            if (errorMessage) {
                showError(formGroup, errorMessage, validator.message);
            }
            return false;
        }
        
        // Minimum length validation (only for non-checkbox fields)
        if (validator.minLength && !isCheckbox && value.length < validator.minLength) {
            if (errorMessage) {
                showError(formGroup, errorMessage, validator.message);
            }
            return false;
        }
        
        // Custom validation
        if (validator.custom && !validator.custom(field)) {
            if (errorMessage) {
                showError(formGroup, errorMessage, validator.message);
            }
            return false;
        }
        
        return true;
    }
    
    function showError(formGroup, errorMessage, message) {
        if (formGroup && errorMessage) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
        }
    }
    
    // Check form validity
    function checkFormValidity() {
        let isValid = true;
        
        inputs.forEach(input => {
            // Only validate inputs that have names and corresponding validators
            if (!input.name || !validators[input.name]) {
                return;
            }
            
            const fieldValid = validateField(input);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        submitBtn.disabled = !isValid;
        return isValid;
    }
    
    // Form submission - COMPLETELY REMOVED to let form-enhancements.js handle it
    // No event listener added here - form-enhancements.js will handle submission
    
    // Initialize form validity check
    checkFormValidity();
});

// Utility functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

// Rate limiting
const rateLimiter = {
    attempts: 0,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lastReset: Date.now(),
    
    isAllowed() {
        const now = Date.now();
        if (now - this.lastReset > this.windowMs) {
            this.attempts = 0;
            this.lastReset = now;
        }
        
        return this.attempts < this.maxAttempts;
    },
    
    recordAttempt() {
        this.attempts++;
    }
};
