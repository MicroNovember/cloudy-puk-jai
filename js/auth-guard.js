/**
 * Authentication Guard - Prevents unauthorized access
 * This script runs before the main application to ensure authentication
 */

(function() {
    'use strict';
    
    // Public pages that don't require authentication
    const PUBLIC_PAGES = [
        'login.html',
        'register.html', 
        'forgot-password.html',
        'reset-password.html',
        'test-auth.html'
    ];
    
    // Get current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Skip auth check for public pages
    if (PUBLIC_PAGES.includes(currentPage)) {
        console.log('Public page detected, skipping auth check');
        return;
    }
    
    // Auth check function
    function checkAuthentication() {
        try {
            // Wait a bit for Firebase to initialize
            if (typeof window.auth !== 'undefined' && !window.auth.currentUser) {
                // Firebase is loading, give it time
                setTimeout(() => {
                    if (!window.auth.currentUser && !localStorage.getItem('guestMode')) {
                        redirectToLogin();
                    }
                }, 1000);
                return true; // Allow loading for now
            }
            
            // Check Firebase Auth (if available)
            let firebaseUser = null;
            if (typeof window.auth !== 'undefined') {
                firebaseUser = window.auth.currentUser;
            }
            
            // Check Guest Mode
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            
            // Validate guest session
            let validGuestSession = false;
            if (guestMode && guestData) {
                try {
                    const data = JSON.parse(guestData);
                    const loginTime = new Date(data.loginTime);
                    const now = new Date();
                    const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
                    
                    // Guest session valid for 30 days
                    if (daysDiff <= 30 && data.agreedToTerms) {
                        validGuestSession = true;
                    } else {
                        // Session expired, clean up
                        localStorage.removeItem('guestMode');
                        localStorage.removeItem('guestData');
                        localStorage.removeItem('userType');
                        localStorage.removeItem('guestLoginTime');
                    }
                } catch (e) {
                    // Invalid guest data, clean up
                    localStorage.removeItem('guestMode');
                    localStorage.removeItem('guestData');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('guestLoginTime');
                }
            }
            
            // Check if user is authenticated
            const isAuthenticated = firebaseUser !== null || validGuestSession;
            
            if (!isAuthenticated) {
                console.warn('Unauthorized access attempt, redirecting to login');
                redirectToLogin();
                return false;
            }
            
            console.log('Authentication check passed');
            return true;
            
        } catch (error) {
            console.error('Auth check error:', error);
            // On error, allow loading first to prevent infinite loop
            return true;
        }
    }
    
    // Redirect to login
    function redirectToLogin() {
        // Store the attempted URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    // Enhanced security: Check for tampering
    function checkForTampering() {
        // Check if localStorage is available
        if (typeof Storage === 'undefined') {
            showBrowserWarningDialog();
            return false;
        }
        
        // Check for suspicious modifications
        const originalGuestMode = localStorage.getItem('guestMode');
        const originalGuestData = localStorage.getItem('guestData');
        
        if (originalGuestMode === 'true' && !originalGuestData) {
            // Inconsistent state, clean up
            localStorage.removeItem('guestMode');
            localStorage.removeItem('userType');
            localStorage.removeItem('guestLoginTime');
            return false;
        }
        
        return true;
    }
    
    // Show browser warning dialog
    function showBrowserWarningDialog() {
        // สร้าง overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        overlay.style.backdropFilter = 'blur(4px)';
        
        // สร้าง popup container
        const popup = document.createElement('div');
        popup.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-95';
        
        popup.innerHTML = `
            <div class="text-center">
                <!-- Icon -->
                <div class="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl text-orange-600 dark:text-orange-400"></i>
                </div>
                
                <!-- Title -->
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">⚠️ เบราว์เซอร์ไม่รองรับ</h3>
                
                <!-- Message -->
                <div class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                    <p class="mb-3">เบราว์เซอร์ของคุณไม่รองรับการเก็บข้อมูล</p>
                    <p class="mb-3">กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่า เช่น:</p>
                    <div class="text-left space-y-2">
                        <div class="flex items-center">
                            <i class="fas fa-chrome text-blue-500 mr-2"></i>
                            <span>Google Chrome (เวอร์ชัน 60+)</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-firefox text-orange-500 mr-2"></i>
                            <span>Mozilla Firefox (เวอร์ชัน 55+)</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-safari text-blue-400 mr-2"></i>
                            <span>Safari (เวอร์ชัน 11+)</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-edge text-blue-600 mr-2"></i>
                            <span>Microsoft Edge (เวอร์ชัน 79+)</span>
                        </div>
                    </div>
                </div>
                
                <!-- Buttons -->
                <div class="flex gap-3 justify-center">
                    <button id="redirectBtn" class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                        <i class="fas fa-sign-out-alt mr-2"></i>
                        ไปหน้า Login
                    </button>
                </div>
            </div>
        `;
        
        // เพิ่ม popup ไปยัง overlay
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // แสดง popup ด้วย animation
        setTimeout(() => {
            popup.classList.remove('scale-95');
            popup.classList.add('scale-100');
        }, 10);
        
        // Event listeners
        const redirectBtn = document.getElementById('redirectBtn');
        
        redirectBtn.addEventListener('click', () => {
            closeBrowserWarningDialog(overlay, () => {
                window.location.href = 'login.html';
            });
        });
        
        // ปิด popup เมื่อคลิก overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeBrowserWarningDialog(overlay, () => {
                    window.location.href = 'login.html';
                });
            }
        });
        
        // ปิด popup เมื่อกด Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeBrowserWarningDialog(overlay, () => {
                    window.location.href = 'login.html';
                });
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    // Close browser warning dialog
    function closeBrowserWarningDialog(overlay, callback) {
        const popup = overlay.querySelector('div');
        popup.classList.remove('scale-100');
        popup.classList.add('scale-95');
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (callback) callback();
        }, 300);
    }
    
    // Session timeout check
    function checkSessionTimeout() {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = new Date().getTime();
        
        // Auto-logout after 2 hours of inactivity for guests
        if (lastActivity) {
            const inactiveTime = now - parseInt(lastActivity);
            const maxInactiveTime = 2 * 60 * 60 * 1000; // 2 hours
            
            if (inactiveTime > maxInactiveTime) {
                console.log('Session expired due to inactivity');
                // Clear guest session
                localStorage.removeItem('guestMode');
                localStorage.removeItem('guestData');
                localStorage.removeItem('userType');
                localStorage.removeItem('guestLoginTime');
                localStorage.removeItem('lastActivity');
                return false;
            }
        }
        
        // Update last activity
        localStorage.setItem('lastActivity', now.toString());
        return true;
    }
    
    // Security headers check (basic)
    function checkSecurityHeaders() {
        // This is a basic check - in production, you'd want server-side headers
        const isHTTPS = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
        
        if (!isHTTPS && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.warn('Warning: Not using HTTPS. Consider using HTTPS for production.');
        }
        
        return true;
    }
    
    // Main auth guard execution
    function runAuthGuard() {
        console.log('Running authentication guard...');
        
        // Run all security checks
        const tamperingCheck = checkForTampering();
        const securityCheck = checkSecurityHeaders();
        const sessionCheck = checkSessionTimeout();
        const authCheck = checkAuthentication();
        
        // If any check fails, the redirect will happen automatically
        if (!tamperingCheck || !securityCheck || !sessionCheck || !authCheck) {
            console.log('Authentication guard failed, redirecting...');
            return;
        }
        
        console.log('Authentication guard passed');
        
        // Set up activity monitoring for session timeout
        setupActivityMonitoring();
    }
    
    // Monitor user activity for session timeout
    function setupActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        function updateActivity() {
            localStorage.setItem('lastActivity', new Date().getTime().toString());
        }
        
        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Check session every 5 minutes
        setInterval(() => {
            const guestMode = localStorage.getItem('guestMode') === 'true';
            if (guestMode) {
                checkSessionTimeout();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    // Wait for DOM to be ready, then run auth guard
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAuthGuard);
    } else {
        runAuthGuard();
    }
    
    // Export auth guard functions for global access
    window.AuthGuard = {
        checkAuthentication,
        redirectToLogin,
        checkForTampering,
        checkSessionTimeout,
        runAuthGuard
    };
    
})();

// Additional protection: Prevent right-click and developer tools on sensitive pages
(function() {
    'use strict';
    
    // Only on production and not for admin users
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Disable right-click context menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Disable common keyboard shortcuts for developer tools
        document.addEventListener('keydown', function(e) {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
                (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                e.preventDefault();
                return false;
            }
        });
        
        // Detect developer tools
        let devtools = {open: false, orientation: null};
        const threshold = 160;
        
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    console.log('Developer tools detected');
                    devtools.open = true;
                    // Optional: Redirect or take action
                    // window.location.href = 'login.html';
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
})();
