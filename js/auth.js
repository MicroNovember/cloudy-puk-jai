// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_axWhWF5m6x2-r3HY-KDdoiSu-Kff67U",
    authDomain: "pukjai-app.firebaseapp.com",
    projectId: "pukjai-app",
    storageBucket: "pukjai-app.firebasestorage.app",
    messagingSenderId: "942620588150",
    appId: "1:942620588150:web:b7ddd027d8188b3523c757"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const auth = firebase.auth();

// Guest/Trial data retention (days)
const GUEST_SESSION_DAYS = 7;

// Test Firebase functionality
auth.onAuthStateChanged((user) => {
    // Auth state change detected
    console.log('🔥 Firebase Auth State Changed:', user ? 'User logged in' : 'User logged out');
    console.log('🔥 Firebase User:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
    } : null);
    
    if (user) {
        // ทำให้ผู้ใช้พร้อมใช้งานทั่วโลก
        window.currentUser = user;
        
        // อัปเดต AuthUtils
        if (window.AuthUtils) {
            // Updating AuthUtils with new user
            console.log('🔥 Updating AuthUtils with Firebase user');
        }
    } else {
        // No user in auth state change
        window.currentUser = null;
        console.log('🔥 Firebase: No user, window.currentUser set to null');
    }
});

// Alpine.js Auth Component
document.addEventListener('alpine:init', () => {
    
    Alpine.data('authApp', () => {
        
        const authAppInstance = {
            // Form Data
            form: {
                email: '',
                password: '',
                remember: false
            },
        
        // Journal Entry Form
        journalEntry: {
            title: '',
            content: '',
            mood: '',
            tags: '',
            isPrivate: false
        },
        
        // Validation State
        validation: {
            title: false,
            content: false,
            mood: false,
            tags: false
        },
        
        // Register Form Data
        registerForm: {
            email: '',
            password: '',
            confirmPassword: '',
            agreedToTerms: false
        },
        
        // UI State
        loading: false,
        error: '',
        success: '',
        showPassword: false,
        showRegisterPassword: false,
        showConfirmPassword: false,
        showEmailForm: false,
        showGuestModal: false,
        showLegalModal: false,
        legalTab: 'terms',
        guestAgreed: false,
        darkMode: false,
        
                
        // Tab State
        activeTab: 'login',
        
        // Greeting message based on time of day
        getGreetingMessage() {
            const hour = new Date().getHours();
            let greeting = '';
            
            if (hour >= 5 && hour < 12) {
                greeting = 'สวัสดีตอนเช้า';
            } else if (hour >= 12 && hour < 17) {
                greeting = 'สวัสดีตอนบ่าย';
            } else if (hour >= 17 && hour < 20) {
                greeting = 'สวัสดีตอนเย็น';
            } else {
                greeting = 'สวัสดีตอนดึก';
            }
            
            return greeting + '💖';
        },
        
        // Time-based greeting system (same as app.js)
        getTimeBasedGreeting() {
            const hour = new Date().getHours();
            let timeGreeting = '';
            
            if (hour >= 5 && hour < 12) {
                timeGreeting = 'สวัสดีตอนเช้า';
            } else if (hour >= 12 && hour < 17) {
                timeGreeting = 'สวัสดีตอนบ่าย';
            } else if (hour >= 17 && hour < 21) {
                timeGreeting = 'สวัสดีตอนเย็น';
            } else {
                timeGreeting = 'สวัสดีตอนดึก';
            }
            
            return timeGreeting + ' 💖 ';
        },

        openLegal(tab) {
            this.legalTab = tab || 'terms';
            this.showLegalModal = true;
        },

        closeLegal() {
            this.showLegalModal = false;
        },
        
        // Initialize Firebase and check auth state
        init() {
            console.log('🔧 Initializing auth app...');

            try {
                const last = sessionStorage.getItem('authGuard:lastRedirect');
                if (last) {
                    console.warn('🛡️ Auth Guard: last redirect info:', JSON.parse(last));
                    sessionStorage.removeItem('authGuard:lastRedirect');
                }
            } catch (e) {
                // ignore
            }

            // If auth-guard just redirected us from a protected page, suppress auto-redirect back to index
            let suppressUntil = 0;
            try {
                const raw = sessionStorage.getItem('authGuard:suppressLoginRedirectUntil');
                suppressUntil = raw ? Number(raw) : 0;
            } catch (e) {
                suppressUntil = 0;
            }
            
            // Redirect if already authenticated (use onAuthStateChanged, auth.currentUser may be null initially)
            if (!window.__authLoginRedirectListenerAttached) {
                window.__authLoginRedirectListenerAttached = true;
                auth.onAuthStateChanged((user) => {
                    try {
                        const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
                        const isLoginPage = currentPage === 'login.html' || currentPage === '';
                        const isSuppressed = suppressUntil && Date.now() < suppressUntil;
                        if (isLoginPage && user && !isSuppressed) {
                            console.log('🔥 User already logged in, redirecting...');
                            window.location.href = 'index.html';
                        }
                    } catch (e) {
                        // ignore
                    }
                });
            }
            
            // Load dark mode preference
            this.darkMode = localStorage.getItem('darkMode') === 'true';
            
            // Load remembered email
            const rememberedEmail = localStorage.getItem('rememberUser');
            
            // Load remembered email
            if (rememberedEmail) {
                this.form.email = rememberedEmail;
                this.form.remember = true;
            }

            // Support deep-link to legal modal (stop using terms/privacy pages)
            try {
                const params = new URLSearchParams(window.location.search || '');
                const legal = (params.get('legal') || '').toLowerCase();
                if (legal === 'terms' || legal === 'privacy') {
                    this.openLegal(legal);
                }
            } catch (e) {
                // ignore
            }
        },
        
        // Check if guest is logged in
        isGuestLoggedIn() {
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            
            if (!guestMode || !guestData) {
                return false;
            }
            
            // Check if guest session is still valid
            const data = JSON.parse(guestData);
            const loginTime = new Date(data.loginTime);
            const now = new Date();
            const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > GUEST_SESSION_DAYS) {
                // Guest session expired
                this.clearGuestData();
                return false;
            }
            
            return true;
        },
        
        // Login as Guest (Streamlined)
        async loginAsGuest() {
            this.loading = true;
            this.error = '';
            
            try {
                // Clear any existing auth data
                this.clearAllAuthData();
                
                // Set guest mode in localStorage
                localStorage.setItem('guestMode', 'true');
                localStorage.setItem('userType', 'guest');
                localStorage.setItem('guestLoginTime', new Date().toISOString());
                
                // Create guest user data
                const guestData = {
                    uid: 'guest_' + Date.now(),
                    email: 'guest@cloudypukjai.local',
                    displayName: 'Guest User',
                    photoURL: null,
                    agreedAt: new Date().toISOString(),
                    agreedToTerms: true, // Explicit agreement flag
                    deviceInfo: navigator.userAgent,
                    loginWarning: true,
                    loginTime: new Date().toISOString() // Add loginTime for compatibility
                };
                
                localStorage.setItem('guestData', JSON.stringify(guestData));
                
                // Close modal and show success message
                this.showGuestModal = false;
                this.success = '✅ เข้าสู่ระบบแบบ Guest สำเร็จแล้ว';
                setTimeout(() => {
                    this.success = '';
                }, 3000);
                
                this.loading = false;
                
                // Redirect to main app
                this.redirectToApp();
                
            } catch (error) {
                this.error = 'เกิดข้อผิดพลาดในการเข้าใช้งานแบบ Guest: ' + error.message;
                this.loading = false;
            }
        },
        
        // Proceed with Guest Login (from modal)
        proceedGuestLogin() {
            if (!this.guestAgreed) {
                this.error = 'กรุณายอมรับเงื่อนไขการใช้งานแบบ Guest';
                return;
            }
            
            // Close modal and proceed with login
            this.showGuestModal = false;
            this.loginAsGuest();
        },
        
        // Show Guest Modal (reset agreement state)
        showGuestModalFunc() {
            this.guestAgreed = false; // Reset agreement
            this.error = ''; // Clear any previous errors
            this.showGuestModal = true;
        },
        
        // Debug Register Function
        debugRegister() {
            // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
            const validation = {
                email: !!this.registerForm.email,
                password: !!this.registerForm.password,
                confirmPassword: !!this.registerForm.confirmPassword,
                agreedToTerms: !!this.registerForm.agreedToTerms
            };
            
            // ตรวจสอบว่าข้อมูลถูกต้องหรือไม่
            const validationDetails = {
                emailValid: this.registerForm.email.includes('@'),
                passwordLength: this.registerForm.password.length >= 6,
                passwordsMatch: this.registerForm.password === this.registerForm.confirmPassword
            };
            
            // ถ้ามีข้อมูลครบถ้วน ให้ลองเรียก register()
            if (validation.email && validation.password && validation.confirmPassword && validation.agreedToTerms) {
                this.register();
            } else {
                this.error = 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนกด Debug';
            }
        },
        
        // Generate Guest ID
        generateGuestId() {
            return 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        },
        
        async register() {
            // Clear previous messages
            this.error = '';
            this.success = '';
            
            // Validate form
            if (!this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) {
                this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
                return;
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.error = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
                return;
            }
            
            if (this.registerForm.password.length < 6) {
                this.error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
                return;
            }
            
            if (!this.registerForm.agreedToTerms) {
                this.error = 'กรุณายอมรับเงื่อนไขการใช้งาน';
                return;
            }
            
            this.loading = true;
            
            try {
                // Create user with Firebase
                const userCredential = await auth.createUserWithEmailAndPassword(
                    this.registerForm.email, 
                    this.registerForm.password
                );
                
                const newUser = userCredential.user;
                
                // ไม่ต้องอัปเดต profile ด้วย displayName ใช้ email แทน
                this.success = 'สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
                // Redirect after successful registration
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
                
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Register with Google
        async registerWithGoogle() {
            this.loading = true;
            this.error = '';
            this.success = '';
            
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                const result = await auth.signInWithPopup(provider);
                const googleUser = result.user;
                
                this.success = 'เชื่อมต่อ Google สำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
                
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Login with Email/Password
        async login() {
            console.log('🔐 Starting email login process...');
            console.log('🔐 Email:', this.form.email);
            
            if (!this.form.email || !this.form.password) {
                console.log('🔐 Form data during validation:');
                console.log('  - this.form.email:', this.form.email);
                console.log('  - this.form.password:', this.form.password);
                console.log('🔐 Validation failed: missing email or password');
                this.error = 'กรุณากรอกอีเมลและรหัสผ่าน';
                return;
            }
            
            this.loading = true;
            this.error = '';
            console.log('🔐 Loading state set to true');
            
            try {
                // Set Firebase persistence (remember me)
                try {
                    const persistence = this.form.remember
                        ? firebase.auth.Auth.Persistence.LOCAL
                        : firebase.auth.Auth.Persistence.SESSION;
                    await auth.setPersistence(persistence);
                } catch (e) {
                    console.warn('🔐 Failed to set auth persistence:', e);
                }

                // Clear any existing guest data
                console.log('🔐 Clearing existing guest data...');
                this.clearGuestData();
                
                console.log('🔐 Attempting Firebase sign in...');
                // Sign in with Firebase
                const userCredential = await auth.signInWithEmailAndPassword(this.form.email, this.form.password);
                console.log('🔐 Firebase sign in successful:', userCredential.user.email);

                // Ensure session is established before navigation
                try {
                    await userCredential.user.getIdToken();
                } catch (e) {
                    console.warn('🔐 Failed to get ID token before redirect:', e);
                }
                
                // Remember me functionality
                if (this.form.remember) {
                    console.log('🔐 Remember me enabled, saving email...');
                    localStorage.setItem('rememberUser', this.form.email);
                } else {
                    console.log('🔐 Remember me disabled, removing saved email...');
                    localStorage.removeItem('rememberUser');
                }
                
                console.log('🔐 Redirecting to app...');
                this.redirectToApp();
                
            } catch (error) {
                console.error('🔐 Login error:', error);
                this.handleAuthError(error);
            } finally {
                console.log('🔐 Loading state set to false');
                this.loading = false;
            }
        },
        
        // Login with Google
        async loginWithGoogle() {
            this.loading = true;
            this.error = '';
            
            try {
                // Clear any existing guest data
                this.clearGuestData();
                
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                await auth.signInWithPopup(provider);
                
                this.redirectToApp();
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Redirect to App
        redirectToApp() {
            console.log('🚀 Redirecting to app...');
            console.log('🚀 Current user:', auth.currentUser ? auth.currentUser.email : 'null');
            
            // Add a small delay to ensure Firebase state is ready
            setTimeout(() => {
                console.log('🚀 Actually redirecting now...');
                window.location.href = 'index.html';
            }, 100);
        },
        
        // Validate Journal Entry
        validateJournalEntry() {
            this.validation.title = !this.journalEntry.title || this.journalEntry.title.length < 3;
            this.validation.content = !this.journalEntry.content || this.journalEntry.content.length < 10;
            this.validation.mood = !this.journalEntry.mood;
            this.validation.tags = !this.journalEntry.tags;
            
            // Check for inappropriate content
            const inappropriateWords = ['คำหยาบ', 'คำไม่สุภาพ', 'คำหยาม', 'ขาย', 'โง่', 'เหี้ยน', 'fuck', 'shit', 'damn'];
            const hasInappropriateContent = inappropriateWords.some(word => 
                this.journalEntry.title.toLowerCase().includes(word) || 
                this.journalEntry.content.toLowerCase().includes(word)
            );
            
            if (hasInappropriateContent) {
                this.validation.title = true;
                this.validation.content = true;
                this.error = '⚠️ กรุณากรอกข้อมูลที่เหมาะสม ไม่เหมาะสม หรือมีคำที่ไม่เหมาะสม';
                return false;
            }
            
            return !this.validation.title && !this.validation.content && this.validation.mood;
        },
        
        // Save Journal Entry
        saveJournalEntry() {
            if (!this.validateJournalEntry()) {
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                // Get existing journal entries
                const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                
                // Create new entry
                const newEntry = {
                    id: Date.now().toString(),
                    title: this.journalEntry.title.trim(),
                    content: this.journalEntry.content.trim(),
                    mood: this.journalEntry.mood,
                    tags: this.journalEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    isPrivate: this.journalEntry.isPrivate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Add to entries array
                existingEntries.unshift(newEntry);
                
                // Keep only last 100 entries
                if (existingEntries.length > 100) {
                    existingEntries.splice(100);
                }
                
                // Save to localStorage
                localStorage.setItem('journalEntries', JSON.stringify(existingEntries));
                
                // Clear form
                this.journalEntry = {
                    title: '',
                    content: '',
                    mood: '',
                    tags: '',
                    isPrivate: false
                };
                
                this.validation = {
                    title: false,
                    content: false,
                    mood: false,
                    tags: false
                };
                
                this.success = '✅ บันทึกข้อมูลสำเร็จแล้ว';
                setTimeout(() => {
                    this.success = '';
                }, 3000);
                
            } catch (error) {
                this.error = '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message;
            } finally {
                this.loading = false;
            }
        },
        
        // Clear Guest Data
        clearGuestData() {
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guestData');
            localStorage.removeItem('userType');
            localStorage.removeItem('guestLoginTime');
        },
        
        // Clear All Auth Data
        clearAllAuthData() {
            this.clearGuestData();
            localStorage.removeItem('rememberUser');
        },
        
        // Handle Authentication Errors
        handleAuthError(error) {
            const errorMessages = {
                'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมล',
                'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่',
                'auth/invalid-email': 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ',
                'auth/user-disabled': 'บัญชีผู้ใช้ถูกระงับการใช้งาน',
                'auth/too-many-requests': 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
                'auth/network-request-failed': 'การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต',
                'auth/invalid-credential': 'ข้อมูลรับรองไม่ถูกต้อง กรุณาลองใหม่'
            };
            
            this.error = errorMessages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        },
        
        // Toggle Dark Mode
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },
        
        // Utility: Format date
        formatDate(date) {
            return new Intl.DateTimeFormat('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        }
    };
        
        window.authApp = authAppInstance;
        
        return authAppInstance;
    });
});

// Utility functions for auth management
window.AuthUtils = {
    // Get current user info
    getCurrentUser() {
        console.log('🔍 AuthUtils: Getting current user...');
        
        // ตรวจสอบ Guest Mode ก่อน
        const guestMode = localStorage.getItem('guestMode');
        const guestData = localStorage.getItem('guestData');
        
        console.log('🔍 AuthUtils: Guest mode:', guestMode);
        console.log('🔍 AuthUtils: Guest data exists:', !!guestData);
        
        if (guestMode === 'true' && guestData) {
            try {
                const guestUser = JSON.parse(guestData);
                
                // ตรวจสอบว่า guest ยังไม่หมดอายุ
                // Check for agreedAt or loginTime in guest data
                const loginTime = new Date(guestUser.agreedAt || guestUser.loginTime || localStorage.getItem('guestLoginTime'));
                const now = new Date();
                const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
                
                if (daysDiff < GUEST_SESSION_DAYS) {
                    const result = {
                        uid: guestUser.uid,
                        email: guestUser.email,
                        displayName: guestUser.displayName,
                        isGuest: true,
                        loginTime: guestUser.loginTime,
                        sessionId: guestUser.sessionId
                    };
                    console.log('🔍 AuthUtils: Guest user is valid, returning:', result);
                    return result;
                } else {
                    console.log('🔍 AuthUtils: Guest session expired, cleaning up...');
                    localStorage.removeItem('guestMode');
                    localStorage.removeItem('guestData');
                    localStorage.removeItem('guestLoginTime');
                }
            } catch (error) {
                console.error('🔍 AuthUtils: Error parsing guest data:', error);
            }
        }
        
        // Return Firebase user if available
        if (auth.currentUser) {
            const firebaseUser = auth.currentUser;
            
            // สำหรับผู้ใช้ Firebase ให้ใช้ email เป็น displayName เสมอ
            const displayName = firebaseUser.email || 'User';
            
            const result = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: displayName,
                isGuest: false
            };
            console.log('🔍 AuthUtils: Firebase user found, returning:', result);
            return result;
        }
        
        console.log('🔍 AuthUtils: No user found, returning null');
        return null;
    },
    
    // Login with Email/Password
    async login(email, password) {
        try {
            // Check if Firebase is available
            if (!auth) {
                throw new Error('Firebase auth not initialized');
            }
            
            // Sign in with Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Clear any existing guest data
            this.clearGuestData();
            
            // Set remember me functionality
            const rememberMe = localStorage.getItem('rememberUser') === email;
            if (rememberMe) {
                localStorage.setItem('rememberUser', email);
            }
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.email || user.displayName || 'User',
                    photoURL: user.photoURL,
                    isGuest: false
                }
            };
            
        } catch (error) {
            console.error('Firebase login error:', error);
            
            // Return error details
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    },
    
    // Get error message from Firebase error
    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมล',
            'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่',
            'auth/invalid-email': 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ',
            'auth/user-disabled': 'บัญชีผู้ใช้ถูกระงับการใช้งาน',
            'auth/too-many-requests': 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
            'auth/network-request-failed': 'การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต',
            'auth/invalid-credential': 'ข้อมูลรับรองไม่ถูกต้อง กรุณาลองใหม่'
        };
        
        return errorMessages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
    },
    
    // Clear Guest Data
    clearGuestData() {
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guestData');
        localStorage.removeItem('userType');
        localStorage.removeItem('guestLoginTime');
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return auth.currentUser !== null || localStorage.getItem('guestMode') === 'true';
    },
    
    // Logout
    async logout() {
        try {
            // Check if guest
            const isGuest = localStorage.getItem('guestMode') === 'true';
            
            if (isGuest) {
                // Clear guest data
                localStorage.removeItem('guestMode');
                localStorage.removeItem('guestData');
                localStorage.removeItem('userType');
                localStorage.removeItem('guestLoginTime');
            } else {
                // Logout from Firebase
                await auth.signOut();
            }
            
            // Clear remember me
            localStorage.removeItem('rememberUser');
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            window.location.href = 'login.html';
        }
    },
    
    // Get session info
    getSessionInfo() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        return {
            user,
            isGuest: user.isGuest,
            loginTime: user.isGuest ? user.loginTime : new Date().toISOString(),
            sessionDuration: user.isGuest ? `${GUEST_SESSION_DAYS} days` : 'Until logout'
        };
    }
};

// Export for global access
window.auth = auth;
window.firebase = firebase;
