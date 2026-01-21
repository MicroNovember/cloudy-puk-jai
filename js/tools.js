// Breathing Buddy Application - Complete
document.addEventListener('alpine:init', () => {
    // Store for shared state
    Alpine.store('breathing', {
        cycleCount: 0,
        sessionCount: 0,
        totalMinutes: 0,
        dailyProgress: 0,
        lastSessionDate: null
    });
    
    // Main application
    Alpine.data('breathingApp', () => ({
        // Core State
        isRunning: false,
        currentState: 'inhale',
        currentTime: 4,
        totalTime: '0:00',
        guidanceText: 'พร้อมเริ่มฝึกหายใจ 4-7-8',
        totalSeconds: 0,
        
        // User Type Detection
        get isGuestUser() {
            return !this.currentUser || this.currentUser.isAnonymous;
        },
        
        get isLoggedInUser() {
            return this.currentUser && !this.currentUser.isAnonymous;
        },
        
        get currentUser() {
            // Get current Firebase user
            return firebase.auth().currentUser;
        },
        
        // Storage Keys
        get storageKey() {
            return this.isGuestUser ? 'guestBreathingData' : null;
        },
        
        // Data Management
        get breathingData() {
            if (this.isGuestUser) {
                // Get from localStorage for guest
                const data = localStorage.getItem('guestBreathingData');
                return data ? JSON.parse(data) : this.getDefaultData();
            } else {
                // Get from Firebase store for logged in users
                return Alpine.store('breathing');
            }
        },
        
        set breathingData(data) {
            if (this.isGuestUser) {
                // Save to localStorage for guest
                localStorage.setItem('guestBreathingData', JSON.stringify(data));
            } else {
                // Update Firebase store for logged in users
                Object.assign(Alpine.store('breathing'), data);
                // Also save to Firestore
                this.saveToFirebase(data);
            }
        },
        
        getDefaultData() {
            return {
                cycleCount: 0,
                sessionCount: 0,
                totalMinutes: 0,
                dailyProgress: 0,
                lastSessionDate: null,
                totalSeconds: 0,
                totalTime: '0:00'
            };
        },
        
        // Firebase save function
        async saveToFirebase(data) {
            if (this.isLoggedInUser && this.currentUser) {
                try {
                    const db = firebase.firestore();
                    await db.collection('users').doc(this.currentUser.uid).set({
                        breathingData: data,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch (error) {
                    console.error('Error saving to Firebase:', error);
                }
            }
        },
        
        // Load from Firebase
        async loadFromFirebase() {
            if (this.isLoggedInUser && this.currentUser) {
                try {
                    const db = firebase.firestore();
                    const doc = await db.collection('users').doc(this.currentUser.uid).get();
                    if (doc.exists && doc.data().breathingData) {
                        const data = doc.data().breathingData;
                        Object.assign(Alpine.store('breathing'), data);
                        return data;
                    }
                } catch (error) {
                    console.error('Error loading from Firebase:', error);
                }
            }
            return null;
        },
        
        // Migrate guest data to Firebase when user logs in
        async migrateGuestDataToFirebase() {
            if (this.isLoggedInUser) {
                try {
                    // Check if user has existing Firebase data
                    const existingData = await this.loadFromFirebase();
                    
                    // Get guest data from localStorage
                    const guestData = localStorage.getItem('guestBreathingData');
                    
                    if (guestData) {
                        const parsedGuestData = JSON.parse(guestData);
                        
                        // Merge data - prioritize Firebase data if exists, otherwise use guest data
                        let mergedData;
                        if (existingData) {
                            // Merge with existing Firebase data (take higher values)
                            mergedData = {
                                cycleCount: Math.max(existingData.cycleCount || 0, parsedGuestData.cycleCount || 0),
                                sessionCount: Math.max(existingData.sessionCount || 0, parsedGuestData.sessionCount || 0),
                                totalMinutes: Math.max(existingData.totalMinutes || 0, parsedGuestData.totalMinutes || 0),
                                dailyProgress: Math.max(existingData.dailyProgress || 0, parsedGuestData.dailyProgress || 0),
                                totalSeconds: Math.max(existingData.totalSeconds || 0, parsedGuestData.totalSeconds || 0),
                                lastSessionDate: existingData.lastSessionDate || parsedGuestData.lastSessionDate,
                                lastUpdated: new Date().toISOString()
                            };
                        } else {
                            // No existing data, use guest data
                            mergedData = {
                                ...parsedGuestData,
                                lastUpdated: new Date().toISOString()
                            };
                        }
                        
                        // Save merged data to Firebase
                        await this.saveToFirebase(mergedData);
                        
                        // Update local store with merged data
                        Object.assign(Alpine.store('breathing'), mergedData);
                        
                        // Clear guest data after successful migration
                        localStorage.removeItem('guestBreathingData');
                        
                        console.log('Guest data migrated to Firebase successfully');
                        this.showNotification('success', '🎉 ยินดีต้อนรับ!', 'ข้อมูลการฝึกหายใจของคุณถูกโอนย้ายเรียบร้อย', 'fas fa-check-circle');
                        
                        return true;
                    }
                } catch (error) {
                    console.error('Error migrating guest data:', error);
                    this.showNotification('error', '❌ ข้อผิดพลาด', 'ไม่สามารถโอนย้ายข้อมูลได้', 'fas fa-exclamation-triangle');
                }
            }
            return false;
        },
        
        // Listen for auth state changes
        initAuthListener() {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user && !user.isAnonymous) {
                    // User just logged in with email
                    console.log('User logged in:', user.email);
                    
                    // Migrate guest data if exists
                    await this.migrateGuestDataToFirebase();
                    
                    // Reload data from Firebase
                    await this.loadProgress();
                } else if (user && user.isAnonymous) {
                    // User is guest
                    console.log('Guest user detected');
                    await this.loadProgress();
                } else {
                    // User logged out
                    console.log('User logged out');
                    await this.loadProgress();
                }
            });
        },
        
        // UI State
        mobileMenuOpen: false,
        showModal: false,
        modalTitle: '',
        modalContent: '',
        notifications: [],
        guidanceExpanded: false,
        scheduleExpanded: false,
        
        // Computed Properties
        get currentStateText() {
            const states = {
                'inhale': 'หายใจเข้า',
                'hold': 'กลั้นหายใจ',
                'exhale': 'หายใจออก',
                'ready': 'พร้อมเริ่ม'
            };
            return states[this.currentState];
        },
        
        get sessionCount() {
            return this.$store.breathing.sessionCount;
        },
        
        get totalMinutes() {
            return Math.floor(this.totalSeconds / 60);
        },
        
        get dailyProgress() {
            return this.$store.breathing.dailyProgress;
        },
        
        get cycleCount() {
            return this.$store.breathing.cycleCount;
        },
        
        // Methods
        init() {
            // Initialize auth listener for guest to Firebase migration
            this.initAuthListener();
            
            // โหลดข้อมูลการฝึกหายใจ
            this.loadBreathingData();
            
            // ตรวจสอบ session ปัจจุบัน
            this.checkCurrentSession();
            
            // ตั้งค่าเวลา
            this.updateTime();
            setInterval(() => this.updateTime(), 1000);
            
            // ตั้งค่า progress รายวัน
            this.updateDailyProgress();
        },
        
        loadBreathingData() {
            this.loadProgress();
        },
        
        checkCurrentSession() {
            // ตรวจสอบ session ปัจจุบัน - สำหรับ breathing app
            const lastSession = this.$store.breathing.lastSessionDate;
            if (lastSession) {
                const lastDate = new Date(lastSession);
                const today = new Date();
                
                // ถ้าไม่ใช่วันเดียวกัน ให้ reset daily progress
                if (lastDate.getDate() !== today.getDate() || 
                    lastDate.getMonth() !== today.getMonth() || 
                    lastDate.getFullYear() !== today.getFullYear()) {
                    this.$store.breathing.dailyProgress = 0;
                }
            }
        },
        
        updateTime() {
            const now = new Date();
            this.totalTime = this.formatTime(this.totalSeconds);
        },
        
        updateDailyProgress() {
            // อัปเดต progress รายวัน - มีการคำนวณใน loadProgress แล้ว
            this.saveProgress();
        },
        
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },
        
        async loadProgress() {
            try {
                let data;
                
                if (this.isGuestUser) {
                    // Load from localStorage for guest users
                    const saved = localStorage.getItem('guestBreathingData');
                    if (saved) {
                        data = JSON.parse(saved);
                    }
                } else {
                    // Load from Firebase for logged in users
                    await this.loadFromFirebase();
                    data = this.$store.breathing;
                }
                
                if (data) {
                    this.$store.breathing.cycleCount = data.cycleCount || 0;
                    this.$store.breathing.dailyProgress = data.dailyProgress || 0;
                    this.totalSeconds = data.totalSeconds || 0;
                    this.$store.breathing.sessionCount = data.sessionCount || 0;
                    this.$store.breathing.lastSessionDate = data.lastSessionDate;
                    
                    // Restore current state and time if session was interrupted
                    if (data.currentState && data.currentTime) {
                        this.currentState = data.currentState;
                        this.currentTime = data.currentTime;
                    }
                    
                    this.updateTotalTimeDisplay();
                    this.checkDailyReset();
                }
            } catch (error) {
                console.error('Error loading progress:', error);
                this.resetProgress();
            }
        },
        
        saveProgress() {
            const data = {
                cycleCount: this.cycleCount,
                dailyProgress: this.dailyProgress,
                totalSeconds: this.totalSeconds,
                sessionCount: this.sessionCount,
                lastSessionDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                // Save current state for resume functionality
                currentState: this.currentState,
                currentTime: this.currentTime
            };
            
            if (this.isGuestUser) {
                // Save to localStorage for guest users
                localStorage.setItem('guestBreathingData', JSON.stringify(data));
            } else {
                // Save to Firebase for logged in users
                this.saveToFirebase(data);
                // Also update local store for immediate UI updates
                Object.assign(Alpine.store('breathing'), data);
            }
        },
        
        resetProgress() {
            this.$store.breathing.cycleCount = 0;
            this.$store.breathing.dailyProgress = 0;
            this.totalSeconds = 0;
            this.totalTime = '0:00';
            this.saveProgress();
        },
        
        checkDailyReset() {
            const lastDate = this.$store.breathing.lastSessionDate;
            if (!lastDate) return;
            
            const last = new Date(lastDate);
            const today = new Date();
            
            if (last.getDate() !== today.getDate() || 
                last.getMonth() !== today.getMonth() || 
                last.getFullYear() !== today.getFullYear()) {
                this.$store.breathing.dailyProgress = 0;
                this.saveProgress();
            }
        },
        
        startBreathing() {
            if (this.isRunning) return;
            
            // Check if we're resuming from pause (not starting fresh)
            const isResuming = this.currentState !== 'inhale' || this.currentTime !== 4;
            
            this.isRunning = true;
            
            if (!isResuming) {
                // Starting fresh session
                this.currentState = 'inhale';
                this.currentTime = 4;
                this.$store.breathing.sessionCount++;
                this.guidanceText = 'เริ่มหายใจเข้า... นับ 1-4';
                
                // First session notification
                if (this.sessionCount === 1) {
                    this.showNotification('success', '🎉 ยินดีต้อนรับ!', 'นี่คือการฝึกหายใจครั้งแรกของคุณ ทำได้ดีที่สุดนะ!', 'fas fa-heart');
                }
            } else {
                // Resuming from pause - set correct target time for current state
                if (this.currentState === 'inhale') {
                    this.currentTime = 4;
                } else if (this.currentState === 'hold') {
                    this.currentTime = 7;
                } else if (this.currentState === 'exhale') {
                    this.currentTime = 8;
                }
                this.guidanceText = 'ทำต่อ... ' + this.currentStateText;
                this.showNotification('success', '▶️ ทำต่อ', 'กลับมาฝึกหายใจต่อจากที่ค้างไว้', 'fas fa-play');
            }
            
            this.startTimer();
            this.startTotalTimer();
            this.saveProgress();
        },
        
        startTimer() {
            if (this.timer) clearInterval(this.timer);
            
            this.timer = setInterval(() => {
                this.currentTime--;
                
                // Update guidance text
                if (this.currentTime === 3 && this.currentState === 'inhale') {
                    this.guidanceText = 'หายใจเข้า... นับ 1-4';
                } else if (this.currentTime === 2 && this.currentState === 'hold') {
                    this.guidanceText = 'กลั้นหายใจ... นับ 1-7';
                } else if (this.currentTime === 2 && this.currentState === 'exhale') {
                    this.guidanceText = 'หายใจออก... นับ 1-8';
                } else if (this.currentTime === 0) {
                    this.nextState();
                }
            }, 1000);
        },
        
        nextState() {
            if (this.currentState === 'inhale') {
                this.currentState = 'hold';
                this.currentTime = 7;
                this.guidanceText = 'กลั้นหายใจ... นับ 1-7';
                
            } else if (this.currentState === 'hold') {
                this.currentState = 'exhale';
                this.currentTime = 8;
                this.guidanceText = 'หายใจออก... นับ 1-8';
                
            } else if (this.currentState === 'exhale') {
                // Complete cycle
                this.$store.breathing.cycleCount++;
                this.$store.breathing.dailyProgress++;
                
                // Check if should take break (every 3 cycles)
                if (this.cycleCount % 3 === 0 && this.cycleCount > 0) {
                    // Start break automatically
                    this.isRunning = false;
                    clearInterval(this.timer);
                    clearInterval(this.totalTimer);
                    
                    this.currentState = 'break';
                    this.currentTime = 2;
                    this.guidanceText = 'พัก 2 วินาที';
                    
                    // Start break countdown
                    this.breakTimer = setInterval(() => {
                        this.currentTime--;
                        if (this.currentTime <= 0) {
                            clearInterval(this.breakTimer);
                            // Break finished, start breathing again
                            this.breakTimer = null;
                            this.isRunning = true;
                            this.currentState = 'inhale';
                            this.currentTime = 4;
                            this.guidanceText = 'เริ่มรอบใหม่... หายใจเข้า';
                            
                            this.startTimer();
                            this.startTotalTimer();
                        }
                    }, 1000);
                    
                    this.showNotification('info', '☕ พัก 2 วินาที', 'กำลังพักสั้นๆ ก่อนเริ่มใหม่', 'fas fa-coffee');
                } else {
                    // Continue with next cycle
                    this.currentState = 'inhale';
                    this.currentTime = 4;
                    this.guidanceText = 'เริ่มรอบใหม่... หายใจเข้า';
                }
                
                // Update achievements
                this.checkAchievements();
                
                // Show encouragement
                if (this.cycleCount % 3 === 0 && this.cycleCount > 0) {
                    this.showEncouragement();
                }
                
                // Check daily goal
                if (this.dailyProgress >= 5) {
                    this.showNotification('success', '🎯 เป้าหมายรายวันสำเร็จ!', 'คุณฝึกครบ 5 รอบแล้ว ทำได้ดีมาก!', 'fas fa-trophy');
                }
                
                this.saveProgress();
            }
        },
        
        pauseBreathing() {
            this.isRunning = false;
            clearInterval(this.timer);
            clearInterval(this.totalTimer);
            
            this.guidanceText = 'หยุดพักชั่วคราว - กดปุ่มเริ่มเพื่อทำต่อ';
            this.showNotification('info', '⏸️ หยุดพัก', 'คุณสามารถกดปุ่มเริ่มเพื่อทำต่อจากจุดนี้', 'fas fa-pause');
        },
        
        resetBreathing() {
            this.pauseBreathing();
            this.currentState = 'inhale';
            this.currentTime = 4;
            this.guidanceText = 'พร้อมเริ่มฝึกใหม่';
            
            // Clear saved state to start fresh
            this.saveProgress();
            
            this.showNotification('info', '🔄 เริ่มใหม่', 'พร้อมเริ่มฝึกหายใจใหม่', 'fas fa-redo');
        },
        
        takeBreak() {
            if (!this.isRunning) return;
            
            // หยุดการทำงานชั่วคราว
            this.isRunning = false;
            clearInterval(this.timer);
            clearInterval(this.totalTimer);
            
            // เปลี่ยนสถานะเป็นพัก
            this.currentState = 'break';
            this.currentTime = 2;
            this.guidanceText = 'พัก 2 วินาที';
            
            // เริ่มนับถอยหลัง 2 วินาที
            this.breakTimer = setInterval(() => {
                this.currentTime--;
                if (this.currentTime <= 0) {
                    clearInterval(this.breakTimer);
                    // พักเสร็จ กลับไปเริ่มหายใจใหม่
                    this.startBreathing();
                }
            }, 1000);
            
            this.showNotification('info', '☕ พัก 2 วินาที', 'กำลังพักสั้นๆ ก่อนเริ่มใหม่', 'fas fa-coffee');
        },
        
        startTotalTimer() {
            if (this.totalTimer) clearInterval(this.totalTimer);
            
            this.totalTimer = setInterval(() => {
                if (this.isRunning) {
                    this.totalSeconds++;
                    this.updateTotalTimeDisplay();
                }
            }, 1000);
        },
        
        updateTotalTimeDisplay() {
            const minutes = Math.floor(this.totalSeconds / 60);
            const seconds = this.totalSeconds % 60;
            this.totalTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.$store.breathing.totalMinutes = minutes;
        },
        
        showInstruction(state) {
            const instructions = {
                'inhale': {
                    title: 'หายใจเข้า (4 วินาที)',
                    content: `
                        <div class="space-y-4">
                            <div class="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                                <p class="font-semibold text-primary-600 dark:text-primary-400 mb-2">💡 วิธีปฏิบัติที่ถูกต้อง:</p>
                                <ol class="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>นั่งหลังตรงในท่าที่สบาย</li>
                                    <li>วางมือบนท้องเพื่อรับรู้การขยายตัว</li>
                                    <li>หายใจเข้าทางจมูกช้าๆ ลึกๆ</li>
                                    <li>นับในใจ 1-2-3-4 ให้สอดคล้องกับลมหายใจ</li>
                                    <li>รู้สึกท้องขยายเหมือนลูกโป่ง</li>
                                    <li>ผ่อนคลายไหล่และหน้าอก ไม่เกร็ง</li>
                                </ol>
                            </div>
                            <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <p class="font-semibold text-blue-600 dark:text-blue-400">🔬 วิทยาศาสตร์:</p>
                                <p class="text-gray-700 dark:text-gray-300">การหายใจเข้าลึกช่วยเพิ่มออกซิเจนในเลือด กระตุ้นสมองส่วน prefrontal cortex ซึ่งควบคุมสมาธิและอารมณ์</p>
                            </div>
                        </div>
                    `
                },
                'hold': {
                    title: 'กลั้นหายใจ (7 วินาที)',
                    content: `
                        <div class="space-y-4">
                            <div class="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10">
                                <p class="font-semibold text-accent-600 dark:text-accent-400 mb-2">💡 วิธีปฏิบัติที่ถูกต้อง:</p>
                                <ol class="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>กลั้นลมหายใจไว้อย่างสงบ อย่าหักโหม</li>
                                    <li>นับในใจ 1-2-3-4-5-6-7 อย่างสม่ำเสมอ</li>
                                    <li>รักษาท่าทางให้สงบนิ่ง</li>
                                    <li>รับรู้ถึงความเงียบภายในร่างกาย</li>
                                    <li>ผ่อนคลายกล้ามเนื้อทุกส่วนโดยเฉพาะใบหน้า</li>
                                    <li>หากรู้สึกอยากหายใจให้ค่อยๆ ผ่อนลมออก</li>
                                </ol>
                            </div>
                            <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <p class="font-semibold text-blue-600 dark:text-blue-400">🔬 วิทยาศาสตร์:</p>
                                <p class="text-gray-700 dark:text-gray-300">การกลั้นหายใจช่วยกระตุ้นระบบประสาทพาราซิมพาเทติก ลดความดันโลหิตและอัตราการเต้นของหัวใจ ส่งผลให้ร่างกายเข้าสู่โหมดผ่อนคลาย</p>
                            </div>
                        </div>
                    `
                },
                'exhale': {
                    title: 'หายใจออก (8 วินาที)',
                    content: `
                        <div class="space-y-4">
                            <div class="p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                                <p class="font-semibold text-gray-600 dark:text-gray-400 mb-2">💡 วิธีปฏิบัติที่ถูกต้อง:</p>
                                <ol class="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>ผ่อนลมหายใจทางปากช้าๆ</li>
                                    <li>นับในใจ 1-2-3-4-5-6-7-8</li>
                                    <li>ทำปากเป็นรูปตัว "O" เพื่อควบคุมลมหายใจ</li>
                                    <li>รู้สึกท้องยุบลงอย่างช้าๆ</li>
                                    <li>ปล่อยความตึงเครียดออกไปพร้อมลมหายใจ</li>
                                    <li>รู้สึกถึงความโล่งสบายในร่างกาย</li>
                                </ol>
                            </div>
                            <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <p class="font-semibold text-blue-600 dark:text-blue-400">🔬 วิทยาศาสตร์:</p>
                                <p class="text-gray-700 dark:text-gray-300">การหายใจออกยาวช่วยขจัดคาร์บอนไดออกไซด์ ลดระดับคอร์ติซอล (ฮอร์โมนความเครียด) และกระตุ้นการทำงานของระบบภูมิคุ้มกัน</p>
                            </div>
                        </div>
                    `
                }
            };
            
            const instruction = instructions[state];
            if (instruction) {
                this.modalTitle = instruction.title;
                this.modalContent = instruction.content;
                this.showModal = true;
            }
        },
        
        showNotification(type, title, message, icon = 'fas fa-info-circle') {
            const notification = {
                id: Date.now() + Math.random(),
                type: type,
                title: title,
                message: message,
                icon: icon,
                timestamp: new Date()
            };
            
            this.notifications.push(notification);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, 5000);
        },
        
        removeNotification(id) {
            this.notifications = this.notifications.filter(n => n.id !== id);
        },
        
        checkAchievements() {
            // Unlock achievements based on cycles
            if (this.cycleCount === 5) {
                this.showNotification('success', '🌟 5 รอบสำเร็จ!', 'คุณกำลังสร้างนิสัยที่ดีต่อสุขภาพแล้ว', 'fas fa-star');
            }
            if (this.cycleCount === 20) {
                this.showNotification('success', '🏆 เจ๋งมาก! 20 รอบ', 'คุณฝึกหายใจครบ 20 รอบแล้ว สุดยอด!', 'fas fa-trophy');
            }
            if (this.cycleCount === 50) {
                this.showNotification('success', '👑 เซียนการหายใจ!', '50 รอบสำเร็จ! คุณคือปรมาจารย์แห่งการหายใจ', 'fas fa-crown');
            }
        },
        
        showEncouragement() {
            const encouragements = [
                'ยอดเยี่ยม! การวิจัยพบว่าการฝึกสม่ำเสมอช่วยลดความเครียดได้ 67% 🌟',
                'เก่งมาก! การหายใจลึกช่วยเพิ่มออกซิเจนสู่สมอง ทำให้คิดได้ไวขึ้น 🧠',
                'ดีมากเลย! การฝึกหายใจช่วยกระตุ้นระบบประสาทพาราซิมพาเทติก 💚',
                'สุดยอด! การหายใจลึกช่วยลดความดันโลหิตและอัตราการเต้นของหัวใจ ❤️',
                'ทำได้ดี! การฝึกหายใจช่วยเพิ่มประสิทธิภาพการนอนหลับ 🌙',
                'น่าประทับใจ! คุณกำลังพัฒนาความยืดหยุ่นของระบบประสาท 🧘'
            ];
            
            const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
            this.showNotification('info', 'กำลังไปได้สวย!', randomMsg, 'fas fa-heart');
        },
        
        // Toggle guidance card
        toggleGuidance() {
            this.guidanceExpanded = !this.guidanceExpanded;
            localStorage.setItem('guidanceExpanded', this.guidanceExpanded);
        },
        
        // Confirm reset progress
        confirmResetProgress() {
            this.modalTitle = '🔄 รีเซ็ตข้อมูลการฝึกหายใจ';
            this.modalContent = `
                <div class="space-y-4">
                    <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <h4 class="text-lg font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <i class="fas fa-exclamation-triangle"></i>
                            ข้อมูลที่จะถูกล้าง
                        </h4>
                        <div class="space-y-2 text-sm text-red-600 dark:text-red-400">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-chart-line w-4"></i>
                                <span>รอบที่ทำทั้งหมด: <strong x-text="sessionCount"></strong> รอบ</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-clock w-4"></i>
                                <span>เวลาทั้งหมด: <strong x-text="totalTime"></strong></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-calendar-day w-4"></i>
                                <span>รอบวันนี้: <strong x-text="dailyProgress"></strong> รอบ</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <p class="text-sm text-amber-700 dark:text-amber-300">
                            <i class="fas fa-info-circle mr-2"></i>
                            การดำเนินการนี้ไม่สามารถกู้นได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                        </p>
                    </div>
                </div>
            `;
            this.showModal = true;
        },
        
        // Reset all progress
        resetAllProgress() {
            console.log('Resetting all progress...');
            
            // Clear all breathing data
            this.$store.breathing.cycleCount = 0;
            this.$store.breathing.dailyProgress = 0;
            this.totalSeconds = 0;
            this.totalTime = '0:00';
            this.$store.breathing.sessionCount = 0;
            this.$store.breathing.lastSessionDate = null;
            
            // Reset current state
            this.currentState = 'inhale';
            this.currentTime = 4;
            this.guidanceText = 'พร้อมเริ่มฝึกใหม่';
            this.isRunning = false;
            
            // Clear all timers
            if (this.timer) clearInterval(this.timer);
            if (this.totalTimer) clearInterval(this.totalTimer);
            if (this.breakTimer) clearInterval(this.breakTimer);
            
            // Clear storage based on user type
            if (this.isGuestUser) {
                // Clear localStorage for guest users
                localStorage.removeItem('guestBreathingData');
            } else {
                // Clear Firebase data for logged in users
                this.saveToFirebase(this.getDefaultData());
            }
            
            // Show notification
            this.showNotification('success', '🔄 รีเซ็ตสำเร็จ', 'ข้อมูลการฝึกหายใจทั้งหมดถูกล้างแล้ว', 'fas fa-check-circle');
            
            console.log('Reset completed successfully');
        }
    }));
});
