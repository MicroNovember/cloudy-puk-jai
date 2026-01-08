// MindBloom App - Alpine.js Component

document.addEventListener('alpine:init', () => {
    Alpine.data('mindbloomApp', () => ({
        // App State
        currentPage: 'home',
        mobileMenuOpen: false,
        darkMode: false,
        modalOpen: null,
        accessibilityOpen: false,
        assessmentTab: 'mental',
        
        // User Data
        journalEntries: [],
        selectedMood: null,
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
        assessmentHistory: [],
        
        // Forms
        journalForm: {
            date: new Date().toISOString().split('T')[0],
            mood: 'neutral',
            entry: '',
            gratitude: ['', '', ''],
            dailyGoal: ''
        },
        
        // Music
        musicTab: 'music',
        currentTrack: {},
        audioPlaying: false,
        musicData: {
            music: [],
            podcasts: [],
            playlists: []
        },
        
        // Articles
        articlesData: {
            articles: []
        },
        currentArticle: {},
        
        // Assessments
        assessmentsData: [],
        currentQuiz: null,
        currentQuestionIndex: 0,
        quizAnswers: [],
        quizScore: 0,
        quizResult: {},
        

        // Methods ที่เพิ่ม
        navigateTo(page) {
        if (page === 'tools') {
        // เปิดหน้า tools.html
        window.location.href = 'tools.html';
        } else {
        // ไปยังหน้าในแอพเดียวกัน
        this.currentPage = page;
        }
    
        // ปิดเมนูมือถือถ้าเปิดอยู่
        this.mobileMenuOpen = false;
        },

        navigateToFeature(feature) {
        if (feature.page === 'tools') {
        // เปิดหน้า tools.html
        window.location.href = 'tools.html';
        } else {
        // ไปยังหน้าในแอพเดียวกัน
        this.currentPage = feature.page;
    }
    
        // ปิดเมนูมือถือถ้าเปิดอยู่
        this.mobileMenuOpen = false;
    },




        
        // Settings
        fontSize: 'medium',
        highContrast: false,
        
        // Static Data
        moods: [
            { id: 'happy', label: 'สุขใจ', emoji: '😊', color: 'var(--happy)' },
            { id: 'calm', label: 'สงบ', emoji: '😌', color: 'var(--calm)' },
            { id: 'sad', label: 'เศร้า', emoji: '😔', color: 'var(--sad)' },
            { id: 'anxious', label: 'กังวล', emoji: '😰', color: 'var(--anxious)' },
            { id: 'energetic', label: 'energetic', emoji: '😄', color: 'var(--energetic)' },
            { id: 'neutral', label: 'ปกติ', emoji: '😐', color: 'var(--neutral)' }
        ],
        
        moodResponses: {
            happy: {
                message: "ยินดีด้วยที่คุณรู้สึกสุขใจวันนี้! ลองแบ่งปันความสุขนี้กับคนรอบข้าง หรือบันทึกมันไว้ในสมุดบันทึก",
                suggestion: "เราขอแนะนำบทความ 'วิธีรักษาความสุขให้ยั่งยืน' และเพลย์ลิสต์ 'เสียงแห่งความสุข'"
            },
            calm: {
                message: "ความรู้สึกสงบเป็นของขวัญที่ล้ำค่า ลองสูดลมหายใจลึกๆ เพื่อรักษาสภาวะนี้ไว้",
                suggestion: "เราขอแนะนำการฝึกหายใจและเพลย์ลิสต์ 'เสียงธรรมชาติผ่อนคลาย'"
            },
            sad: {
                message: "เราอยู่ตรงนี้เพื่อคุณ ลองเขียนระบายความรู้สึกออกมา หรือฟังเพลงเบาๆ สักเพลง",
                suggestion: "เราขอแนะนำบทความ 'วิธีดูแลตัวเองในวันที่รู้สึกเศร้า' และเพลง 'แสงเล็กๆ ในความมืด'"
            },
            anxious: {
                message: "ลมหายใจคือเพื่อนที่ดีในยามวิตกกังวล ลองฝึกหายใจกับ Breathing Buddy สัก 2-3 นาที",
                suggestion: "เราขอแนะนำแบบฝึกหายใจและบทความ 'วิธีรับมือกับความวิตกกังวล'"
            },
            energetic: {
                message: "พลังงานที่ดีแบบนี้ ลองใช้สร้างสรรค์สิ่งดีๆ หรือทำกิจกรรมที่คุณชอบดูสิ",
                suggestion: "เราขอแนะนำแบบทดสอบบุคลิกภาพและเพลย์ลิสต์ 'พลังงานบวก'"
            },
            neutral: {
                message: "บางวันที่รู้สึกปกตินี่แหละคือวันที่สมดุลที่สุด ลองสำรวจความรู้สึกตัวเองดู",
                suggestion: "เราขอแนะนำบทความ 'การรู้จักตัวเองผ่านวันปกติๆ' และแบบทดสอบสุขภาพจิต"
            }
        },
        
        dailyQuote: {
            text: "การเดินทางที่ยิ่งใหญ่ที่สุด เริ่มต้นจากก้าวเล็กๆ ก้าวแรกเสมอ",
            author: "ผู้ไม่ประสงค์ออกนาม"
        },
        
        features: [
            { id: 1, icon: '📖', title: 'สมุดบันทึก', description: 'บันทึกความรู้สึกและสิ่งดีๆ ในแต่ละวัน', page: 'journal' },
            { id: 2, icon: '🎵', title: 'เพลงและพอดแคสต์', description: 'ฟังเพลงและพอดแคสต์เพื่อผ่อนคลาย', page: 'music' },
            { id: 3, icon: '📚', title: 'บทความ', description: 'บทความและเทคนิคดูแลสุขภาพจิต', page: 'articles' },
            { id: 4, icon: '📝', title: 'แบบทดสอบ', description: 'ประเมินสุขภาพจิตและบุคลิกภาพ', page: 'assessments' },
            { id: 5, icon: '🌳', title: 'สวนแห่งใจ', description: 'ดูต้นไม้ของคุณที่เติบโตตามกิจกรรม', page: 'growth' },
            { id: 6, icon: '🧘‍♀️', title: 'เครื่องมือผ่อนคลาย', description: 'ฝึกหายใจและสร้างสมาธิในเวลาสั้นๆ', page: 'tools' }
        ],
        
        badges: [
            { id: 1, icon: 'fas fa-seedling', earned: true },
            { id: 2, icon: 'fas fa-book', earned: true },
            { id: 3, icon: 'fas fa-heart', earned: true },
            { id: 4, icon: 'fas fa-spa', earned: false },
            { id: 5, icon: 'fas fa-fire', earned: false },
            { id: 6, icon: 'fas fa-star', earned: false }
        ],
        
        quotes: [
            { text: "การเดินทางที่ยิ่งใหญ่ที่สุด เริ่มต้นจากก้าวเล็กๆ ก้าวแรกเสมอ", author: "ผู้ไม่ประสงค์ออกนาม" },
            { text: "ความสุขที่ยั่งยืนมักมาจากการยอมรับสิ่งที่เราเป็น", author: "ผู้ไม่ประสงค์ออกนาม" },
            { text: "วันที่แย่ที่สุดก็มี 24 ชั่วโมง เท่ากับวันที่ดีที่สุด", author: "ผู้ไม่ประสงค์ออกนาม" },
            { text: "การดูแลจิตใจก็สำคัญไม่น้อยไปกว่าการดูแลร่างกาย", author: "ผู้ไม่ประสงค์ออกนาม" },
            { text: "ความเจ็บปวดคือครูที่ดี แต่เราไม่จำเป็นต้องเรียนกับมันทุกวัน", author: "ผู้ไม่ประสงค์ออกนาม" },
            { text: "การให้อภัยตัวเองเป็นของขวัญที่ดีที่สุดที่คุณจะมอบให้ตัวเอง", author: "ผู้ไม่ประสงค์ออกนาม" }
        ],
        
        // Computed Properties
        get mentalAssessments() {
            return this.assessmentsData.filter(a => a.type === 'mental');
        },

        get personalityAssessments() {
            return this.assessmentsData.filter(a => a.type === 'personality');
        },

        // Methods
        async init() {
            // ตั้งค่า dark mode
            this.darkMode = localStorage.getItem('darkMode') === 'true' || 
                           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            // โหลดข้อมูลจาก localStorage
            const savedData = JSON.parse(localStorage.getItem('mindbloomData') || '{}');
            this.journalEntries = savedData.journalEntries || [];
            this.assessmentHistory = savedData.assessmentHistory || [];
            this.tree = savedData.tree || this.tree;
            
            // โหลดคำคมประจำวัน
            this.setDailyQuote();
            
            // โหลดข้อมูลจาก JSON files
            await this.loadData();
            
            // ตั้งค่าขนาดฟอนต์
            this.fontSize = localStorage.getItem('fontSize') || 'medium';
            
            // ตั้งค่าความคมชัดสูง
            this.highContrast = localStorage.getItem('highContrast') === 'true';
            
            // อัพเดท tree animation
            this.updateTreeAnimation();
        },

        // ใน methods section ของ app.js
            navigateToFeature(feature) {
            if (feature.page === 'tools') {
        // เปิดหน้า tools.html ในหน้าต่างใหม่
            window.location.href = 'tools.html';
            } else {
        // ไปยังหน้าในแอพเดียวกัน
            this.currentPage = feature.page;
            }
    
        // ปิดเมนูมือถือถ้าเปิดอยู่
            this.mobileMenuOpen = false;
        },

        
        async loadData() {
            try {
                // Load music data
                const musicResponse = await fetch('data/music.json');
                this.musicData = await musicResponse.json();
                
                // Load articles data
                const articlesResponse = await fetch('data/articles.json');
                this.articlesData = await articlesResponse.json();
                
                // Load assessments data
                const assessmentsResponse = await fetch('data/assessments.json');
                this.assessmentsData = await assessmentsResponse.json();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },
        
        setDailyQuote() {
            const today = new Date().getDate();
            const quoteIndex = today % this.quotes.length;
            this.dailyQuote = this.quotes[quoteIndex];
        },
        
        // Mood Functions
        selectMood(mood) {
            this.selectedMood = mood.id;
        },
        
        // Journal Functions
        saveJournalEntry() {
            if (!this.journalForm.date || !this.journalForm.mood) {
                alert('กรุณากรอกวันที่และเลือกอารมณ์');
                return;
            }
            
            const entry = {
                id: Date.now(),
                date: this.journalForm.date,
                mood: this.journalForm.mood,
                entry: this.journalForm.entry,
                gratitude: this.journalForm.gratitude.filter(g => g.trim() !== ''),
                dailyGoal: this.journalForm.dailyGoal
            };
            
            this.journalEntries.unshift(entry);
            
            // อัพเดทต้นไม้
            this.tree.progress++;
            this.tree.points += 20;
            this.tree.streak = Math.max(this.tree.streak, this.getCurrentStreak());
            
            // อัพเดท tree animation
            this.updateTreeAnimation();
            
            // บันทึกข้อมูล
            this.saveData();
            
            // Reset form
            this.journalForm = {
                date: new Date().toISOString().split('T')[0],
                mood: 'neutral',
                entry: '',
                gratitude: ['', '', ''],
                dailyGoal: ''
            };
            
            alert('บันทึกสำเร็จแล้ว! 🌟');
        },
        
        getCurrentStreak() {
            if (this.journalEntries.length === 0) return 0;
            
            let streak = 1;
            const entries = [...this.journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            for (let i = 1; i < entries.length; i++) {
                const currentDate = new Date(entries[i-1].date);
                const previousDate = new Date(entries[i].date);
                const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }
            
            return streak;
        },
        
        downloadJournal() {
            if (this.journalEntries.length === 0) {
                alert('ยังไม่มีบันทึกที่จะดาวน์โหลด');
                return;
            }
            
            const data = {
                title: 'บันทึกสุขภาพจิตจาก MindBloom',
                generatedAt: new Date().toISOString(),
                entries: this.journalEntries
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mindbloom-journal-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        },
        
        getMoodEmoji(moodId) {
            const mood = this.moods.find(m => m.id === moodId);
            return mood ? mood.emoji : '😐';
        },
        
        // Music Functions
        playTrack(track) {
            this.currentTrack = {
            id: track.id,
            title: track.title,
            artist: track.artist,
            description: track.description, // ต้องมีบรรทัดนี้
            spotifyUrl: track.spotifyUrl,
            image: track.image,
            duration: track.duration,
            category: track.category
            };
        },


// เพิ่ม
        // ฟังก์ชันสำหรับจัดการ audio
onAudioPlay() {
    this.audioPlaying = true;
},

onAudioPause() {
    this.audioPlaying = false;
},

// ฟังก์ชันแปลง YouTube URL เป็น embed URL
getYouTubeEmbedUrl(url) {
    if (!url) return '';
    
    // ถ้าเป็น embed URL อยู่แล้ว
    if (url.includes('embed/')) return url;
    
    // แปลงจาก YouTube URL ปกติเป็น embed
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    return url;
},

// ฟังก์ชันดึง YouTube Video ID
extractYouTubeId(url) {
    if (!url) return '';
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
},

// ฟังก์ชันตรวจสอบประเภทของ URL
getSourceType(url) {
    if (!url) return 'ไม่ระบุ';
    if (url.includes('open.spotify.com')) return 'Spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('pixabay.com')) return 'Pixabay';
    if (url.includes('.mp3')) return 'ไฟล์ MP3';
    if (url.includes('.wav')) return 'ไฟล์ WAV';
    if (url.includes('.ogg')) return 'ไฟล์ OGG';
    return 'แหล่งที่มา';
},

// ฟังก์ชันแปลง Pixabay URL เป็น direct audio URL
getDirectAudioUrl(url) {
    if (!url || !url.includes('pixabay.com')) return url;
    
    // ถ้าเป็น URL หน้าเว็บ Pixabay music เช่น https://pixabay.com/music/upbeat-sun-bunny-108599/
    // ต้องดึง ID จาก URL
    if (url.includes('pixabay.com/music/')) {
        // ตัวอย่าง: ดึง ID 108599 จาก URL
        const match = url.match(/pixabay\.com\/music\/.*-(\d+)\/$/);
        if (match && match[1]) {
            const musicId = match[1];
            // ใช้ Pixabay API หรือสร้าง direct URL (นี่เป็นตัวอย่าง)
            // ในความเป็นจริงอาจต้องใช้ Pixabay API เพื่อดึง direct link
            return `https://cdn.pixabay.com/audio/2023/01/01/audio_${musicId}.mp3`;
        }
    }
    
    return url;
},

// ฟังก์ชันดึง direct audio URL จาก Pixabay (แบบง่าย)
getPixabayDirectLink(url) {
    // สำหรับตัวอย่าง ให้ใช้เสียงอื่นแทนถ้าเป็น Pixabay page URL
    if (url.includes('pixabay.com/music/')) {
        // ส่งคืน direct MP3 link จากแหล่งอื่นแทน
        return 'https://assets.mixkit.co/music/preview/mixkit-piano-1181.mp3';
    }
    return url;
},









        
        // Article Functions
        openArticleModal(article) {
            this.currentArticle = article;
            this.modalOpen = 'article';
        },
        
        // Assessment Functions
        getAssessmentIcon(assessmentId) {
            const icons = {
                'who5': '😊',
                'pss10': '😰',
                'gad7': '😟',
                'phq9': '😔',
                'burnout': '🔥',
                'self-compassion': '❤️',
                'resilience': '💪',
                'emotional-awareness': '🧠',
                'mbti-simple': '👤',
                'big-five': '🌟'
            };
            return icons[assessmentId] || '📝';
        },
        
        getAssessmentCategory(type) {
            return type === 'mental' ? 'สุขภาพจิต' : 'บุคลิกภาพ';
        },
        
        startAssessment(assessment) {
            this.currentQuiz = assessment;
            this.currentQuestionIndex = 0;
            this.quizAnswers = new Array(assessment.questions.length).fill(undefined);
            this.currentPage = 'quiz';
        },
        
        selectQuizAnswer(value) {
            this.quizAnswers[this.currentQuestionIndex] = value;
        },
        
        prevQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
            }
        },
        
        nextQuestion() {
            if (this.quizAnswers[this.currentQuestionIndex] === undefined) {
                alert('กรุณาเลือกคำตอบก่อนดำเนินการต่อ');
                return;
            }
            
            if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                // Calculate score
                this.quizScore = this.quizAnswers.reduce((sum, value) => sum + (value || 0), 0);
                
                // Find result
                for (const result of this.currentQuiz.results) {
                    if (this.quizScore >= result.min && this.quizScore <= result.max) {
                        this.quizResult = result;
                        break;
                    }
                }
                
                // Update tree points
                this.tree.points += 30;
                
                // Save data
                this.saveData();
                
                // Show results
                this.currentPage = 'results';
            }
        },
        
        retakeQuiz() {
            this.startAssessment(this.currentQuiz);
        },
        
        saveAssessmentResult() {
            const result = {
                id: this.currentQuiz.id,
                title: this.currentQuiz.title,
                score: this.quizScore,
                result: this.quizResult.title,
                date: new Date().toISOString().split('T')[0]
            };
            
            this.assessmentHistory.push(result);
            
            // Save to localStorage
            this.saveData();
            
            alert('บันทึกผลการทดสอบเรียบร้อยแล้ว!');
        },
        
        getResultColor(result) {
            const score = this.quizScore;
            if (score >= result.min && score <= result.max) {
                return 'bg-primary';
            }
            return 'bg-gray-300 dark:bg-gray-600';
        },
        
        getRelatedTopic(assessmentId) {
            const topics = {
                'who5': 'ความสุขในชีวิตประจำวัน',
                'pss10': 'การจัดการความเครียด',
                'gad7': 'วิธีรับมือความวิตกกังวล',
                'phq9': 'การดูแลสุขภาพจิต',
                'burnout': 'การป้องกันภาวะหมดไฟ',
                'self-compassion': 'การรักและเข้าใจตนเอง',
                'resilience': 'การพัฒนาความยืดหยุ่นทางใจ',
                'emotional-awareness': 'การรู้เท่าทันอารมณ์',
                'mbti-simple': 'การเข้าใจบุคลิกภาพ',
                'big-five': 'การพัฒนาตนเอง'
            };
            return topics[assessmentId] || 'สุขภาพจิต';
        },
        
        getMusicRecommendation(assessmentId) {
            const recommendations = {
                'who5': 'เสียงแห่งความสุข',
                'pss10': 'เพลงผ่อนคลายความเครียด',
                'gad7': 'ดนตรีบำบัดความกังวล',
                'phq9': 'เสียงธรรมชาติให้กำลังใจ',
                'burnout': 'เพลงเติมพลังชีวิต',
                'self-compassion': 'ดนตรีแห่งการให้อภัย',
                'resilience': 'เสียงที่ทำให้เข้มแข็ง',
                'emotional-awareness': 'ดนตรีที่ช่วยเข้าใจอารมณ์',
                'mbti-simple': 'เพลงตามสไตล์บุคลิก',
                'big-five': 'ดนตรีเปิดโลกกว้าง'
            };
            return recommendations[assessmentId] || 'เพลงผ่อนคลาย';
        },
        
        // Tree Functions
        updateTreeAnimation() {
            if (this.tree.progress >= 7) {
                this.tree.level = 2;
                this.tree.icon = '🌿';
                this.tree.name = 'ต้นกล้าแห่งความตั้งใจ';
                this.tree.animation = 'animate-pulse-slow';
            } else if (this.tree.progress >= 14) {
                this.tree.level = 3;
                this.tree.icon = '🌳';
                this.tree.name = 'ต้นไม้แห่งจิตเบิกบาน';
                this.tree.animation = 'animate-bounce-slow';
            } else {
                this.tree.animation = '';
            }
        },
        
        // Modal Functions
        openModal(modalType) {
            this.modalOpen = modalType;
        },
        
        closeModal() {
            this.modalOpen = null;
        },
        
        // Theme Functions
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },
        
        // Accessibility Functions
        setFontSize(size) {
            this.fontSize = size;
            localStorage.setItem('fontSize', size);
        },
        
        textToSpeech() {
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance();
                const currentPageText = this.getCurrentPageText();
                
                speech.text = currentPageText;
                speech.lang = 'th-TH';
                speech.rate = 1;
                speech.pitch = 1;
                
                window.speechSynthesis.speak(speech);
            } else {
                alert('เบราว์เซอร์ของคุณไม่รองรับ Text-to-Speech');
            }
        },
        
        getCurrentPageText() {
            const pageTitles = {
                'home': 'หน้าหลัก MindBloom',
                'journal': 'สมุดบันทึก',
                'music': 'เพลงและพอดแคสต์',
                'articles': 'บทความสุขภาพจิต',
                'assessments': 'แบบทดสอบสุขภาพจิต',
                'quiz': 'กำลังทำแบบทดสอบ',
                'results': 'ผลลัพธ์แบบทดสอบ',
                'growth': 'สวนแห่งใจ'
            };
            
            return pageTitles[this.currentPage] || 'MindBloom';
        },
        
        // Data Management
        saveData() {
            const data = {
                journalEntries: this.journalEntries,
                assessmentHistory: this.assessmentHistory,
                tree: this.tree
            };
            localStorage.setItem('mindbloomData', JSON.stringify(data));
        },
        
        exportData() {
            const data = {
                mindbloomData: JSON.parse(localStorage.getItem('mindbloomData') || '{}'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mindbloom-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        
        clearData() {
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                localStorage.removeItem('mindbloomData');
                localStorage.removeItem('darkMode');
                localStorage.removeItem('fontSize');
                localStorage.removeItem('highContrast');
                
                // Reset app state
                this.journalEntries = [];
                this.assessmentHistory = [];
                this.tree = {
                    level: 1,
                    progress: 1,
                    streak: 2,
                    points: 150,
                    badges: 3,
                    icon: '🌱',
                    name: 'เมล็ดพันธุ์แห่งการเริ่มต้น',
                    animation: ''
                };
                
                alert('ล้างข้อมูลเรียบร้อยแล้ว');
                this.currentPage = 'home';
            }
        }
    }));
});