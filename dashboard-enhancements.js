// Dashboard Enhancement - React-like State Management
console.log('🚀 Dashboard script loaded');

// React-like state management
let dashboardState = {
    user: null,
    complaints: [],
    loading: true,
    error: null
};

// React-like setState function
function setDashboardState(updates) {
    console.log('🔄 Setting dashboard state:', updates);
    Object.assign(dashboardState, updates);
    
    // Update UI based on new state
    updateUI();
}

// React-like useEffect for data fetching - FIXED VERSION
async function fetchDashboardData() {
    console.log('🔄 Fetching dashboard data...');

    setDashboardState({ loading: true, error: null });

    try {
        // 🔍 DEBUG: Log localStorage first
        console.log('🔍 DEBUG - localStorage contents:');
        console.log('localStorage:', localStorage);
        
        const userEmail = localStorage.getItem('userEmail');

        // 🚨 HARD STOP if no email — redirect to login
        if (!userEmail) {
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ Found userEmail:', userEmail);

        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

        console.log('📊 Data loaded - Users:', allUsers.length, 'Complaints:', complaints.length);

        const currentUser = allUsers.find(user => user.email === userEmail);

        // ✅ safer complaint filtering
        const userComplaints = complaints.filter(c => c.email === userEmail);

        console.log('👤 Current user found:', !!currentUser);
        console.log('📋 User complaints found:', userComplaints.length);

        const user = {
            email: userEmail,
            fullName:
                currentUser?.fullName ||
                userInfo?.fullName ||
                currentUser?.complaintData?.fullName ||
                'User',
            memberSince:
                currentUser?.timestamp ||
                userInfo?.timestamp ||
                currentUser?.complaintData?.timestamp ||
                new Date().toISOString()
        };

        console.log('✅ Clean user:', user);
        console.log('✅ Clean complaints:', userComplaints);

        setDashboardState({
            user,
            complaints: userComplaints,
            loading: false,
            error: null
        });

    } catch (error) {
        console.error('❌ Dashboard error:', error);

        setDashboardState({
            loading: false,
            error: error.message || 'Failed to load dashboard'
        });
    }
}

// Update UI based on current state
function updateUI() {
    console.log('🎨 Updating UI based on state:', dashboardState);
    
    try {
        // Handle loading state
        if (dashboardState.loading) {
            console.log('⏳ Showing loading state');
            showLoadingState();
            return;
        }
        
        // Handle error state
        if (dashboardState.error) {
            console.log('❌ Showing error state:', dashboardState.error);
            showErrorState(dashboardState.error);
            return;
        }
        
        // Handle success state
        console.log('✅ Showing success state');
        showSuccessState();
        
    } catch (error) {
        console.error('❌ Error updating UI:', error);
    }
}

// Show loading state - FIXED UX
function showLoadingState() {
    console.log('⏳ Displaying loading indicators...');
    
    // Only show loading if elements are empty/undefined (don't overwrite existing data)
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const memberSinceElement = document.getElementById('userMemberSince');
    
    if (userNameElement && (!userNameElement.textContent || userNameElement.textContent.trim() === '')) {
        userNameElement.textContent = 'Loading...';
    }
    if (userEmailElement && (!userEmailElement.textContent || userEmailElement.textContent.trim() === '')) {
        userEmailElement.textContent = 'Loading...';
    }
    if (memberSinceElement && (!memberSinceElement.textContent || memberSinceElement.textContent.trim() === '')) {
        memberSinceElement.textContent = 'Loading...';
    }
    
    // Complaints loading - only if table is empty
    const complaintsTable = document.getElementById('complaintsTable') || document.getElementById('complaintsList');
    if (complaintsTable && (!complaintsTable.innerHTML || complaintsTable.innerHTML.trim() === '')) {
        complaintsTable.innerHTML = `<p style="color:#86868b;text-align:center;padding:20px">Loading complaints...</p>`;
    }
    
    // Stats loading - only if empty
    const totalElement = document.getElementById('totalComplaints');
    const pendingElement = document.getElementById('pendingComplaints');
    const inProgressElement = document.getElementById('inProgressComplaints');
    const resolvedElement = document.getElementById('resolvedComplaints');
    
    if (totalElement && (!totalElement.textContent || totalElement.textContent.trim() === '')) {
        totalElement.textContent = 'Loading...';
    }
    if (pendingElement && (!pendingElement.textContent || pendingElement.textContent.trim() === '')) {
        pendingElement.textContent = 'Loading...';
    }
    if (inProgressElement && (!inProgressElement.textContent || inProgressElement.textContent.trim() === '')) {
        inProgressElement.textContent = 'Loading...';
    }
    if (resolvedElement && (!resolvedElement.textContent || resolvedElement.textContent.trim() === '')) {
        resolvedElement.textContent = 'Loading...';
    }
}

// Show error state
function showErrorState(error) {
    console.log('❌ Displaying error state:', error);
    
    const complaintsTable = document.getElementById('complaintsTable') || document.getElementById('complaintsList');
    if (complaintsTable) {
        complaintsTable.innerHTML = `<p style="color:#d32f2f;text-align:center;padding:20px">Error loading data: ${error}</p>`;
    }
}

// Show success state
function showSuccessState() {
    console.log('✅ Displaying success state');
    
    // Update user profile
    updateUserProfile();
    
    // Update complaints table
    updateComplaintsTable();
    
    // Update stats
    updateStats();
}

// Update user profile
function updateUserProfile() {
    console.log('👤 Updating user profile...');
    
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const memberSinceElement = document.getElementById('userMemberSince');
    
    if (dashboardState.user) {
        // Update name
        if (userNameElement) {
            userNameElement.textContent = dashboardState.user.fullName;
            console.log('✅ Name updated:', dashboardState.user.fullName);
        }
        
        // Update email
        if (userEmailElement) {
            userEmailElement.textContent = dashboardState.user.email;
            console.log('✅ Email updated:', dashboardState.user.email);
        }
        
        // Update member since
        if (memberSinceElement) {
            memberSinceElement.textContent = new Date(dashboardState.user.memberSince).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            console.log('✅ Member since updated');
        }
    }
}

// Update complaints table
function updateComplaintsTable() {
    console.log('📋 Updating complaints table...');
    
    const complaintsTable = document.getElementById('complaintsTable') || document.getElementById('complaintsList');
    if (!complaintsTable) {
        console.log('❌ complaints list element not found');
        return;
    }
    
    if (dashboardState.complaints.length === 0) {
        complaintsTable.innerHTML = `<p style="color:#86868b;text-align:center;padding:20px">No complaints found yet.</p>`;
        console.log('✅ No complaints message set');
        return;
    }
    
    const listHTML = dashboardState.complaints.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <span class="complaint-id">${complaint.trackingNumber || complaint.id || 'N/A'}</span>
                <span class="status status-${(complaint.status || 'pending').replace('_','-')}">${complaint.status || 'pending'}</span>
            </div>
            <div class="complaint-details">
                <strong>Type:</strong> ${complaint.complaintType || 'N/A'} &nbsp;|&nbsp;
                <strong>Date:</strong> ${new Date(complaint.timestamp || Date.now()).toLocaleDateString()} &nbsp;|&nbsp;
                <strong>Email:</strong> ${complaint.email || 'N/A'}
            </div>
            <div class="complaint-details" style="margin-top:6px">${complaint.complaintDescription || ''}</div>
        </div>
    `).join('');
    
    complaintsTable.innerHTML = listHTML;
    console.log('✅ Complaints list updated with', dashboardState.complaints.length, 'complaints');
}

// Update statistics
function updateStats() {
    console.log('📊 Updating stats...');
    
    const totalElement = document.getElementById('totalComplaints');
    const pendingElement = document.getElementById('pendingComplaints');
    const inProgressElement = document.getElementById('inProgressComplaints');
    const resolvedElement = document.getElementById('resolvedComplaints');
    
    const total = dashboardState.complaints.length;
    const pending = dashboardState.complaints.filter(c => c.status === 'pending').length;
    const inProgress = dashboardState.complaints.filter(c => c.status === 'in-progress').length;
    const resolved = dashboardState.complaints.filter(c => c.status === 'resolved').length;
    
    if (totalElement) totalElement.textContent = total;
    if (pendingElement) pendingElement.textContent = pending;
    if (inProgressElement) inProgressElement.textContent = inProgress;
    if (resolvedElement) resolvedElement.textContent = resolved;
    
    console.log('✅ Stats updated:', { total, pending, inProgress, resolved });
}

// Global function to refresh dashboard (for form submission)
window.refreshDashboard = async function() {
    console.log('🔄 Manual dashboard refresh triggered');
    await fetchDashboardData();
};

// Global function to get current state
window.getDashboardState = function() {
    return dashboardState;
};

// Initialize dashboard when DOM is ready (React-like useEffect)
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM content loaded - useEffect triggered');
    
    // Initial data fetch
    fetchDashboardData();
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Refresh button clicked');
            fetchDashboardData();
        });
    }
    
    console.log('✅ Dashboard initialized');
});

// Also fetch on window load (backup)
window.addEventListener('load', function() {
    console.log('📄 Window fully loaded - backup fetch');
    setTimeout(() => {
        if (dashboardState.loading) {
            console.log('⚠️ Still loading, forcing refresh');
            fetchDashboardData();
        }
    }, 2000);
});

console.log('🚀 Dashboard enhancements script ready');
