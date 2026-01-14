// MindBloom App - Alpine.js Component
// Cloudy-Puk-Jai Mental Health Application
// Version 2.0 - Organized Code Structure

document.addEventListener('alpine:init', () => {
    Alpine.data('mindbloomApp', () => ({
        // ============================================
        // APP STATE & CONFIGURATION
        // ============================================
        
        // Navigation State
        currentPage: 'home',
        mobileMenuOpen: false,
        
        // UI State
        darkMode: false,
        modalOpen: null,
        
        // Feature States
        assessmentTab: 'mental',
        musicTab: 'music',
        
        // Tips & Help States
        musicTipsOpen: false,
        articleTipsOpen: false,
        assessmentTipsOpen: true,
        journalTipsOpen: true,
        growthTipsOpen: false,
        
        // User Agreement
        agreedToTerms: false,
        
        // Active States
        selectedMood: null,
        activeEntryMenu: null,
        
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

        // Personal Growth Tracking
        personalGrowth: {
            moodHistory: [],
            moodStreak: 0,
            lastMoodDate: null,
            weeklyMoodStats: {},
            monthlyInsights: [],
            achievements: [],
            goals: [],
            journalConsistency: 0,
            assessmentProgress: {},
            growthMilestones: []
        },
        
        // Assessment Data
        assessmentHistory: [],
        resultAutoSaved: false,

        // Music Data
        currentTrack: {},
        audioPlaying: false,
        musicData: {
            music: [],
            podcasts: [],
            playlists: []
        },

        // Articles
        articlesData: [],
        currentArticle: {},

        // Assessments
        assessmentsData: [],
        currentQuiz: {
            id: '',
            title: '',
            desc: '',
            type: '', // เพิ่ม
            questions: [],
            results: [],
            timeNeeded: 0 // เพิ่ม
        },

        currentQuestionIndex: 0,
        quizAnswers: [],
        quizScore: 0,
        quizResult: {},

        // ============================================
        // STATIC DATA & CONFIGURATION
        // ============================================

        // Moods Configuration
        moods: [
            { id: 'happy', emoji: '😊', label: 'มีความสุข', color: '#FFF7D6' },
            { id: 'calm', emoji: '😌', label: 'สงบสุข', color: '#E6F4FF' },
            { id: 'sad', emoji: '😢', label: 'เศร้า', color: '#F0E6FF' },
            { id: 'anxious', emoji: '😰', label: 'กังวล', color: '#FFE6E6' },
            { id: 'energetic', emoji: '⚡', label: 'มีพลัง', color: '#E6FFE6' },
            { id: 'neutral', emoji: '😐', label: 'ปกติ', color: '#F5F5F5' }
        ],

        // Mood Responses
        moodResponses: {
            happy: {
                message: 'ยินดีด้วยที่คุณมีความสุข! ความสุขของคุณส่องแสงไปถึงใครบ้างมั้ยคะ',
                suggestion: 'ลองแชร์ความสุขนี้กับคนรอบข้าง หรือจดบันทึกไว้เพื่อความทรงจำที่ดี'
            },
            calm: {
                message: 'ความสงบเป็นของขวัญอันล้ำค่า ชื่นชมใจที่คุณรู้สึกสงบสุขใจ',
                suggestion: 'ลองหายใจลึกๆ และสัมผัสความสงบนี้ หรือทำกิจกรรมที่ทำให้ใจเย็น'
            },
            sad: {
                message: 'เข้าใจเลยค่ะ บางวันก็มีวันที่เศร้า อย่าลืมว่าคุณไม่ได้อยู่คนเดียวนะคะ',
                suggestion: 'ลองปล่อยวางหรือพูดคุยกับใครสักคน หรือทำกิจกรรมที่ชอบเพื่อผ่อนคลาย'
            },
            anxious: {
                message: 'ความกังวลเป็นเรื่องปกติ แต่อย่าลืมดูแลตัวเองด้วยนะคะ',
                suggestion: 'ลองหายใจเข้าลึกๆ 3 ครั้ง หรือทำกิจกรรมเบาๆ เช่นฟังเพลงผ่อนคลาย'
            },
            energetic: {
                message: 'พลังงานแบบนี้เยี่ยมเลย! จะนำพลังบวกนี้ไปทำอะไรดีคะ',
                suggestion: 'เหมาะกับการทำกิจกรรมใหม่ๆ หรือออกกำลังกายเพื่อรักษาพลังงานไว้'
            },
            neutral: {
                message: 'วันที่ปกติๆ ก็เป็นวันที่ดีนะคะ',
                suggestion: 'ลองหากิจกรรมเล็กๆ ที่ทำให้ยิ้มได้ หรือพักผ่อนให้ร่างกายสดชื่น'
            }
        },

        // Daily Quote
        dailyQuote: {
            text: "การเดินทางที่ยิ่งใหญ่ที่สุด เริ่มต้นจากก้าวเล็กๆ ก้าวแรกเสมอ",
            author: "ผู้ไม่ประสงค์ออกนาม"
        },

        // ============================================
        // NAVIGATION & ROUTING METHODS
        // ============================================
        
        // Navigation Methods
        navigateTo(page) {
            if (page === 'tools') {
                window.location.href = 'tools.html';
                return;
            }
            
            if (page === 'guide') {
                this.modalOpen = 'welcome';
                return;
            }

            this.currentPage = page;

            const url = page === 'home' ? '' : page;
            window.history.pushState({
                page: page
            }, '', `#${url}`);

            this.mobileMenuOpen = false;
        },

        navigateToFeature(feature) {
            this.navigateTo(feature.page);
        },
        
        // Router System
        routes: {
            '': 'home',
            'journal': 'journal',
            'music': 'music',
            'articles': 'articles',
            'assessments': 'assessments',
            'quiz': 'quiz',
            'results': 'results',
            'growth': 'growth'
        },

        initRouter() {
            window.addEventListener('popstate', (event) => {
                const hash = window.location.hash.substring(1);
                const page = this.routes[hash] || 'home';

                if (page !== this.currentPage) {
                    this.currentPage = page;
                }
            });

            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.substring(1);
                const page = this.routes[hash] || 'home';

                if (page !== this.currentPage) {
                    this.currentPage = page;
                }
            });

            const initialHash = window.location.hash.substring(1);
            if (this.routes[initialHash]) {
                this.currentPage = this.routes[initialHash];
            }
        },
        
        // ============================================
        // JOURNAL METHODS
        // ============================================
        
        // Journal Entry Management
        toggleEntryMenu(entryId) {
            this.activeEntryMenu = this.activeEntryMenu === entryId ? null : entryId;
        },

        getMoodLabel(moodId) {
            const mood = this.moods.find(m => m.id === moodId);
            return mood ? mood.label : 'ไม่ระบุ';
        },

        deleteJournalEntry(entryId) {
            this.activeEntryMenu = null;

            const entry = this.journalEntries.find(e => e.id === entryId);
            const date = entry ? this.formatDate(entry.date) : '';

            this.showConfirmModal(
                'ยืนยันการลบบันทึก',
                `คุณต้องการลบบันทึกวันที่ ${date} จริงหรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`,
                () => {
                    const index = this.journalEntries.findIndex(e => e.id === entryId);

                    if (index !== -1) {
                        this.journalEntries.splice(index, 1);
                        this.tree.points = Math.max(0, this.tree.points - 20);
                        this.tree.progress = Math.max(1, this.tree.progress - 1);
                        this.updateTreeAnimation();
                        this.saveData();
                        this.showNotification('ลบบันทึกเรียบร้อยแล้ว ✓', 'success');
                    }
                },
                () => {
                    this.showNotification('ยกเลิกการลบบันทึกแล้ว', 'info');
                }
            );
        },

        openEntryDetail(entry) {
            this.currentJournalEntry = entry;
            this.modalOpen = 'journalDetail';
        },

        currentJournalEntry: null,
        
        // ============================================
        // FEATURE CONFIGURATION
        // ============================================
        
        features: [{
            id: 1,
            icon: '📖',
            title: 'บันทึกความรู้สึก',
            description: 'บันทึกความรู้สึกและสิ่งดีๆ ในแต่ละวัน',
            page: 'journal'
        }, {
            id: 2,
            icon: '🎵',
            title: 'ผ่อนคลายด้วยเพลง',
            description: 'ฟังเพลงและพอดแคสต์เพื่อผ่อนคลาย',
            page: 'music'
        }, {
            id: 3,
            icon: '📚',
            title: 'ความรู้เพื่อสุขภาพจิต',
            description: 'บทความและเทคนิคดูแลสุขภาพจิต',
            page: 'articles'
        }, {
            id: 4,
            icon: '📝',
            title: 'แบบทดสอบ',
            description: 'ประเมินสุขภาพจิตและบุคลิกภาพ',
            page: 'assessments'
        }, {
            id: 5,
            icon: '🧘‍♀️',
            title: 'Breathing Buddy',
            description: 'ฝึกหายใจและสร้างสมาธิในเวลาสั้นๆ',
            page: 'tools'
        }, {
            id: 6,
            icon: '🌸',
            title: 'คำแนะนำใจ',
            description: 'อ่านคำแนะนำใจ อีกครั้ง',
            page: 'guide'
        }],

        badges: [{
            id: 1,
            icon: 'fas fa-seedling',
            earned: true
        }, {
            id: 2,
            icon: 'fas fa-heart',
            earned: false
        }, {
            id: 3,
            icon: 'fas fa-star',
            earned: false
        }, {
            id: 4,
            icon: 'fas fa-trophy',
            earned: false
        }, {
            id: 5,
            icon: 'fas fa-medal',
            earned: false
        }, {
            id: 6,
            icon: 'fas fa-crown',
            earned: false
        }],

        // ============================================
        // UTILITY METHODS
        // ============================================
        
        // Time-based greeting system
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
            
            return timeGreeting;
        },

        getMoodBasedGreeting(moodId) {
            const greetings = {
                happy: [
                    'ยินดีด้วยที่คุณมีความสุข! ความสุขของคุณส่องแสงไปถึงใครบ้างมั้ยคะ 🌟',
                    'ว้าว! ความสุขแบบนี้ต้องแชร์! วันนี้มีเรื่องดีๆ อะไรเกิดขึ้นบ้างคะ ✨',
                    'ความสุขของคุณคือพลังงานบวกที่ล้ำค่า! ขอให้มีความสุขต่อไปนะคะ 🌈'
                ],
                calm: [
                    'ความสงบเป็นของขวัญอันล้ำค่า ลองหายใจลึกๆ แล้วสัมผัสความสงบนี้นะคะ 🍃',
                    'ชื่นชมใจที่คุณรู้สึกสงบสุขใจ ความสงบแบบนี้ช่วยให้ใจเราแข็งแรงค่ะ 💚',
                    'วันที่สงบๆ แบบนี้คือวันที่ดีที่สุด ขอให้ความสงบคู่กับคุณเสมอนะคะ 🌿'
                ],
                sad: [
                    'เข้าใจเลยค่ะ บางวันก็มีวันที่เศร้า อย่าลืมว่าคุณไม่ได้อยู่คนเดียวนะคะ 🤗',
                    'ความรู้สึกเศร้าเป็นเรื่องปกติ อยากให้ลองปล่อยวางหรือพูดคุยกับใครสักคนดูไหมคะ 💕',
                    'ไม่เป็นไรค่ะ ทุกอารมณ์มีค่า ถ้าอยากระบาย เราพร้อมฟังเสมอนะคะ 🌸'
                ],
                anxious: [
                    'ลมหายใจคือเพื่อนที่ดีที่สุดตอนนี้ ลองหายใจเข้าลึกๆ 3 ครั้งดูไหมคะ 🌬️',
                    'ความกังวลเป็นเรื่องปกติ แต่อย่าลืมดูแลตัวเองด้วยนะคะ คุณทำได้แน่นอน 💪',
                    'เข้าใจเลยค่ะ ถ้ารู้สึกกังวล ลองทำกิจกรรมเบาๆ หรือฟังเพลงผ่อนคลายดูไหมคะ 🎵'
                ],
                energetic: [
                    'พลังงานแบบนี้เยี่ยมเลย! จะนำพลังบวกนี้ไปทำอะไรดีคะ 🚀',
                    'ว้าว! พลังเต็มร้อย! วันนี้เหมาะกับการทำสิ่งใหม่ๆ มากๆ เลยค่ะ ⭐',
                    'พลังงานดีๆ แบบนี้ต้องเก็บไว้! ขอให้วันนี้เป็นวันที่สุดยอดค่ะ 🔥'
                ],
                neutral: [
                    'วันที่ปกติๆ ก็เป็นวันที่ดีนะคะ ลองหากิจกรรมเล็กๆ ที่ทำให้ยิ้มได้ดูไหมคะ 😊',
                    'บางวันที่เรียบง่ายก็คือความสุขแบบนึง ขอให้วันนี้ผ่านไปอย่างสบายๆ นะคะ 🌤️',
                    'วันปกติๆ แบบนี้เหมาะกับการพักผ่อนและชาร์จพลังบ้างคะ 🔋'
                ]
            };
            
            const moodGreetings = greetings[moodId] || greetings.neutral;
            return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
        },

        // Mood selection
        selectMood(mood) {
            this.selectedMood = mood.id;
            
            // Track mood progress for personal growth
            this.trackMoodProgress(mood.id);
            
            const greeting = this.getMoodBasedGreeting(mood.id);
            this.showNotification(greeting, 'info', 5000);
        },

        // Computed Properties
        get timeGreeting() {
            return this.getTimeBasedGreeting();
        },

        // Modal and notification methods
        showNotification(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
            
            const colors = {
                success: 'bg-green-100 text-green-800 border-green-200',
                error: 'bg-red-100 text-red-800 border-red-200',
                warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                info: 'bg-blue-100 text-blue-800 border-blue-200'
            };
            
            notification.className += ` ${colors[type] || colors.info}`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <span class="mr-2">${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        },

        showConfirmModal(title, message, onConfirm, onCancel = null) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
                    <div class="p-6">
                        <div class="text-center mb-4">
                            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>
                        </div>
                        <h3 class="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
                            ${title}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 text-center mb-6">
                            ${message}
                        </p>
                        <div class="flex gap-3">
                            <button id="confirmCancelBtn" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
                                ยกเลิก
                            </button>
                            <button id="confirmOkBtn" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                ลบเลย
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#confirmCancelBtn');
            const okBtn = modal.querySelector('#confirmOkBtn');

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                if (onCancel) onCancel();
            });

            okBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                onConfirm();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    if (onCancel) onCancel();
                }
            });
        },

        // Data management
        saveData() {
            const data = {
                journalEntries: this.journalEntries,
                assessmentHistory: this.assessmentHistory,
                tree: this.tree
            };
            localStorage.setItem('mindbloomData', JSON.stringify(data));
        },

        // Tree animation
        updateTreeAnimation() {
            this.tree.animation = 'bounce';
            setTimeout(() => {
                this.tree.animation = '';
            }, 1000);
        },

        // Quote management
        quotes: [
            {
            "text": "ขอให้วันนี้เป็นวันที่ดีนะ เพราะทุกวันคือโอกาสใหม่ของเธอ 🌈",
            "author": "Anonymous"
        }, {
            "text": "ทุกเช้าวันใหม่คือโอกาสของการเริ่มต้นที่ดี ✨",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "เก่งมาก! นี่คือคำชมจากคนรอบตัว แล้วเธอล่ะ ชมตัวเองบ้างรึยัง 💕",
            "author": "Anonymous"
        }, {
            "text": "อย่าลืมชมตัวเองนะ เพราะเธอเก่งที่สุดแล้วจริง ๆ 🌟",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "ถ้าวันนี้จะรู้สึกผิดหวังก็ไม่เป็นไรเลยนะ เพราะมันคือส่วนหนึ่งของการเติบโต 💖",
            "author": "Anonymous"
        }, {
            "text": "ความผิดพลาดจะทำให้เราแข็งแรงขึ้น และพร้อมสำหรับวันใหม่เสมอ 🔥",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "ประสบการณ์คือบทเรียนที่ทำให้เราได้เรียนรู้อะไรใหม่ ๆ ทุกวัน 📖",
            "author": "Anonymous"
        }, {
            "text": "ความพยายามไม่เคยทำร้ายใคร มีแต่จะพาเราไปสู่สิ่งที่ดีขึ้น 💪",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "ทุกความผิดพลาดคือประสบการณ์ที่มีค่า อย่ากลัวที่จะผิดพลาด 🌸",
            "author": "Anonymous"
        }, {
            "text": "ไม่จำเป็นต้องเก่งที่สุด แค่เต็มที่เหมือนที่ผ่านมา ก็พอแล้ว 🌟",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "เธออย่าคิดว่าตัวเองไม่เก่งเลยนะ เธอผ่านมาได้ขนาดนี้ เธอเก่งมาก ๆ แล้ว 💕",
            "author": "Anonymous"
        }, {
            "text": "เธอเดินมาไกลมากแล้ว อย่าลืมกลับไปขอบคุณตัวเองด้วยนะ 🙏",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "วันนี้จะรู้สึกผิดหวังบ้างก็ไม่เป็นไร เราเชื่อว่าเธอทำเต็มที่ที่สุดแล้ว 💖",
            "author": "Anonymous"
        }, {
            "text": "เธอเริ่มต้นใหม่ได้เสมอ ไม่มีวันสายสำหรับการเริ่มต้น 🌈",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "You can do it! 🚀",
            "author": "Anonymous"
        }, {
            "text": "ขอบคุณคนอื่นมาเยอะแล้ว อย่าลืมขอบคุณตัวเองด้วยนะ 💕",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "อย่าลืมว่าแม้วันที่เหนื่อยที่สุด ก็ยังมีความหวังเล็ก ๆ รออยู่เสมอ 🌟",
            "author": "Anonymous"
        }, {
            "text": "ทุกก้าวเล็ก ๆ ที่เธอเดิน คือความกล้าหาญที่ยิ่งใหญ่ 💪",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "เธอไม่จำเป็นต้องสมบูรณ์แบบ แค่เป็นตัวเองในแบบที่ดีที่สุดก็พอ 💖",
            "author": "Anonymous"
        }, {
            "text": "เมื่อเธอล้มลง จงมองว่ามันคือโอกาสที่จะลุกขึ้นอย่างแข็งแรงกว่าเดิม 🔥",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "อย่าลืมยิ้มให้กับตัวเอง เพราะรอยยิ้มของเธอคือพลังที่สวยงาม 🌸",
            "author": "Anonymous"
        }, {
            "text": "ทุกวันที่เธอผ่านไปได้ คือหลักฐานว่าเธอเข้มแข็งกว่าที่คิด 🌟",
            "author": "Cloudy-Puk-Jai"
        }, {
            "text": "เธอมีคุณค่าเสมอ ไม่ว่าคนอื่นจะเห็นหรือไม่ เพราะหัวใจของเธอรู้ดีที่สุด 💕",
            "author": "Anonymous"
        }, {
            "text": "ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น",
            "author": "Anonymous ✨"
        }, {
            "text": "ล้มได้ แต่ต้องลุกให้ได้",
            "author": "Anonymous 🖤"
        }, {
            "text": "อย่าหยุดเมื่อเหนื่อย จงหยุดเมื่อสำเร็จ",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "เชื่อในตัวเอง แล้วโลกจะเชื่อคุณ",
            "author": "Anonymous Soul"
        }, {
            "text": "ทุกเช้าวันใหม่คือโอกาสใหม่",
            "author": "Anonymous ✨"
        }, {
            "text": "ความล้มเหลวคือครูที่ดีที่สุด",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "ไม่มีอะไรยิ่งใหญ่ได้ หากไม่เริ่มจากก้าวเล็ก ๆ",
            "author": "Anonymous 🖤"
        }, {
            "text": "ความสุขไม่ได้อยู่ที่ปลายทาง แต่อยู่ที่การเดินทาง",
            "author": "Anonymous Soul"
        }, {
            "text": "ทุกปัญหามีทางออกเสมอ",
            "author": "Anonymous ✨"
        }, {
            "text": "ความฝันจะไม่มีวันสำเร็จ หากไม่ลงมือทำ",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "จงใช้ความล้มเหลวเป็นแรงผลักดัน",
            "author": "Anonymous 🖤"
        }, {
            "text": "ความสำเร็จเริ่มต้นจากความเชื่อมั่น",
            "author": "Anonymous Soul"
        }, {
            "text": "ไม่มีใครกำหนดชีวิตคุณได้นอกจากตัวคุณเอง",
            "author": "Anonymous ✨"
        }, {
            "text": "อย่าหยุดฝัน เพราะฝันคือพลังชีวิต",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "ความกล้าคือก้าวแรกสู่ความสำเร็จ",
            "author": "Anonymous 🖤"
        }, {
            "text": "จงทำวันนี้ให้ดีที่สุด แล้วพรุ่งนี้จะดีเอง",
            "author": "Anonymous Soul"
        }, {
            "text": "ความหวังเล็ก ๆ สามารถเปลี่ยนชีวิตได้",
            "author": "Anonymous ✨"
        }, {
            "text": "จงยิ้มแม้ในวันที่เหนื่อยที่สุด",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "ความเข้มแข็งไม่ได้เกิดจากการไม่ล้ม แต่เกิดจากการลุกขึ้นทุกครั้ง",
            "author": "Anonymous 🖤"
        }, {
            "text": "อย่ารอให้โอกาสมา จงสร้างมันขึ้นมาเอง",
            "author": "Anonymous Soul"
        }, {
            "text": "ทุกการเดินทางเริ่มต้นจากก้าวแรกเสมอ",
            "author": "Anonymous ✨"
        }, {
            "text": "ความสุขคือการเลือกที่จะมองโลกในแง่ดี",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "อย่าหยุดเรียนรู้ เพราะชีวิตคือการเติบโต",
            "author": "Anonymous 🖤"
        }, {
            "text": "จงเชื่อว่าคุณทำได้ แม้ใครจะบอกว่าคุณทำไม่ได้",
            "author": "Anonymous Soul"
        }, {
            "text": "ความสำเร็จไม่ใช่เรื่องบังเอิญ แต่คือผลจากความพยายาม",
            "author": "Anonymous ✨"
        }, {
            "text": "ความภูมิใจที่ดีที่สุด คือการทำทุกอย่างด้วยตัวเองแล้วประสบความสำเร็จ",
            "author": "Cloudy-Puk-Jai 💕"
        }, {
            "text": "ถ้าใจพร้อม กายพร้อม ก็ลุยเลย",
            "author": "Anonymous 🖤"
        }, {
            "text": "ซื่อกินไม่หมด คดกินไม่นาน",
            "author": "Anonymous Soul"
        }, {
            "text": "ทุกคนสามารถทำได้ทุกอย่าง แต่อยู่ที่ว่าคุณจะทำหรือไม่ทำ",
            "author": "Anonymous ✨"
        }, {
            "text": "ความหวังทำให้เรามีแรงเดินต่อไป",
            "author": "Cloudy-Puk-Jai 💕"
        }
        ],

        randomQuote: null,

        showRandomQuote() {
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            this.randomQuote = this.quotes[randomIndex];
        },

        setDailyQuote() {
            this.randomQuote = this.dailyQuote;
        },

        // Data loading
        async loadData() {
            try {
                const [musicResponse, articlesResponse, assessmentsResponse] = await Promise.all([
                    fetch('data/music.json'),
                    fetch('data/articles.json'),
                    fetch('data/assessments.json')
                ]);

                const musicJson = await musicResponse.json();
                const articlesJson = await articlesResponse.json();
                const assessmentsJson = await assessmentsResponse.json();

                this.musicData = musicJson;
                this.articlesData = articlesJson.articles || articlesJson;
                this.assessmentsData = assessmentsJson;
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },

        // Date formatting
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        // Theme toggle
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode.toString());
        },

        // Terms acceptance
        acceptTerms() {
            if (this.agreedToTerms) {
                localStorage.setItem('agreedToTerms', 'true');
                this.modalOpen = null;
                this.showNotification('ยินดีต้อนรับ 🌸', 'success', 2000);
            } else {
                this.showNotification('กรุณายอมรับข้อตกลง', 'warning', 2000);
            }
        },

        // Assessment computed properties
        get mentalAssessments() {
            return this.assessmentsData.filter(a => a.type === 'mental');
        },

        get personalityAssessments() {
            return this.assessmentsData.filter(a => a.type === 'personality');
        },

        // Journal entry saving
        saveJournalEntry() {
            if (!this.journalForm.entry.trim()) {
                this.showNotification('กรุณาเขียนบันทึกก่อนบันทึก', 'warning');
                return;
            }

            const newEntry = {
                id: Date.now().toString(),
                date: this.journalForm.date,
                mood: this.journalForm.mood,
                entry: this.journalForm.entry,
                gratitude: this.journalForm.gratitude.filter(g => g.trim()),
                dailyGoal: this.journalForm.dailyGoal,
                createdAt: new Date().toISOString()
            };

            this.journalEntries.unshift(newEntry);

            // Update tree progress
            this.tree.points += 10;
            this.tree.progress += 1;
            this.updateTreeAnimation();

            // Save to localStorage
            this.saveData();

            // Reset form
            this.journalForm = {
                date: new Date().toISOString().split('T')[0],
                mood: 'neutral',
                entry: '',
                gratitude: ['', '', ''],
                dailyGoal: ''
            };

            this.showNotification('บันทึกเรียบร้อยแล้ว! 🌸', 'success');
        },

        // Initialization
        async init() {
            this.initRouter();
            this.showRandomQuote();

            this.darkMode = localStorage.getItem('darkMode') === 'true' ||
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

            // ฟังการเปลี่ยนแปลง darkMode จากหน้าอื่น
            window.addEventListener('storage', (e) => {
                if (e.key === 'darkMode' && e.oldValue !== e.newValue) {
                    this.darkMode = e.newValue === 'true';
                }
            });

            // ตรวจสอบการเปลี่ยนแปลง darkMode ทุกๆ 500ms (fallback สำหรับข้ามแท็บ)
            setInterval(() => {
                const currentDarkMode = localStorage.getItem('darkMode') === 'true';
                if (currentDarkMode !== this.darkMode) {
                    this.darkMode = currentDarkMode;
                }
            }, 500);

            const savedAgreement = localStorage.getItem('agreedToTerms');
            if (savedAgreement !== 'true') {
                setTimeout(() => {
                    this.modalOpen = 'welcome';
                }, 1000);
            } else {
                this.agreedToTerms = true;
            }

            const savedData = JSON.parse(localStorage.getItem('mindbloomData') || '{}');
            this.journalEntries = savedData.journalEntries || [];
            this.assessmentHistory = savedData.assessmentHistory || [];
            this.tree = savedData.tree || this.tree;

            this.setDailyQuote();
            await this.loadData();

            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('result')) {
                this.currentPage = 'results';
            }
        },

        // Music functions
        playTrack(track) {
            if (this.currentTrack.id === track.id) {
                this.togglePlayPause();
                return;
            }
            
            this.currentTrack = track;
            this.audioPlaying = true;
            this.showNotification(`กำลังเล่น: ${track.title}`, 'info');
        },

        togglePlayPause() {
            this.audioPlaying = !this.audioPlaying;
            if (this.audioPlaying) {
                this.showNotification('เล่นเพลง', 'success');
            } else {
                this.showNotification('หยุดเพลง', 'info');
            }
        },

        stopMusic() {
            this.audioPlaying = false;
            this.currentTrack = {};
            this.showNotification('หยุดเพลง', 'info');
        },

        // Assessment functions
        startQuiz(quiz) {
            this.currentQuiz = quiz;
            this.currentQuestionIndex = 0;
            this.quizAnswers = [];
            this.quizScore = 0;
            this.quizResult = {};
            this.navigateTo('quiz');
        },

        answerQuestion(answer) {
            this.quizAnswers[this.currentQuestionIndex] = answer;
        },

        calculateQuizResult() {
            // คำนวณคะแนนโดยรวมค่า val ของคำตอบทั้งหมด
            let totalScore = 0;
            this.quizAnswers.forEach(answer => {
                totalScore += answer || 0;
            });

            // แปลงเป็นเปอร์เซ็นต์ (สูงสุดคือคะแนนเต็ม)
            const maxScore = this.currentQuiz.questions.length * 5; // สมมติว่าคะแนนสูงสุดต่อข้อคือ 5
            this.quizScore = Math.round((totalScore / maxScore) * 100);

            // หาผลลัพธ์จาก assessments.json
            this.quizResult = this.currentQuiz.results.find(result => {
                return this.quizScore >= result.min && this.quizScore <= result.max;
            }) || this.currentQuiz.results[0];

            // บันทึกประวัติ
            this.assessmentHistory.unshift({
                id: Date.now().toString(),
                quizId: this.currentQuiz.id,
                quizTitle: this.currentQuiz.title,
                score: this.quizScore,
                result: this.quizResult,
                date: new Date().toISOString(),
                answers: this.quizAnswers
            });

            // อัพเดทต้นไม้
            this.tree.points += 5;
            this.tree.progress += 1;
            this.updateTreeAnimation();

            // บันทึกข้อมูล
            this.saveData();

            // ไปหน้าผลลัพธ์
            this.navigateTo('results');
        },

        resetQuiz() {
            this.currentQuestionIndex = 0;
            this.quizAnswers = [];
            this.quizScore = 0;
            this.quizResult = {};
            this.currentQuiz = {
                id: '',
                title: '',
                desc: '',
                type: '',
                questions: [],
                results: [],
                timeNeeded: 0
            };
        },

        saveAssessmentResult() {
            // ผลลัพธ์ถูกบันทึกไว้แล้วใน calculateQuizResult()
            this.showNotification('บันทึกผลลัพธ์แล้ว', 'success');
        },

        // Utility functions
        getMoodEmoji(moodId) {
            const mood = this.moods.find(m => m.id === moodId);
            return mood ? mood.emoji : '😐';
        },

        getAssessmentIcon(assessmentId) {
            const icons = {
                'who5': '🧠',
                'pss10': '💭',
                'stress1': '😰',
                'anxiety1': '😟',
                'depression1': '😔',
                'personality1': '🎭',
                'personality2': '🌟'
            };
            return icons[assessmentId] || '📝';
        },

        getRelatedTopic(assessmentId) {
            const topics = {
                'who5': 'สุขภาพจิตทั่วไป',
                'pss10': 'ความเครียดในชีวิตประจำวัน',
                'stress1': 'การจัดการความเครียด',
                'anxiety1': 'ความกังวล',
                'depression1': 'อารมณ์เศร้า',
                'personality1': 'บุคลิกภาพ',
                'personality2': 'นิสัยในตัวเอง'
            };
            return topics[assessmentId] || 'การประเมินตน';
        },

        getMusicRecommendation(assessmentId) {
            const recommendations = {
                'who5': 'เพลงผ่อนคลายสำหรับความสุข',
                'pss10': 'เพลงสมาธิสำหรับความเครียด',
                'stress1': 'เพลงลดความเครียด',
                'anxiety1': 'เพลงสงบสุข',
                'depression1': 'เพลงเปิดใจ',
                'personality1': 'เพลงบำรุงตัวตน',
                'personality2': 'เพลงเพื่อการพัฒนาตน'
            };
            return recommendations[assessmentId] || 'เพลงผ่อนคลายทั่วไป';
        },

        getYouTubeEmbedUrl(url) {
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1]?.split('&')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return url;
        },

        getAssessmentCategory(type) {
            const categories = {
                'mental': 'สุขภาพจิต',
                'personality': 'บุคลิกภาพ'
            };
            return categories[type] || 'ทั่วไป';
        },

        // Article functions
        openArticleModal(article) {
            this.currentArticle = article;
            if (article.type === 'external') {
                this.modalOpen = 'externalArticle';
            } else {
                this.modalOpen = 'article';
            }
        },

        closeArticleModal() {
            this.modalOpen = null;
            this.currentArticle = {};
        },

        closeModal() {
            this.modalOpen = null;
        },

        openModal(modalType) {
            this.modalOpen = modalType;
        },

        openExternalArticle(url) {
            if (url) {
                window.open(url, '_blank');
            }
        },

        // Result color function
        getResultColor(result) {
            const colors = {
                'ดีมาก': 'bg-green-500',
                'ดี': 'bg-blue-500', 
                'ปานกลาง': 'bg-yellow-500',
                'ต้องปรับปรุง': 'bg-orange-500',
                'ต้องรับคำปรึกษา': 'bg-red-500',
                'พลังใจอ่อนล้า': 'bg-red-500',
                'ใจเบิกบานดีมาก': 'bg-green-500'
            };
            return colors[result] || 'bg-gray-500';
        },

        // Quiz functions
        selectQuizAnswer(value) {
            this.quizAnswers[this.currentQuestionIndex] = value;
        },

        nextQuestion() {
            if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.calculateQuizResult();
            }
        },

        prevQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
            }
        },

        // Assessment functions
        startAssessment(assessment) {
            this.startQuiz(assessment);
        },

        viewHistoryDetail(history) {
            this.currentQuiz = {
                id: history.quizId,
                title: history.quizTitle,
                questions: [],
                results: [history.result]
            };
            this.quizAnswers = history.answers;
            this.quizScore = history.score;
            this.quizResult = history.result;
            this.navigateTo('results');
        },

        // Music functions
        getSourceType(url) {
            if (!url) return 'local';
            if (url.includes('spotify')) return 'spotify';
            if (url.includes('youtube')) return 'youtube';
            if (url.includes('soundcloud')) return 'soundcloud';
            return 'local';
        },

        playTrack(track) {
            this.currentTrack = track;
            this.isPlaying = true;
        },

        pauseTrack() {
            this.isPlaying = false;
        },

        nextTrack() {
            const currentIndex = this.currentPlaylist.findIndex(t => t.id === this.currentTrack.id);
            const nextIndex = (currentIndex + 1) % this.currentPlaylist.length;
            this.playTrack(this.currentPlaylist[nextIndex]);
        },

        prevTrack() {
            const currentIndex = this.currentPlaylist.findIndex(t => t.id === this.currentTrack.id);
            const prevIndex = currentIndex === 0 ? this.currentPlaylist.length - 1 : currentIndex - 1;
            this.playTrack(this.currentPlaylist[prevIndex]);
        },

        // Personal Growth Functions
        trackMoodProgress(mood) {
            const today = new Date().toDateString();
            
            // Add to mood history
            this.personalGrowth.moodHistory.push({
                date: today,
                mood: mood,
                timestamp: Date.now()
            });
            
            // Update mood streak
            if (this.personalGrowth.lastMoodDate) {
                const lastDate = new Date(this.personalGrowth.lastMoodDate);
                const todayDate = new Date(today);
                const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    this.personalGrowth.moodStreak++;
                } else if (daysDiff > 1) {
                    this.personalGrowth.moodStreak = 1;
                }
            } else {
                this.personalGrowth.moodStreak = 1;
            }
            
            this.personalGrowth.lastMoodDate = today;
            
            // Update weekly stats
            this.updateWeeklyMoodStats(mood);
            
            // Check for achievements
            this.checkMoodAchievements(mood);
            
            // Generate insights
            this.generateMoodInsights();
            
            this.saveData();
        },

        updateWeeklyMoodStats(mood) {
            const weekStart = this.getWeekStart(new Date());
            const weekKey = weekStart.toDateString();
            
            if (!this.personalGrowth.weeklyMoodStats[weekKey]) {
                this.personalGrowth.weeklyMoodStats[weekKey] = {};
            }
            
            this.personalGrowth.weeklyMoodStats[weekKey][mood] = 
                (this.personalGrowth.weeklyMoodStats[weekKey][mood] || 0) + 1;
        },

        checkMoodAchievements(mood) {
            const achievements = this.personalGrowth.achievements;
            
            // First mood tracking
            if (this.personalGrowth.moodHistory.length === 1) {
                achievements.push({
                    id: 'first_mood',
                    title: '🌟 เริ่มติดตามอารมณ์',
                    description: 'บันทึกอารมณ์ครั้งแรก',
                    date: new Date().toISOString(),
                    icon: '🌟'
                });
            }
            
            // Mood streak achievements
            if (this.personalGrowth.moodStreak === 7) {
                achievements.push({
                    id: 'week_streak',
                    title: '🔥 ติดตามติดต่อ 7 วัน',
                    description: 'บันทึกอารมณ์มา 7 วันติดต่อ',
                    date: new Date().toISOString(),
                    icon: '🔥'
                });
            }
            
            if (this.personalGrowth.moodStreak === 30) {
                achievements.push({
                    id: 'month_streak',
                    title: '💎 ติดตามติดต่อ 30 วัน',
                    description: 'บันทึกอารมณ์มาเดือนเต็ม',
                    date: new Date().toISOString(),
                    icon: '💎'
                });
            }
            
            // Mood variety achievements
            const uniqueMoods = [...new Set(this.personalGrowth.moodHistory.map(h => h.mood))];
            if (uniqueMoods.length === 5) {
                achievements.push({
                    id: 'all_moods',
                    title: '🌈 สำรวจอารมณ์ทั้งหมด',
                    description: 'ลองอารมณ์ทั้ง 5 แบบ',
                    date: new Date().toISOString(),
                    icon: '🌈'
                });
            }
        },

        generateMoodInsights() {
            const recentMoods = this.personalGrowth.moodHistory.slice(-7);
            if (recentMoods.length < 3) return;
            
            const moodCounts = {};
            recentMoods.forEach(entry => {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            });
            
            const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
                moodCounts[a] > moodCounts[b] ? a : b
            );
            
            const insight = {
                date: new Date().toISOString(),
                type: 'mood_pattern',
                title: '🧠 รูปแบบอารมณ์ของคุณ',
                description: `ใน 7 วันล่าสุด คุณรู้สึก${dominantMood}มากที่สุด`,
                dominantMood: dominantMood,
                moodDistribution: moodCounts
            };
            
            // Add to insights (keep last 10)
            this.personalGrowth.monthlyInsights.unshift(insight);
            if (this.personalGrowth.monthlyInsights.length > 10) {
                this.personalGrowth.monthlyInsights = this.personalGrowth.monthlyInsights.slice(0, 10);
            }
        },

        getWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day;
            return new Date(d.setDate(diff));
        },

        getMoodInsights() {
            return this.personalGrowth.monthlyInsights.slice(0, 3);
        },

        getMoodStreak() {
            return this.personalGrowth.moodStreak;
        },

        getWeeklyMoodStats() {
            const weekStart = this.getWeekStart(new Date());
            const weekKey = weekStart.toDateString();
            return this.personalGrowth.weeklyMoodStats[weekKey] || {};
        }
    }))
});

