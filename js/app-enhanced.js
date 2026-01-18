// MindBloom App - Enhanced with Firebase Database
// Cloudy・Puk・Jai Mental Health Application
// Version 2.1 - Enhanced with Firebase Integration

document.addEventListener('alpine:init', () => {
    Alpine.data('mindbloomApp', () => ({
        // ============================================
        // APP STATE & CONFIGURATION
        // ============================================
        
        // Navigation State
        currentPage: 'home',
        mobileMenuOpen: false,
        
        // UI State
        darkMode: true,
        loading: false,
        error: '',
        success: '',
        
        // Modal State
        modalOpen: null,
        
        // User Authentication State
        user: null,
        isGuest: false,
        isAuthenticated: false,
        
        // ============================================
        // USER DATA
        // ============================================
        
        // Journal Data
        journalEntries: [],
        journalForm: {
            date: new Date().toISOString().split('T')[0],
            mood: 'neutral',
            entry: '',
            gratitude: ['', '', ''],
            dailyGoal: ''
        },
        
        // Growth Tree Data
        tree: {
            level: 1,
            progress: 1,
            streak: 2,
            points: 150,
            badges: 3,
            icon: '🌱',
            name: 'เมล็ดพันธุ์แห่งการเริ่มต้น',
            animation: ''
        },
        
        // Personal Growth Data
        personalGrowth: {
            achievements: [],
            milestones: [],
            currentStreak: 0,
            longestStreak: 0,
            totalEntries: 0
        },
        
        // ============================================
        // FIREBASE DATABASE FUNCTIONS
        // ============================================
        
        // Initialize user data in Firestore
        async initializeUserData(userData) {
            if (!window.db || !userData) return;
            
            try {
                const userRef = window.db.collection('users').doc(userData.uid);
                
                // Check if user document exists
                const userDoc = await userRef.get();
                
                if (!userDoc.exists) {
                    // Create new user document
                    await userRef.set({
                        ...userData,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastActiveAt: firebase.firestore.FieldValue.serverTimestamp(),
                        profile: {
                            displayName: userData.displayName || 'User',
                            email: userData.email,
                            photoURL: userData.photoURL || null,
                            preferences: {
                                darkMode: true,
                                notifications: true,
                                language: 'th'
                            }
                        }
                    });
                    
                    // Initialize user collections
                    await this.initializeUserCollections(userData.uid);
                } else {
                    // Update last active timestamp
                    await userRef.update({
                        lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                console.log('User data initialized successfully');
            } catch (error) {
                console.error('Error initializing user data:', error);
                throw error;
            }
        },
        
        // Initialize user collections
        async initializeUserCollections(userId) {
            if (!window.db) return;
            
            const collections = [
                { name: 'journal', data: { initialized: true } },
                { name: 'moodTracking', data: { initialized: true } },
                { name: 'assessments', data: { initialized: true } },
                { name: 'growthTree', data: { 
                    level: 1, 
                    progress: 0, 
                    points: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }},
                { name: 'achievements', data: { initialized: true } }
            ];
            
            for (const collection of collections) {
                await window.db
                    .collection('users')
                    .doc(userId)
                    .collection(collection.name)
                    .doc('init')
                    .set({
                        ...collection.data,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }
        },
        
        // Save journal entry to Firestore
        async saveJournalEntry(entry) {
            if (!window.db) {
                // Fallback to localStorage
                return this.saveJournalEntryLocal(entry);
            }
            
            try {
                const userId = this.user?.uid || this.getGuestUserId();
                if (!userId) throw new Error('User not authenticated');
                
                const journalRef = window.db
                    .collection('users')
                    .doc(userId)
                    .collection('journal')
                    .doc(entry.id);
                
                await journalRef.set({
                    ...entry,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update growth tree points
                await this.updateGrowthTreePoints(10);
                
                console.log('Journal entry saved successfully');
                return true;
            } catch (error) {
                console.error('Error saving journal entry:', error);
                // Fallback to localStorage
                return this.saveJournalEntryLocal(entry);
            }
        },
        
        // Save mood tracking to Firestore
        async saveMoodTracking(moodData) {
            if (!window.db) {
                return this.saveMoodTrackingLocal(moodData);
            }
            
            try {
                const userId = this.user?.uid || this.getGuestUserId();
                if (!userId) throw new Error('User not authenticated');
                
                const moodRef = window.db
                    .collection('users')
                    .doc(userId)
                    .collection('moodTracking')
                    .doc(moodData.id);
                
                await moodRef.set({
                    ...moodData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update growth tree points
                await this.updateGrowthTreePoints(5);
                
                console.log('Mood tracking saved successfully');
                return true;
            } catch (error) {
                console.error('Error saving mood tracking:', error);
                return this.saveMoodTrackingLocal(moodData);
            }
        },
        
        // Save assessment result to Firestore
        async saveAssessmentResult(assessment) {
            if (!window.db) {
                return this.saveAssessmentResultLocal(assessment);
            }
            
            try {
                const userId = this.user?.uid || this.getGuestUserId();
                if (!userId) throw new Error('User not authenticated');
                
                const assessmentRef = window.db
                    .collection('users')
                    .doc(userId)
                    .collection('assessments')
                    .doc(assessment.id);
                
                await assessmentRef.set({
                    ...assessment,
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update growth tree points
                await this.updateGrowthTreePoints(15);
                
                console.log('Assessment result saved successfully');
                return true;
            } catch (error) {
                console.error('Error saving assessment result:', error);
                return this.saveAssessmentResultLocal(assessment);
            }
        },
        
        // Update growth tree points and level
        async updateGrowthTreePoints(points) {
            if (!window.db) {
                return this.updateGrowthTreePointsLocal(points);
            }
            
            try {
                const userId = this.user?.uid || this.getGuestUserId();
                if (!userId) return;
                
                const treeRef = window.db
                    .collection('users')
                    .doc(userId)
                    .collection('growthTree')
                    .doc('main');
                
                const treeDoc = await treeRef.get();
                let currentData = { level: 1, progress: 0, points: 0 };
                
                if (treeDoc.exists) {
                    currentData = treeDoc.data();
                }
                
                // Update points and calculate new level
                const newPoints = currentData.points + points;
                const newLevel = Math.floor(newPoints / 100) + 1;
                const newProgress = (newPoints % 100);
                
                await treeRef.set({
                    ...currentData,
                    points: newPoints,
                    level: newLevel,
                    progress: newProgress,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update local tree data
                this.tree = {
                    ...this.tree,
                    points: newPoints,
                    level: newLevel,
                    progress: newProgress
                };
                
                // Check for level up
                if (newLevel > currentData.level) {
                    this.showLevelUpNotification(newLevel);
                }
                
            } catch (error) {
                console.error('Error updating growth tree:', error);
                this.updateGrowthTreePointsLocal(points);
            }
        },
        
        // Load user data from Firestore
        async loadUserData() {
            if (!window.db) {
                return this.loadUserDataLocal();
            }
            
            try {
                const userId = this.user?.uid || this.getGuestUserId();
                if (!userId) return;
                
                // Load journal entries
                const journalSnapshot = await window.db
                    .collection('users')
                    .doc(userId)
                    .collection('journal')
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                
                this.journalEntries = journalSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(entry => entry.id !== 'init');
                
                // Load growth tree data
                const treeDoc = await window.db
                    .collection('users')
                    .doc(userId)
                    .collection('growthTree')
                    .doc('main')
                    .get();
                
                if (treeDoc.exists) {
                    this.tree = { ...this.tree, ...treeDoc.data() };
                }
                
                console.log('User data loaded successfully');
            } catch (error) {
                console.error('Error loading user data:', error);
                this.loadUserDataLocal();
            }
        },
        
        // Get guest user ID
        getGuestUserId() {
            if (this.isGuest) {
                const guestData = localStorage.getItem('guestData');
                if (guestData) {
                    return JSON.parse(guestData).uid;
                }
            }
            return null;
        },
        
        // Show level up notification
        showLevelUpNotification(newLevel) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: '🎉 ยินดีด้วย! Level Up!',
                    text: `ต้นไม้ของคุณเจริญเติบโตเป็นระดับ ${newLevel} แล้ว!`,
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        },
        
        // ============================================
        // LOCAL STORAGE FALLBACKS
        // ============================================
        
        // Save journal entry to localStorage
        saveJournalEntryLocal(entry) {
            try {
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                entries.unshift(entry);
                localStorage.setItem('journalEntries', JSON.stringify(entries));
                return true;
            } catch (error) {
                console.error('Error saving journal entry locally:', error);
                return false;
            }
        },
        
        // Save mood tracking to localStorage
        saveMoodTrackingLocal(moodData) {
            try {
                const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
                moods.unshift(moodData);
                localStorage.setItem('moodHistory', JSON.stringify(moods));
                return true;
            } catch (error) {
                console.error('Error saving mood tracking locally:', error);
                return false;
            }
        },
        
        // Save assessment result to localStorage
        saveAssessmentResultLocal(assessment) {
            try {
                const results = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
                results.unshift(assessment);
                localStorage.setItem('assessmentResults', JSON.stringify(results));
                return true;
            } catch (error) {
                console.error('Error saving assessment result locally:', error);
                return false;
            }
        },
        
        // Update growth tree points locally
        updateGrowthTreePointsLocal(points) {
            try {
                this.tree.points += points;
                this.tree.level = Math.floor(this.tree.points / 100) + 1;
                this.tree.progress = (this.tree.points % 100);
                localStorage.setItem('growthTree', JSON.stringify(this.tree));
            } catch (error) {
                console.error('Error updating growth tree locally:', error);
            }
        },
        
        // Load user data from localStorage
        loadUserDataLocal() {
            try {
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                this.journalEntries = entries;
                
                const treeData = JSON.parse(localStorage.getItem('growthTree') || '{}');
                if (treeData.points) {
                    this.tree = { ...this.tree, ...treeData };
                }
            } catch (error) {
                console.error('Error loading user data locally:', error);
            }
        },
        
        // ============================================
        // INITIALIZATION
        // ============================================
        
        // Initialize app
        async init() {
            try {
                // Check authentication state
                await this.checkAuthState();
                
                // Load user data if authenticated
                if (this.isAuthenticated) {
                    await this.loadUserData();
                }
                
                // Initialize UI
                this.initializeUI();
                
            } catch (error) {
                console.error('Error initializing app:', error);
                this.error = 'เกิดข้อผิดพลาดในการเริ่มต้นแอปพลิเคชัน';
            }
        },
        
        // Check authentication state
        async checkAuthState() {
            return new Promise((resolve) => {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        this.user = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || 'User',
                            photoURL: user.photoURL
                        };
                        this.isAuthenticated = true;
                        this.isGuest = false;
                        
                        // Initialize user data in Firestore
                        await this.initializeUserData(this.user);
                    } else {
                        // Check if guest mode
                        if (this.isGuestLoggedIn()) {
                            this.isGuest = true;
                            this.isAuthenticated = true;
                            const guestData = JSON.parse(localStorage.getItem('guestData'));
                            this.user = guestData;
                        } else {
                            this.user = null;
                            this.isAuthenticated = false;
                            this.isGuest = false;
                        }
                    }
                    
                    unsubscribe();
                    resolve();
                });
            });
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
            
            if (daysDiff > 7) { // 7 days expiry
                this.clearGuestData();
                return false;
            }
            
            return true;
        },
        
        // Initialize UI
        initializeUI() {
            // Load dark mode preference
            this.darkMode = localStorage.getItem('darkMode') === 'true' || 
                          localStorage.getItem('darkMode') === null;
            
            // Apply dark mode
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        
        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        
        // Toggle dark mode
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode.toString());
            
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        
        // Get user display name
        userDisplayName: {
            get() {
                if (this.user) {
                    return this.user.displayName || this.user.email || 'User';
                }
                return 'Guest User';
            }
        },
        
        // Get user authentication info
        getUserAuthInfo() {
            if (this.isGuest) {
                return 'Guest Mode';
            }
            return this.user?.email || 'Not logged in';
        },
        
        // Navigate to page
        navigateTo(page) {
            this.currentPage = page;
            
            // Update URL hash for navigation
            if (page !== 'home') {
                window.location.hash = page;
            } else {
                window.location.hash = '';
            }
            
            // Close mobile menu
            this.mobileMenuOpen = false;
        },
        
        // Clear guest data
        clearGuestData() {
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guestData');
            localStorage.removeItem('guestLoginTime');
            this.isGuest = false;
            this.user = null;
            this.isAuthenticated = false;
        },
        
        // Logout
        async logout() {
            try {
                if (this.isGuest) {
                    this.clearGuestData();
                } else {
                    await auth.signOut();
                }
                
                // Redirect to login page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error during logout:', error);
                this.error = 'เกิดข้อผิดพลาดในการออกจากระบบ';
            }
        }
    }));
});
