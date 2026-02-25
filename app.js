/**
 * Genesis Research Initiative - Complete Frontend JavaScript
 * Professional application handling with EmailJS integration
 */

// ========================================
// CONFIGURATION - ALL KEYS INSERTED
// ========================================

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://blonnfvhicgignhkxuvi.supabase.co',
    SUPABASE_KEY: 'sb_publishable_XtxOwWAGnNZ2XcKR38MsVQ_EUjHClx1',
    
    // EmailJS Configuration
    EMAILJS_SERVICE_ID: 'service_jrye846',
    EMAILJS_TEMPLATE_ID: 'template_7ll679d',
    EMAILJS_PUBLIC_KEY: '0BOUwIQxa9kAyhz-f',
    
    // Admin email for notifications
    ADMIN_EMAIL: 'godrick@tutamail.com'
};

// ========================================
// GLOBAL STATE
// ========================================

let applicationCount = 0;
let isSubmitting = false;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupFormHandlers();
    setupScrollEffects();
    setupWordCounter();
    console.log('Genesis Research Initiative - Frontend Loaded');
});

function initializeApp() {
    // Add loaded class to body
    document.body.classList.add('loaded');
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup navbar scroll effect
    setupNavbarScroll();
    
    // Pre-fill email if known
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = 'godrick@tutamail.com';
    }
}

// ========================================
// NAVIGATION
// ========================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function setupMobileMenu() {
    console.log('Mobile menu ready');
}

// ========================================
// FORM HANDLING
// ========================================

function setupFormHandlers() {
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', handleApplicationSubmit);
    }
    
    // Login buttons
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(btn => {
        btn.addEventListener('click', handleLoginClick);
    });
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function toggleConditionalFields() {
    const role = document.getElementById('role').value;
    const expertiseField = document.getElementById('expertiseField');
    const requirementsField = document.getElementById('requirementsField');
    
    if (role === 'researcher') {
        expertiseField.style.display = 'block';
        requirementsField.style.display = 'none';
        document.getElementById('expertise').required = true;
        document.getElementById('researchRequirements').required = false;
    } else if (role === 'client') {
        expertiseField.style.display = 'none';
        requirementsField.style.display = 'block';
        document.getElementById('expertise').required = false;
        document.getElementById('researchRequirements').required = true;
    } else {
        expertiseField.style.display = 'none';
        requirementsField.style.display = 'none';
        document.getElementById('expertise').required = false;
        document.getElementById('researchRequirements').required = false;
    }
}

function setupWordCounter() {
    const statementInput = document.getElementById('statement');
    const wordCountDisplay = document.getElementById('wordCount');
    
    if (statementInput && wordCountDisplay) {
        statementInput.addEventListener('input', () => {
            const text = statementInput.value.trim();
            const wordCount = text ? text.split(/\s+/).length : 0;
            wordCountDisplay.textContent = wordCount;
            
            if (wordCount < 50) {
                wordCountDisplay.style.color = '#ef4444';
            } else {
                wordCountDisplay.style.color = '#10b981';
            }
        });
    }
}

// ========================================
// APPLICATION SUBMISSION
// ========================================

async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) {
        showNotification('Submission already in progress', 'warning');
        return;
    }
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Send to Supabase
        const supabaseResult = await saveToSupabase(formData);
        
        // Send email notification
        const emailResult = await sendEmailNotification(formData);
        
        // Show success
        showNotification('Application submitted successfully! We will review and contact you soon.', 'success');
        
        // Reset form
        document.getElementById('applicationForm').reset();
        document.getElementById('wordCount').textContent = '0';
        toggleConditionalFields();
        
        // Log for admin
        console.log('New application submitted:', formData);
        console.log('Supabase result:', supabaseResult);
        console.log('Email result:', emailResult);
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('Submission failed: ' + error.message, 'error');
    } finally {
        isSubmitting = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function validateForm() {
    const role = document.getElementById('role').value;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const statement = document.getElementById('statement').value.trim();
    const wordCount = statement ? statement.split(/\s+/).length : 0;
    
    const errors = [];
    
    if (!role) {
        errors.push('Please select a role (Researcher or Client)');
    }
    
    if (!fullName || fullName.length < 2) {
        errors.push('Please enter a valid full name');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (wordCount < 50) {
        errors.push('Statement must be at least 50 words (current: ' + wordCount + ')');
    }
    
    if (role === 'researcher' && !document.getElementById('expertise').value) {
        errors.push('Please select your primary expertise');
    }
    
    if (role === 'client' && !document.getElementById('researchRequirements').value.trim()) {
        errors.push('Please describe your research requirement');
    }
    
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return false;
    }
    
    return true;
}

function collectFormData() {
    const role = document.getElementById('role').value;
    const data = {
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        role: role,
        statement: document.getElementById('statement').value.trim(),
        created_at: new Date().toISOString(),
        status: 'pending'
    };
    
    if (role === 'researcher') {
        data.expertise = document.getElementById('expertise').value;
    } else if (role === 'client') {
        data.research_requirements = document.getElementById('researchRequirements').value.trim();
    }
    
    return data;
}

// ========================================
// SUPABASE INTEGRATION
// ========================================

async function saveToSupabase(data) {
    try {
        const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.SUPABASE_KEY,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase error response:', errorText);
            
            // If Supabase fails, save to localStorage as backup
            backupToLocalStorage(data);
            return { saved: true, method: 'localStorage backup' };
        }
        
        return { saved: true, method: 'Supabase' };
        
    } catch (error) {
        console.error('Supabase save error:', error);
        // Fallback to localStorage
        backupToLocalStorage(data);
        return { saved: true, method: 'localStorage backup', error: error.message };
    }
}

