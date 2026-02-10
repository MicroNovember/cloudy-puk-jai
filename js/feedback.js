// Feedback Form JavaScript
function feedbackApp() {
    return {
        darkMode: false,
        currentStep: 1,
        totalSteps: 6,
        submitting: false,
        
        form: {
            atmosphere: 0,
            usability: 0,
            favoriteFeatures: [],
            improvements: '',
            futureFeatures: ''
        },
        
        features: [
            {
                id: 'mood',
                name: 'บันทึกความรู้สึก',
                description: 'บันทึกความรู้สึกและสิ่งดีๆ ในแต่ละวัน',
                icon: 'fas fa-book'
            },
            {
                id: 'music',
                name: 'ผ่อนคลายด้วยเพลง',
                description: 'ฟังเพลงและพอดแคสต์เพื่อผ่อนคลาย',
                icon: 'fas fa-music'
            },
            {
                id: 'articles',
                name: 'ความรู้เพื่อสุขภาพจิต',
                description: 'บทความและเทคนิคดูแลสุขภาพจิต',
                icon: 'fas fa-book-open'
            },
            {
                id: 'assessments',
                name: 'แบบทดสอบ',
                description: 'ประเมินสุขภาพจิตและบุคลิกภาพ',
                icon: 'fas fa-clipboard-check'
            },
            {
                id: 'breathing',
                name: 'Breathing Buddy',
                description: 'ฝึกหายใจและสร้างสมาธิในเวลาสั้นๆ',
                icon: 'fas fa-wind'
            }
        ],
        
        quickSuggestions: [
            'การแจ้งเตือนรายวัน',
            'ระบบ community/พูดคุย',
            'เกมส์บำบัด',
            'tracking นอนหลับ',
            'meditation แบบ guided',
            'journaling แบบมี template',
            'ระบบ reward/achievement',
            'integration กับ wearable devices'
        ],
        
        init() {
            // Initialize theme
            this.darkMode = localStorage.getItem('darkMode') === 'true';
            
            // Load saved form data
            this.loadSavedData();
        },
        
        toggleTheme() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },
        
        loadSavedData() {
            const saved = localStorage.getItem('feedbackFormData');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this.form, data);
            }
        },
        
        saveData() {
            localStorage.setItem('feedbackFormData', JSON.stringify(this.form));
        },
        
        nextStep() {
            if (this.canProceed()) {
                this.saveData();
                this.currentStep++;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        previousStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        canProceed() {
            switch (this.currentStep) {
                case 1:
                    return this.form.atmosphere > 0;
                case 2:
                    return this.form.usability > 0;
                case 3:
                    return this.form.favoriteFeatures.length > 0;
                case 4:
                    return true; // Optional
                case 5:
                    return true; // Optional
                default:
                    return true;
            }
        },
        
        getRatingText(rating) {
            const texts = {
                1: 'ไม่ดี',
                2: 'พอใช้',
                3: 'ปานกลาง',
                4: 'ดี',
                5: 'ดีเยี่ยม'
            };
            return texts[rating] || '';
        },
        
        getFeatureName(featureId) {
            const feature = this.features.find(f => f.id === featureId);
            return feature ? feature.name : featureId;
        },
        
        addSuggestion(suggestion) {
            if (this.form.futureFeatures) {
                this.form.futureFeatures += ', ' + suggestion;
            } else {
                this.form.futureFeatures = suggestion;
            }
        },
        
        async submitFeedback() {
            this.submitting = true;
            
            try {
                // Get current user (if logged in)
                const user = this.getCurrentUser();
                
                // Prepare feedback data
                const feedbackData = {
                    ...this.form,
                    userId: user ? user.uid : 'anonymous',
                    userEmail: user ? user.email : null,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    version: '1.0.0',
                    sessionId: this.getSessionId()
                };
                
                // Save to Firebase (or localStorage for demo)
                await this.saveFeedback(feedbackData);
                
                // Clear saved data
                localStorage.removeItem('feedbackFormData');
                
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'ขอบคุณมากครับ!',
                    text: 'ความคิดเห็นของคุณมีคุณค่าต่อการพัฒนาแอปของเรา',
                    confirmButtonText: 'กลับสู่หน้าหลัก',
                    confirmButtonColor: '#6D9F71'
                });
                
                // Redirect back
                this.goBack();
                
            } catch (error) {
                console.error('Error submitting feedback:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง',
                    confirmButtonColor: '#6D9F71'
                });
            } finally {
                this.submitting = false;
            }
        },
        
        getCurrentUser() {
            // Try to get current user from Firebase Auth
            try {
                // This would work if Firebase Auth is initialized
                return firebase.auth().currentUser;
            } catch (error) {
                return null;
            }
        },
        
        getSessionId() {
            let sessionId = sessionStorage.getItem('feedbackSessionId');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('feedbackSessionId', sessionId);
            }
            return sessionId;
        },
        
        async saveFeedback(data) {
            try {
                // Try to save to Firebase Firestore
                const db = firebase.firestore();
                await db.collection('feedback').add(data);
            } catch (error) {
                console.log('Firebase not available, saving to localStorage');
                
                // Fallback to localStorage
                let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
                feedbacks.push(data);
                localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            }
        },
        
        goBack() {
            // Go back to previous page or main menu
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'main-menu.html';
            }
        }
    };
}
