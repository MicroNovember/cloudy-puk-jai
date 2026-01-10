// MindBloom App - Alpine.js Component

document.addEventListener('alpine:init', () => {
    Alpine.data('mindbloomApp', () => ({
        // App State
        currentPage: 'home',
        mobileMenuOpen: false,
        darkMode: false,
        modalOpen: null,
        assessmentTab: 'mental',
        musicTipsOpen: false,  // สำหรับเปิด-ปิดคำแนะนำ
        articleTipsOpen: false,  // สำหรับเปิด-ปิดคำแนะนำบทความ
        assessmentTipsOpen: true,  // ให้แสดงตั้งแต่แรก (default เปิด)
        agreedToTerms: false,
        


        
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
        resultAutoSaved: false,
        
        
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
        currentQuiz: {
            id: '',
            title: '',
            desc: '',
            type: '',        // เพิ่ม
            questions: [],
            results: [],
            timeNeeded: 0    // เพิ่ม
        },

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
        
        randomQuote: null,

        // คำคม //
        quotes: [
        { "text": "ขอให้วันนี้เป็นวันที่ดีนะ เพราะทุกวันคือโอกาสใหม่ของเธอ 🌈", "author": "Anonymous" },
        { "text": "ทุกเช้าวันใหม่คือโอกาสของการเริ่มต้นที่ดี ✨", "author": "Cloudy-Puk-Jai" },
        { "text": "เก่งมาก! นี่คือคำชมจากคนรอบตัว แล้วเธอล่ะ ชมตัวเองบ้างรึยัง 💕", "author": "Anonymous" },
        { "text": "อย่าลืมชมตัวเองนะ เพราะเธอเก่งที่สุดแล้วจริง ๆ 🌟", "author": "Cloudy-Puk-Jai" },
        { "text": "ถ้าวันนี้จะรู้สึกผิดหวังก็ไม่เป็นไรเลยนะ เพราะมันคือส่วนหนึ่งของการเติบโต 💖", "author": "Anonymous" },
        { "text": "ความผิดพลาดจะทำให้เราแข็งแรงขึ้น และพร้อมสำหรับวันใหม่เสมอ 🔥", "author": "Cloudy-Puk-Jai" },
        { "text": "ประสบการณ์คือบทเรียนที่ทำให้เราได้เรียนรู้อะไรใหม่ ๆ ทุกวัน 📖", "author": "Anonymous" },
        { "text": "ความพยายามไม่เคยทำร้ายใคร มีแต่จะพาเราไปสู่สิ่งที่ดีขึ้น 💪", "author": "Cloudy-Puk-Jai" },
        { "text": "ทุกความผิดพลาดคือประสบการณ์ที่มีค่า อย่ากลัวที่จะผิดพลาด 🌸", "author": "Anonymous" },
        { "text": "ไม่จำเป็นต้องเก่งที่สุด แค่เต็มที่เหมือนที่ผ่านมา ก็พอแล้ว 🌟", "author": "Cloudy-Puk-Jai" },
        { "text": "เธออย่าคิดว่าตัวเองไม่เก่งเลยนะ เธอผ่านมาได้ขนาดนี้ เธอเก่งมาก ๆ แล้ว 💕", "author": "Anonymous" },
        { "text": "เธอเดินมาไกลมากแล้ว อย่าลืมกลับไปขอบคุณตัวเองด้วยนะ 🙏", "author": "Cloudy-Puk-Jai" },
        { "text": "วันนี้จะรู้สึกผิดหวังบ้างก็ไม่เป็นไร เราเชื่อว่าเธอทำเต็มที่ที่สุดแล้ว 💖", "author": "Anonymous" },
        { "text": "เธอเริ่มต้นใหม่ได้เสมอ ไม่มีวันสายสำหรับการเริ่มต้น 🌈", "author": "Cloudy-Puk-Jai" },
        { "text": "You can do it! 🚀", "author": "Anonymous" },
        { "text": "ขอบคุณคนอื่นมาเยอะแล้ว อย่าลืมขอบคุณตัวเองด้วยนะ 💕", "author": "Cloudy-Puk-Jai" },
        { "text": "อย่าลืมว่าแม้วันที่เหนื่อยที่สุด ก็ยังมีความหวังเล็ก ๆ รออยู่เสมอ 🌟", "author": "Anonymous" },
        { "text": "ทุกก้าวเล็ก ๆ ที่เธอเดิน คือความกล้าหาญที่ยิ่งใหญ่ 💪", "author": "Cloudy-Puk-Jai" },
        { "text": "เธอไม่จำเป็นต้องสมบูรณ์แบบ แค่เป็นตัวเองในแบบที่ดีที่สุดก็พอ 💖", "author": "Anonymous" },
        { "text": "เมื่อเธอล้มลง จงมองว่ามันคือโอกาสที่จะลุกขึ้นอย่างแข็งแรงกว่าเดิม 🔥", "author": "Cloudy-Puk-Jai" },
        { "text": "อย่าลืมยิ้มให้กับตัวเอง เพราะรอยยิ้มของเธอคือพลังที่สวยงาม 🌸", "author": "Anonymous" },
        { "text": "ทุกวันที่เธอผ่านไปได้ คือหลักฐานว่าเธอเข้มแข็งกว่าที่คิด 🌟", "author": "Cloudy-Puk-Jai" },
        { "text": "เธอมีคุณค่าเสมอ ไม่ว่าคนอื่นจะเห็นหรือไม่ เพราะหัวใจของเธอรู้ดีที่สุด 💕", "author": "Anonymous" },
        { "text": "ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น", "author": "Anonymous ✨" },
        { "text": "ล้มได้ แต่ต้องลุกให้ได้", "author": "Anonymous 🖤" },
        { "text": "อย่าหยุดเมื่อเหนื่อย จงหยุดเมื่อสำเร็จ", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "เชื่อในตัวเอง แล้วโลกจะเชื่อคุณ", "author": "Anonymous Soul" },
        { "text": "ทุกเช้าวันใหม่คือโอกาสใหม่", "author": "Anonymous ✨" },
        { "text": "ความล้มเหลวคือครูที่ดีที่สุด", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "ไม่มีอะไรยิ่งใหญ่ได้ หากไม่เริ่มจากก้าวเล็ก ๆ", "author": "Anonymous 🖤" },
        { "text": "ความสุขไม่ได้อยู่ที่ปลายทาง แต่อยู่ที่การเดินทาง", "author": "Anonymous Soul" },
        { "text": "ทุกปัญหามีทางออกเสมอ", "author": "Anonymous ✨" },
        { "text": "ความฝันจะไม่มีวันสำเร็จ หากไม่ลงมือทำ", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "จงใช้ความล้มเหลวเป็นแรงผลักดัน", "author": "Anonymous 🖤" },
        { "text": "ความสำเร็จเริ่มต้นจากความเชื่อมั่น", "author": "Anonymous Soul" },
        { "text": "ไม่มีใครกำหนดชีวิตคุณได้นอกจากตัวคุณเอง", "author": "Anonymous ✨" },
        { "text": "อย่าหยุดฝัน เพราะฝันคือพลังชีวิต", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "ความกล้าคือก้าวแรกสู่ความสำเร็จ", "author": "Anonymous 🖤" },
        { "text": "จงทำวันนี้ให้ดีที่สุด แล้วพรุ่งนี้จะดีเอง", "author": "Anonymous Soul" },
        { "text": "ความหวังเล็ก ๆ สามารถเปลี่ยนชีวิตได้", "author": "Anonymous ✨" },
        { "text": "จงยิ้มแม้ในวันที่เหนื่อยที่สุด", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "ความเข้มแข็งไม่ได้เกิดจากการไม่ล้ม แต่เกิดจากการลุกขึ้นทุกครั้ง", "author": "Anonymous 🖤" },
        { "text": "อย่ารอให้โอกาสมา จงสร้างมันขึ้นมาเอง", "author": "Anonymous Soul" },
        { "text": "ทุกการเดินทางเริ่มต้นจากก้าวแรกเสมอ", "author": "Anonymous ✨" },
        { "text": "ความสุขคือการเลือกที่จะมองโลกในแง่ดี", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "อย่าหยุดเรียนรู้ เพราะชีวิตคือการเติบโต", "author": "Anonymous 🖤" },
        { "text": "จงเชื่อว่าคุณทำได้ แม้ใครจะบอกว่าคุณทำไม่ได้", "author": "Anonymous Soul" },
        { "text": "ความสำเร็จไม่ใช่เรื่องบังเอิญ แต่คือผลจากความพยายาม", "author": "Anonymous ✨" },
        { "text": "ความภูมิใจที่ดีที่สุด คือการทำทุกอย่างด้วยตัวเองแล้วประสบความสำเร็จ", "author": "Cloudy-Puk-Jai 💕" },
        { "text": "ถ้าใจพร้อม กายพร้อม ก็ลุยเลย", "author": "Anonymous 🖤" },
        { "text": "ซื่อกินไม่หมด คดกินไม่นาน", "author": "Anonymous Soul" },
        { "text": "ทุกคนสามารถทำได้ทุกอย่าง แต่อยู่ที่ว่าคุณจะทำหรือไม่ทำ", "author": "Anonymous ✨" },
        { "text": "ความหวังทำให้เรามีแรงเดินต่อไป", "author": "Cloudy-Puk-Jai 💕" }
        ],
        
        // Computed Properties
        get mentalAssessments() {
            return this.assessmentsData.filter(a => a.type === 'mental');
        },

        get personalityAssessments() {
            return this.assessmentsData.filter(a => a.type === 'personality');
        },



        // Methods
    acceptTerms() {
    if (this.agreedToTerms) {
        localStorage.setItem('agreedToTerms', 'true');
        this.modalOpen = null;
        
        // แสดงข้อความแบบเบาๆ
        const msg = document.createElement('div');
        msg.textContent = 'ยินดีต้อนรับ 🌸';
        msg.className = 'fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded z-50';
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2000);
        
    } else {
        const msg = document.createElement('div');
        msg.textContent = 'กรุณายอมรับข้อตกลง';
        msg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-50';
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2000);
    }
},


        // Methods
        async init() {

            // สุ่มคำคมตอนเริ่มต้น
            this.showRandomQuote(); 


            // ตั้งค่า dark mode
            this.darkMode = localStorage.getItem('darkMode') === 'true' || 
                           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            // +++ เพิ่มโค้ดนี้เข้าไปใน init() +++
    // ตรวจสอบว่าผู้ใช้เคยเห็น Welcome Modal หรือยัง
    const savedAgreement = localStorage.getItem('agreedToTerms');
    console.log('Saved agreement from localStorage:', savedAgreement);
    
    if (savedAgreement !== 'true') {
        // ถ้ายังไม่เคยเห็น ให้แสดง modal
        setTimeout(() => {
            this.modalOpen = 'welcome';
            console.log('Showing welcome modal for new user');
        }, 1000);
    } else {
        // ถ้าเคยเห็นแล้ว
        this.agreedToTerms = true;
        console.log('User has already agreed to terms');
    }
    // +++ จบโค้ดที่เพิ่ม +++



            // โหลดข้อมูลจาก localStorage
            const savedData = JSON.parse(localStorage.getItem('mindbloomData') || '{}');
            this.journalEntries = savedData.journalEntries || [];
            this.assessmentHistory = savedData.assessmentHistory || [];
            this.tree = savedData.tree || this.tree;
            
            // โหลดคำคมประจำวัน
            this.setDailyQuote();
            
            // โหลดข้อมูลจาก JSON files
            await this.loadData();


            // ตรวจสอบถ้ามีการส่งต่อมาจาก history page
            const urlParams = new URLSearchParams(window.location.search);
            const viewHistoryId = urlParams.get('viewHistory');
                if (viewHistoryId) {
            const historyToView = JSON.parse(localStorage.getItem('viewHistoryDetail'));
                if (historyToView) {
            this._viewHistoryDetail(historyToView);
            localStorage.removeItem('viewHistoryDetail');
                }
            }
            
            // ตั้งค่าขนาดฟอนต์
            this.fontSize = localStorage.getItem('fontSize') || 'medium';
            
            // ตั้งค่าความคมชัดสูง
            this.highContrast = localStorage.getItem('highContrast') === 'true';
            
            // อัพเดท tree animation
            this.updateTreeAnimation();
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
        
       // คำคม functions
       // ฟังก์ชันเดิมของคุณ
    setDailyQuote() {
        const today = new Date().getDate();
        const quoteIndex = today % this.quotes.length;
        this.dailyQuote = this.quotes[quoteIndex];
    },

    // === ฟังก์ชันใหม่ที่เพิ่ม ===
    // ฟังก์ชันสุ่มคำคม
    getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[randomIndex];
    },

    // ฟังก์ชันแสดงคำคมสุ่ม
    showRandomQuote() {
        this.randomQuote = this.getRandomQuote();
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


        // History Functions
viewHistoryDetail(history) {
    // เก็บข้อมูลที่จะดูใน localStorage
    localStorage.setItem('viewHistoryDetail', JSON.stringify(history));
    // เปิดหน้า index.html เพื่อดูรายละเอียด
    window.location.href = `index.html?viewHistory=${history.id}`;
},

// ฟังก์ชันช่วยในการดูประวัติ
_viewHistoryDetail(history) {
    const assessment = this.assessmentsData.find(a => a.id === history.id);
    if (assessment) {
        this.currentQuiz = assessment;
        this.quizScore = history.score;
        
        // หาผลลัพธ์ที่ตรงกับคะแนน
        for (const result of assessment.results) {
            if (history.score >= result.min && history.score <= result.max) {
                this.quizResult = result;
                break;
            }
        }
        
        this.currentPage = 'results';
    } else {
        alert('ไม่พบข้อมูลแบบทดสอบ');
    }
},

        
        getMoodEmoji(moodId) {
            const mood = this.moods.find(m => m.id === moodId);
            return mood ? mood.emoji : '😐';
        },



        // ===== เพิ่มฟังก์ชัน ประวัติ=====
getAverageScore() {
    if (!this.assessmentHistory || this.assessmentHistory.length === 0) return 0;
    const sum = this.assessmentHistory.reduce((total, h) => total + h.score, 0);
    return Math.round(sum / this.assessmentHistory.length);
},

getBestScore() {
    if (!this.assessmentHistory || this.assessmentHistory.length === 0) return 0;
    return Math.max(...this.assessmentHistory.map(h => h.score));
},

getLastTestDate() {
    if (!this.assessmentHistory || this.assessmentHistory.length === 0) return 'ยังไม่มี';
    const lastTest = this.assessmentHistory[0];
    return this.formatDate(lastTest.date);
},
// ===== จบฟังก์ชันใหม่ =====







        
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
            // ตรวจสอบว่าเป็นบทความภายนอกหรือไม่
            if (article.type === 'external' || article.content.includes('href=')) {
                // แสดง modal ยืนยันการเปิดลิงก์ภายนอก
                this.currentArticle = article;
                this.modalOpen = 'externalArticle';
                return;
            }
            
            // ถ้าเป็นบทความภายใน ให้เปิด modal ธรรมดา
            this.currentArticle = article;
            this.modalOpen = 'article';
        },
        
        openExternalArticle(url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            this.closeModal();
        },





        
        // Assessment Functions
        getAssessmentIcon(assessmentId) {
    const icons = {
        // Mental Health Tests
        'who5': '😊',
        'pss10': '😰',
        'gad7': '😟',
        'phq9': '😔',
        'burnout': '🔥',
        'self-compassion': '❤️',
        'resilience': '💪',
        'emotional-awareness': '🧠',
        
        // Personality Tests
        'mbti': '🎭',
        'big-five': '🌟',
        'enneagram': '🌀',
        'love-language': '💝',
        'attachment-style': '🤝',
        'conflict-style': '⚡',
        'leadership-style': '👑',
        'creativity': '🎨'
    };
    return icons[assessmentId] || '📝';
},

getAssessmentCategory(type) {
    const categories = {
        'mental': 'สุขภาพจิต',
        'personality': 'บุคลิกภาพ'
    };
    return categories[type] || type;
},
        
        getAssessmentCategory(type) {
            return type === 'mental' ? 'สุขภาพจิต' : 'บุคลิกภาพ';
        },
        

        
        // ฟังก์ชันแจ้งเตือน
        showNotification(message, type = 'info') {
            // สร้าง element สำหรับ notification
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
                type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
            }`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} mr-3"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // ลบ notification หลังจาก 3 วินาที
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        },

            startAssessment(assessment) {
                // ตรวจสอบว่า assessment มีข้อมูลครบหรือไม่
            if (!assessment || !assessment.questions || assessment.questions.length === 0) {
                alert('ไม่พบคำถามสำหรับแบบทดสอบนี้ กรุณาลองใหม่ในภายหลัง');
                return;
            }
            
            this.currentQuiz = assessment;
            this.currentQuestionIndex = 0;
            this.quizAnswers = new Array(assessment.questions.length).fill(undefined);
            this.quizScore = 0;
            this.quizResult = {};
            this.resultAutoSaved = false; // <-- เพิ่มบรรทัดนี้
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
                
                // บันทึกผลอัตโนมัติก่อนแสดงผล <-- เพิ่มบรรทัดนี้
                this.autoSaveAssessmentResult();
                
                // Save general data
                this.saveData();
                
                // Show results
                this.currentPage = 'results';
            }
        },
        
        retakeQuiz() {
            this.resultAutoSaved = false; // <-- เพิ่มบรรทัดนี้
            this.startAssessment(this.currentQuiz)
        },
        
                saveAssessmentResult() {
            // ถ้ายังไม่ได้บันทึกอัตโนมัติ ให้บันทึก
            if (!this.resultAutoSaved) {
                this.autoSaveAssessmentResult();
                alert('บันทึกผลการทดสอบเรียบร้อยแล้ว!');
            } else {
                alert('ผลการทดสอบถูกบันทึกไว้แล้ว!');
            }
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
        


        autoSaveAssessmentResult() {
            if (this.resultAutoSaved) return;
            
            const result = {
                id: this.currentQuiz.id,
                title: this.currentQuiz.title,
                score: this.quizScore,
                result: this.quizResult.title,
                resultAdvice: this.quizResult.advice || '',
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                formattedDate: new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // เพิ่มเข้าในประวัติ (unshift เพื่อให้ใหม่สุดอยู่บน)
            this.assessmentHistory.unshift(result);
            
            // บันทึกลง localStorage
            this.saveData();
            
            // อัปเดตสถานะ
            this.resultAutoSaved = true;
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