function backupToLocalStorage(data) {
    try {
        const backups = JSON.parse(localStorage.getItem('genesis_applications') || '[]');
        backups.push({
            ...data,
            backed_up_at: new Date().toISOString()
        });
        localStorage.setItem('genesis_applications', JSON.stringify(backups));
        console.log('Data backed up to localStorage');
    } catch (e) {
        console.error('LocalStorage backup failed:', e);
    }
}

// ========================================
// EMAILJS INTEGRATION
// ========================================

async function sendEmailNotification(formData) {
    try {
        // EmailJS is loaded via CDN in the HTML
        if (typeof emailjs === 'undefined') {
            console.log('EmailJS not loaded - email notification skipped');
            console.log('Form data:', formData);
            return { sent: false, reason: 'EmailJS not initialized' };
        }
        
        const templateParams = {
            role: formData.role,
            full_name: formData.full_name,
            email: formData.email,
            statement: formData.statement,
            expertise: formData.expertise || 'N/A',
            research_requirements: formData.research_requirements || 'N/A',
            admin_email: CONFIG.ADMIN_EMAIL
        };
        
        const response = await emailjs.send(
            CONFIG.EMAILJS_SERVICE_ID,
            CONFIG.EMAILJS_TEMPLATE_ID,
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        return { sent: true, messageId: response.messageId };
        
    } catch (error) {
        console.error('Email sending failed:', error);
        console.log('Email params:', formData);
        return { sent: false, reason: error.message };
    }
}

// ========================================
// LOGIN HANDLING
// ========================================

function handleLoginClick(e) {
    const role = e.currentTarget.textContent.includes('Researcher') ? 'Researcher' : 'Client';
    showNotification(`${role} Dashboard - Phase 2 Development - Coming Soon`, 'info');
}

function showLoginPlaceholder(role) {
    const placeholder = document.getElementById('loginPlaceholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <h3>${role} Dashboard</h3>
                <p>Under Development</p>
                <p class="placeholder-note">Phase 2 implementation scheduled for upcoming cycle</p>
                <p class="placeholder-note">Contact: ${CONFIG.ADMIN_EMAIL}</p>
            </div>
        `;
        placeholder.style.display = 'block';
        
        scrollToSection('login');
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info', duration = 6000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 0;
        border-radius: 12px;
        color: white;
        z-index: 10000;
        max-width: 450px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.4s ease;
        overflow: hidden;
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function setupScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.vision-card, .arch-card, .research-card, .domain-card, .offering-card, .roadmap-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ========================================
// MOBILE MENU TOGGLE
// ========================================

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });
    }
}

// ========================================
// EXPORT FOR CONSOLE ACCESS
// ========================================

window.GenesisApp = {
    CONFIG,
    scrollToSection,
    showNotification,
    toggleConditionalFields,
    submitApplication: () => document.getElementById('applicationForm')?.dispatchEvent(new Event('submit'))
};

console.log('%c Genesis Research Initiative ', 'background: #0a0a0f; color: #3b82f6; font-size: 20px; padding: 10px;');
console.log('%c Frontend Loaded Successfully ', 'background: #10b981; color: white; font-size: 12px; padding: 5px;');
console.log('CONFIG:', CONFIG);