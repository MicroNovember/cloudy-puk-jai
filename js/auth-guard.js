/**
 * Authentication Guard - Prevents unauthorized access
 * This script runs before the main application to ensure authentication
 */

(function() {
    'use strict';
    
    // Debug: Log when auth-guard loads
    console.log('🛡️ Auth Guard: Script loaded');
    console.log('🛡️ Auth Guard: Current URL:', window.location.href);
    
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
        console.log('🛡️ Auth Guard: Public page detected, skipping auth check');
        return;
    }
    
    console.log('🛡️ Auth Guard: Protected page detected, checking authentication...');
    
    // Check authentication
    const checkAuth = () => {
        console.log('🛡️ Auth Guard: Running auth check...');
        
        try {
            // Check for Firebase user
            if (typeof window.auth !== 'undefined' && window.auth.currentUser) {
                console.log('🛡️ Auth Guard: Firebase user found:', window.auth.currentUser.email);
                return true;
            }
            
            console.log('🛡️ Auth Guard: No Firebase user found');
            
            // Check for Guest Mode
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            
            console.log('🛡️ Auth Guard: Guest mode:', guestMode, 'Guest data:', !!guestData);
            
            if (guestMode && guestData) {
                console.log('🛡️ Auth Guard: Guest mode found');
                return true;
            }
            
            console.log('🛡️ Auth Guard: No authentication found, redirecting to login');
            window.location.href = 'login.html';
            return false;
            
        } catch (error) {
            console.error('🛡️ Auth Guard: Error checking auth:', error);
            return false;
        }
    };
    
    // Wait for Firebase auth state to be ready
    if (typeof window.auth !== 'undefined') {
        const MAX_RETRIES = 30;
        const RETRY_DELAY_MS = 300;
        let retries = 0;

        const redirectToLogin = () => {
            try {
                const payload = {
                    ts: new Date().toISOString(),
                    from: window.location.href,
                    retries,
                    authCurrentUser: !!(window.auth && window.auth.currentUser),
                    windowCurrentUser: !!window.currentUser,
                    guestMode: localStorage.getItem('guestMode'),
                    hasGuestData: !!localStorage.getItem('guestData')
                };
                sessionStorage.setItem('authGuard:lastRedirect', JSON.stringify(payload));
                sessionStorage.setItem('authGuard:suppressLoginRedirectUntil', String(Date.now() + 10000));
            } catch (e) {
                // ignore
            }

            console.log('🛡️ Auth Guard: Redirecting to login');
            window.location.href = 'login.html';
        };

        const hasGuestSession = () => {
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            return guestMode && !!guestData;
        };

        const verifyAuthOrRetry = (reason) => {
            const firebaseUser = window.auth.currentUser || window.currentUser;
            if (firebaseUser) {
                console.log('🛡️ Auth Guard: Firebase user found:', firebaseUser.email);
                return;
            }

            if (hasGuestSession()) {
                console.log('🛡️ Auth Guard: Guest mode found');
                return;
            }

            if (retries < MAX_RETRIES) {
                retries++;
                console.log('🛡️ Auth Guard: No auth yet (' + reason + '), retrying ' + retries + '/' + MAX_RETRIES);
                setTimeout(() => verifyAuthOrRetry('retry'), RETRY_DELAY_MS);
                return;
            }

            console.log('🛡️ Auth Guard: No auth after retries, redirecting');
            try {
                const payload = {
                    ts: new Date().toISOString(),
                    from: window.location.href,
                    reason,
                    retries,
                    maxRetries: MAX_RETRIES,
                    retryDelayMs: RETRY_DELAY_MS,
                    authCurrentUser: !!(window.auth && window.auth.currentUser),
                    windowCurrentUser: !!window.currentUser,
                    guestMode: localStorage.getItem('guestMode'),
                    hasGuestData: !!localStorage.getItem('guestData')
                };
                sessionStorage.setItem('authGuard:lastRedirect', JSON.stringify(payload));
            } catch (e) {
                // ignore
            }
            redirectToLogin();
        };

        // Start a verification cycle immediately
        verifyAuthOrRetry('initial');

        // Also listen for auth state changes (but do NOT redirect immediately on null)
        window.auth.onAuthStateChanged((user) => {
            console.log('🛡️ Auth Guard: Auth state changed, user:', user ? user.email : 'null');
            if (user) {
                console.log('🛡️ Auth Guard: Firebase user found, staying on page');
                return;
            }
            verifyAuthOrRetry('onAuthStateChanged-null');
        });
    } else {
        // Fallback if auth not available
        console.log('🛡️ Auth Guard: Auth not available, using fallback');
        setTimeout(() => {
            checkAuth();
        }, 1000);
    }
    
})();
