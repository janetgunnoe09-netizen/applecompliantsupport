// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Dashboard elements
    const complaintsTableBody = document.getElementById('complaintsTableBody');
    const loading = document.getElementById('loading');
    const noComplaints = document.getElementById('noComplaints');
    const modal = document.getElementById('complaintModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');
    
    // Filters
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Pagination
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    // Status update
    const statusUpdate = document.getElementById('statusUpdate');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    
    // State
    let currentToken = localStorage.getItem('adminToken');
    let currentUser = localStorage.getItem('currentUser');
    let currentPage = 1;
    let totalPages = 1;
    let currentComplaintId = null;
    
    // Check if already logged in
    if (currentToken && currentUser) {
        showDashboard();
        loadComplaints();
    }
    
    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        // Show loading
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store credentials
                localStorage.setItem('adminToken', result.token);
                localStorage.setItem('currentUser', result.admin.username);
                currentToken = result.token;
                currentUser = result.admin.username;
                
                // Show dashboard
                showDashboard();
                loadComplaints();
                
            } else {
                showError(result.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please try again.');
            
        } finally {
            // Hide loading
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('currentUser');
        currentToken = null;
        currentUser = null;
        showLogin();
    });
    
    // Show dashboard
    function showDashboard() {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser;
    }
    
    // Show login
    function showLogin() {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
        loginForm.reset();
        hideError();
    }
    
    // Show error message
    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
    
    // Hide error message
    function hideError() {
        loginError.style.display = 'none';
    }
    
    // Load complaints
    async function loadComplaints(page = 1) {
        showLoading();
        
        try {
            const params = new URLSearchParams({
                page: page,
                limit: 10,
                status: statusFilter.value,
                type: typeFilter.value,
                search: searchInput.value
            });
            
            const response = await fetch(`/api/complaints?${params}`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                displayComplaints(result.data);
                updatePagination(result.pagination);
                updateStatistics(result.data);
            } else {
                if (response.status === 401 || response.status === 403) {
                    showLogin();
                    showError('Session expired. Please login again.');
                } else {
                    showNoComplaints();
                }
            }
            
        } catch (error) {
            console.error('Error loading complaints:', error);
            showNoComplaints();
        }
    }
    
    // Display complaints in table
    function displayComplaints(complaints) {
        if (!complaints || complaints.length === 0) {
            showNoComplaints();
            return;
        }
        
        complaintsTableBody.innerHTML = '';
        
        complaints.forEach(complaint => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${complaint._id.substring(0, 8)}...</td>
                <td>${escapeHtml(complaint.name)}</td>
                <td>${escapeHtml(complaint.email)}</td>
                <td>${escapeHtml(complaint.phone)}</td>
                <td>${getComplaintTypeLabel(complaint.complaintType)}</td>
                <td><span class="status-badge ${complaint.status}">${getStatusLabel(complaint.status)}</span></td>
                <td>${formatDate(complaint.createdAt)}</td>
                <td>
                    <button class="action-btn" onclick="viewComplaint('${complaint._id}')">View</button>
                </td>
            `;
            complaintsTableBody.appendChild(row);
        });
        
        hideLoading();
    }
    
    // Show loading state
    function showLoading() {
        loading.style.display = 'block';
        noComplaints.style.display = 'none';
        complaintsTableBody.innerHTML = '';
    }
    
    // Hide loading state
    function hideLoading() {
        loading.style.display = 'none';
    }
    
    // Show no complaints message
    function showNoComplaints() {
        hideLoading();
        complaintsTableBody.innerHTML = '';
        noComplaints.style.display = 'block';
    }
    
    // Update pagination
    function updatePagination(pagination) {
        currentPage = pagination.page;
        totalPages = pagination.pages;
        
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
        
        prevPage.disabled = currentPage <= 1;
        nextPage.disabled = currentPage >= totalPages;
    }
    
    // Update statistics
    function updateStatistics(complaints) {
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in_progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('progressCount').textContent = inProgress;
        document.getElementById('resolvedCount').textContent = resolved;
        document.getElementById('totalCount').textContent = complaints.length;
    }
    
    // View complaint details
    window.viewComplaint = async function(complaintId) {
        currentComplaintId = complaintId;
        
        try {
            const response = await fetch(`/api/complaints`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                const complaint = result.data.find(c => c._id === complaintId);
                if (complaint) {
                    displayComplaintModal(complaint);
                }
            }
            
        } catch (error) {
            console.error('Error fetching complaint details:', error);
        }
    };
    
    // Display complaint modal
    function displayComplaintModal(complaint) {
        modalBody.innerHTML = `
            <div class="detail-group">
                <label>Complaint ID</label>
                <div class="value">${complaint._id}</div>
            </div>
            <div class="detail-group">
                <label>Full Name</label>
                <div class="value">${escapeHtml(complaint.name)}</div>
            </div>
            <div class="detail-group">
                <label>Email Address</label>
                <div class="value">${escapeHtml(complaint.email)}</div>
            </div>
            <div class="detail-group">
                <label>Phone Number</label>
                <div class="value">${escapeHtml(complaint.phone)}</div>
            </div>
            <div class="detail-group">
                <label>Apple ID</label>
                <div class="value">${complaint.appleId ? escapeHtml(complaint.appleId) : 'Not provided'}</div>
            </div>
            <div class="detail-group">
                <label>Complaint Type</label>
                <div class="value">${getComplaintTypeLabel(complaint.complaintType)}</div>
            </div>
            <div class="detail-group">
                <label>Complaint Description</label>
                <div class="value">${escapeHtml(complaint.description)}</div>
            </div>
            <div class="detail-group">
                <label>Current Status</label>
                <div class="value"><span class="status-badge ${complaint.status}">${getStatusLabel(complaint.status)}</span></div>
            </div>
            <div class="detail-group">
                <label>Submitted Date</label>
                <div class="value">${formatDate(complaint.createdAt)}</div>
            </div>
            <div class="detail-group">
                <label>Last Updated</label>
                <div class="value">${formatDate(complaint.updatedAt)}</div>
            </div>
        `;
        
        statusUpdate.value = complaint.status;
        modal.style.display = 'flex';
    }
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Update complaint status
    updateStatusBtn.addEventListener('click', async function() {
        if (!currentComplaintId) return;
        
        const newStatus = statusUpdate.value;
        
        try {
            const response = await fetch(`/api/complaints/${currentComplaintId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
                modal.style.display = 'none';
                loadComplaints(currentPage);
            } else {
                alert('Failed to update status: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    });
    
    // Filter events
    statusFilter.addEventListener('change', function() {
        currentPage = 1;
        loadComplaints(currentPage);
    });
    
    typeFilter.addEventListener('change', function() {
        currentPage = 1;
        loadComplaints(currentPage);
    });
    
    searchBtn.addEventListener('click', function() {
        currentPage = 1;
        loadComplaints(currentPage);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    refreshBtn.addEventListener('click', function() {
        loadComplaints(currentPage);
    });
    
    // Pagination events
    prevPage.addEventListener('click', function() {
        if (currentPage > 1) {
            loadComplaints(currentPage - 1);
        }
    });
    
    nextPage.addEventListener('click', function() {
        if (currentPage < totalPages) {
            loadComplaints(currentPage + 1);
        }
    });
    
    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function getComplaintTypeLabel(type) {
        const labels = {
            'fraud': 'Fraud Complaint',
            'purchase': 'Product Purchase',
            'product': 'Product Related',
            'other': 'Other'
        };
        return labels[type] || type;
    }
    
    function getStatusLabel(status) {
        const labels = {
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'resolved': 'Resolved'
        };
        return labels[status] || status;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
