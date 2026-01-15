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
        
        // UI State
        mobileMenuOpen: false,
        showModal: false,
        modalTitle: '',
        modalContent: '',
        notifications: [],
        guidanceExpanded: false,
        
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
        
        loadProgress() {
            try {
                const saved = localStorage.getItem('breathingProgress');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.$store.breathing.cycleCount = data.cycleCount || 0;
                    this.$store.breathing.dailyProgress = data.dailyProgress || 0;
                    this.totalSeconds = data.totalSeconds || 0;
                    this.$store.breathing.sessionCount = data.sessionCount || 0;
                    this.$store.breathing.lastSessionDate = data.lastSessionDate;
                    
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
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('breathingProgress', JSON.stringify(data));
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
            
            this.isRunning = true;
            this.currentState = 'inhale';
            this.currentTime = 4;
            this.$store.breathing.sessionCount++;
            this.guidanceText = 'เริ่มหายใจเข้า... นับ 1-4';
            
            // First session notification
            if (this.sessionCount === 1) {
                this.showNotification('success', '🎉 ยินดีต้อนรับ!', 'นี่คือการฝึกหายใจครั้งแรกของคุณ ทำได้ดีที่สุดนะ!', 'fas fa-heart');
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
                            this.startBreathing();
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
            
            this.guidanceText = 'หยุดพักชั่วคราว';
            this.showNotification('info', '⏸️ หยุดพัก', 'คุณสามารถเริ่มใหม่เมื่อพร้อม', 'fas fa-pause');
        },
        
        resetBreathing() {
            this.pauseBreathing();
            this.currentState = 'inhale';
            this.currentTime = 4;
            this.guidanceText = 'พร้อมเริ่มฝึกใหม่';
            
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
        }
    }));
});
