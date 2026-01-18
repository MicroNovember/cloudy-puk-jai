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

// Test Firebase functionality
auth.onAuthStateChanged((user) => {
    // Auth state change detected
    if (user) {
        // ทำให้ผู้ใช้พร้อมใช้งานทั่วโลก
        window.currentUser = user;
        
        // อัปเดต AuthUtils
        if (window.AuthUtils) {
            // Updating AuthUtils with new user
        }
    } else {
        // No user in auth state change
        window.currentUser = null;
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
        showConfirmPassword: false,
        showEmailForm: false,
        showGuestModal: false,
        guestAgreed: false,
        darkMode: false,
        
        // Initialize Firebase and check auth state
        init() {
            
            // Check for existing session
            auth.onAuthStateChanged((user) => {
                
                if (user) {
                    // User is signed in, redirect to main app
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes('login.html')) {
                        this.redirectToApp();
                    }
                } else {
                    // User is signed out
                }
            });
            
            // Check for guest session
            const guestMode = localStorage.getItem('guestMode') === 'true';
            if (guestMode) {
                // Guest mode detected
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
        },
        
        // Check if guest is logged in
        isGuestLoggedIn() {
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            
            if (!guestMode || !guestData) {
                return false;
            }
            
            // Check if guest session is still valid (30 days)
            const data = JSON.parse(guestData);
            const loginTime = new Date(data.loginTime);
            const now = new Date();
            const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 30) {
                // Guest session expired
                this.clearGuestData();
                return false;
            }
            
            return true;
        },
        
        // Show Guest Agreement Modal
        showGuestAgreement() {
            this.showGuestModal = true;
        },
        
        // Login as Guest
        loginAsGuest() {
            this.loading = true;
            this.error = '';
            
            // สร้าง popup แจ้งเตือนสำหรับการเข้าใช้งานแบบ Guest
            this.showGuestWarningDialog();
        },
        
        // แสดง popup แจ้งเตือนการเข้าใช้งานแบบ Guest
        showGuestWarningDialog() {
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
                    <div class="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-user-astronaut text-2xl text-blue-600 dark:text-blue-400"></i>
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">🚀 เข้าใช้งานแบบ Guest</h3>
                    
                    <!-- Message -->
                    <div class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                        <p class="mb-3">⚠️ <strong>คำเตือนเกี่ยวกับการใช้งานแบบ Guest:</strong></p>
                        <div class="text-left space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-mobile-alt text-blue-500 mt-1 mr-2"></i>
                                <span>📱 ข้อมูลของคุณจะถูกเก็บไว้เฉพาะในอุปกรณ์นี้เท่านั้น</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-sync-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🔒 ไม่สามารถซิงค์ข้อมูลข้ามอุปกรณ์ได้</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-trash-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🗑️ การลบแคช/คุกกี้/ใช้เบราว์เซอร์อื่นจะทำให้ข้อมูลหายไป</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-exchange-alt text-blue-500 mt-1 mr-2"></i>
                                <span>📱 การเปลี่ยนอุปกรณ์จะทำให้ข้อมูลสูญหายไป</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🔐 แนะนำให้สมัครสมาชิกเพื่อความปลอดภัยข้อมูล</span>
                            </div>
                        </div>
                        <p class="mt-3 font-semibold">คุณยอมรับเงื่อนไขและเข้าใจใจข้อความเสี่ยงเหล่านี้หรือไม่?</p>
                    </div>
                    
                    <!-- Buttons -->
                    <div class="flex gap-3 justify-center">
                        <button id="cancelBtn" class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center">
                            <i class="fas fa-times mr-2"></i>
                            ยกเลิก
                        </button>
                        <button id="confirmBtn" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                            <i class="fas fa-user-astronaut mr-2"></i>
                            ยอมรับและเข้าใช้งาน
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
            const cancelBtn = document.getElementById('cancelBtn');
            const confirmBtn = document.getElementById('confirmBtn');
            
            cancelBtn.addEventListener('click', () => {
                this.closeGuestWarningDialog(overlay, () => {
                    this.loading = false;
                    this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                });
            });
            
            confirmBtn.addEventListener('click', () => {
                this.closeGuestWarningDialog(overlay, () => {
                    this.proceedWithGuestLogin();
                });
            });
            
            // ปิด popup เมื่อคลิก overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeGuestWarningDialog(overlay, () => {
                        this.loading = false;
                        this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                    });
                }
            });
            
            // ปิด popup เมื่อกด Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeGuestWarningDialog(overlay, () => {
                        this.loading = false;
                        this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                    });
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        },
        
        // ปิด popup แจ้งเตือน Guest
        closeGuestWarningDialog(overlay, callback) {
            const popup = overlay.querySelector('div');
            popup.classList.remove('scale-100');
            popup.classList.add('scale-95');
            
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (callback) callback();
            }, 300);
        },
        
        // ดำเนินการ login แบบ Guest
        proceedWithGuestLogin() {
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
                deviceInfo: navigator.userAgent,
                loginWarning: true
            };
            
            localStorage.setItem('guestData', JSON.stringify(guestData));
            
            // Show success message briefly
            this.success = '✅ เข้าสู่ระบบแบบ Guest สำเร็จแล้ว';
            setTimeout(() => {
                this.success = '';
            }, 3000);
            
            this.loading = false;
            
            // Redirect to main app
            this.redirectToApp();
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
                
                const user = userCredential.user;
                
                // ไม่ต้องอัปเดต profile ด้วย displayName ใช้ email แทน
                this.success = 'สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
                // Redirect after successful registration
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
// ...

                provider.addScope('profile');
                
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                
                this.success = 'เชื่อมต่อ Google สำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
// ...

// Utility functions for auth management
window.AuthUtils = {
    // Get current user info
    getCurrentUser() {
        // ตรวจสอบ Guest Mode ก่อน
        const guestMode = localStorage.getItem('guestMode');
        const guestData = localStorage.getItem('guestData');
        
        if (guestMode === 'true' && guestData) {
            try {
                const guestUser = JSON.parse(guestData);
                
                // ตรวจสอบว่า guest ยังไม่หมดอายุ (30 วัน)
                const loginTime = new Date(guestUser.loginTime);
                const now = new Date();
                const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
                
                if (daysDiff < 30) {
                    return {
                        uid: guestUser.uid,
                        email: guestUser.email,
                        displayName: guestUser.displayName,
                        isGuest: true,
                        loginTime: guestUser.loginTime,
                        sessionId: guestUser.sessionId
                    };
                } else {
                    localStorage.removeItem('guestMode');
                    localStorage.removeItem('guestData');
                    localStorage.removeItem('guestLoginTime');
                }
            } catch (error) {
                console.error('Error parsing guest data:', error);
            }
        }
        
        // Return Firebase user if available
        if (auth.currentUser) {
            const user = auth.currentUser;
            
            // สำหรับผู้ใช้ Firebase ให้ใช้ email เป็น displayName เสมอ
            const displayName = user.email || 'User';
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                isGuest: false
            };
        }
        
        return null;
    },
    
    // Login with Email/Password
    async login(email, password) {
// ...
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
            sessionDuration: user.isGuest ? '30 days' : 'Until logout'
        };
    }
};

// Export for global access
window.auth = auth;
window.firebase = firebase;
