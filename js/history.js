// history.js - เวอร์ชันแก้ไขปัญหา
console.log('history.js กำลังโหลด...');

// ตัวแปร global
let historyData = [];
let isExportingPDF = false;

// ==================== PAGE INITIALIZATION ====================

// โหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: กำลังโหลดประวัติ...');
    
    // เรียกใช้ฟังก์ชันเริ่มต้น
    initializePage();
    
    // เปิดฟังก์ชันให้เรียกจาก HTML ได้
    window.refreshHealthOverview = refreshHealthOverview;
    window.viewDetails = viewDetails;
    window.deleteItem = deleteItem;
    window.showNotification = showNotification;
    window.exportJSON = exportJSON;
    window.exportPDF = exportPDF;
    window.printReport = printReport;
    window.clearAllHistory = clearAllHistory;
    window.clearCorruptedData = clearCorruptedData;
    
    console.log('History page fully loaded');
});

// ฟังก์ชันดูรายละเอียด
function viewDetails(index) {
    console.log('viewDetails called with index:', index);
    
    const item = historyData[index];
    
    if (!item) {
        console.log('Item not found at index:', index);
        showNotification('ไม่พบข้อมูลรายการที่เลือก', 'error');
        return;
    }
    
    console.log('Viewing details for:', item);
    
    // สร้าง modal สำหรับแสดงรายละเอียด
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-primary">รายละเอียดการทดสอบ</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">ชื่อแบบทดสอบ:</label>
                    <p class="text-gray-600 dark:text-gray-400">${item.quizTitle || 'ไม่มีข้อมูล'}</p>
                </div>
                
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">วันที่ทำ:</label>
                    <p class="text-gray-600 dark:text-gray-400">${item.date ? new Date(item.date).toLocaleString('th-TH') : 'ไม่มีข้อมูล'}</p>
                </div>
                
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">คะแนน:</label>
                    <p class="text-gray-600 dark:text-gray-400">${item.score || 'ไม่มีข้อมูล'}%</p>
                </div>
                
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">ผลลัพธ์:</label>
                    <p class="text-gray-600 dark:text-gray-400">${item.result || 'ไม่มีข้อมูล'}</p>
                </div>
                
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">ประเภท:</label>
                    <p class="text-gray-600 dark:text-gray-400">${item.quizId || 'ไม่มีข้อมูล'}</p>
                </div>
                
                ${item.answers ? `
                <div>
                    <label class="font-semibold text-gray-700 dark:text-gray-300">คำตอบ:</label>
                    <div class="mt-2 space-y-2">
                        ${item.answers.map((answer, idx) => `
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                <span class="text-sm">ข้อ ${idx + 1}: ${answer || 'ไม่ตอบ'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
                    ปิด
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ฟังก์ชันเริ่มต้นหน้าเว็บ
async function initializePage() {
    console.log('Initializing history page...');
    
    try {
        // 1. Set up event listeners first
        console.log('1. Setting up event listeners...');
        setupEventListeners();
        
        // 2. Initialize health overview tips
        console.log('2. Initializing health overview tips...');
        initHealthOverviewTips();
        
        // 3. Update last update time
        console.log('3. Updating last update time...');
        updateLastUpdateTime();
        
        // 4. Wait for app.js to be ready and load history data
        console.log('4. Waiting for app.js to be ready...');
        
        // Wait a bit for app.js to initialize
        setTimeout(async () => {
            console.log('5. Loading history data from app.js...');
            await loadHistoryData();
            console.log('6. History data loaded, data length:', historyData.length);
            
            // 7. Update UI with loaded data
            console.log('7. Updating UI with history data...');
            updateUI();
            
            // 8. Load last test date
            console.log('8. Loading last test date...');
            loadLastTestDate();
            
            console.log('Page initialization complete');
        }, 1000); // Wait 1 second for app.js to initialize
        
    } catch (error) {
        console.error('initializePage error:', error);
        showNotification('เกิดข้อผิดพลาดในการเริ่มต้นหน้า: ' + error.message, 'error');
    }
}

// ==================== DATA MANAGEMENT ====================

// ตัวแปรสำหรับแยกข้อมูล guest และ user
let guestHistoryData = [];
let userHistoryData = [];

// ฟังก์ชันสำหรับบันทึกข้อมูลลง localStorage
function saveHistoryData() {
    try {
        const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
        
        if (user && user.isGuest) {
            // Guest user - บันทึกลง localStorage สำหรับ guest
            const storageKey = 'mindbloomData_guest';
            const data = {
                assessmentHistory: guestHistoryData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log('บันทึกข้อมูล guest ลง localStorage เรียบร้อย');
        } else {
            // Logged in user - บันทึกลง localStorage สำหรับ user (backup)
            const storageKey = 'mindbloomData_user';
            const data = {
                assessmentHistory: userHistoryData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log('บันทึกข้อมูล user ลง localStorage เรียบร้อย');
        }
        
        return true;
    } catch (error) {
        console.error('ไม่สามารถบันทึกข้อมูลลง localStorage:', error);
        return false;
    }
}

// Global decryption function reference
let decryptFunction = null;

// Set decryption function when app.js is ready
function setDecryptFunction(fn) {
    decryptFunction = fn;
}

// โหลดข้อมูลประวัติ
async function loadHistoryData() {
    console.log('loadHistoryData: กำลังโหลดข้อมูล...');
    
    try {
        const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
        
        if (user && user.isGuest) {
            console.log('Guest user detected, loading from localStorage...');
            loadHistoryFromLocalStorage();
            // ใช้ข้อมูล guest สำหรับ historyData
            console.log('guestHistoryData after loading:', guestHistoryData.length, 'items');
            historyData = guestHistoryData;
            console.log('historyData assigned from guestHistoryData:', historyData.length, 'items');
            return historyData;
        }
        
        // Try to load directly from Firebase first for logged-in users
        if (window.db && window.AuthUtils && window.AuthUtils.getCurrentUser() && !window.AuthUtils.getCurrentUser().isGuest) {
            console.log('Loading directly from Firebase...');
            return await loadHistoryFromFirebase();
        }
        
        // Fallback: Get data from app.js Alpine store
        let app = Alpine.store('mindbloomApp');
        let retries = 0;
        const maxRetries = 10;
        
        // Wait for Alpine store to be available
        while (!app && retries < maxRetries) {
            console.log(`Waiting for Alpine store... attempt ${retries + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 100));
            app = Alpine.store('mindbloomApp');
            retries++;
        }
        
        console.log('Alpine store found:', !!app);
        console.log('app.assessmentHistory:', app ? app.assessmentHistory : 'undefined');
        console.log('app.assessmentHistory length:', app && app.assessmentHistory ? app.assessmentHistory.length : 'N/A');
        
        if (app && app.assessmentHistory && app.assessmentHistory.length > 0) {
            console.log('โหลดข้อมูลจาก app.js:', app.assessmentHistory.length, 'รายการ');
            
            // Update the userHistoryData array with data from app.js
            userHistoryData = app.assessmentHistory.map(assessment => ({
                title: assessment.title || 'ไม่ระบุชื่อแบบทดสอบ',
                score: assessment.score || 0,
                result: assessment.result || 'ไม่มีผลลัพธ์',
                date: assessment.completedAt ? 
                    (typeof assessment.completedAt.toDate === 'function' ? 
                        assessment.completedAt.toDate().toISOString() : 
                        assessment.completedAt) : 
                    new Date().toISOString(),
                quizId: assessment.quizId || 'unknown',
                answers: Array.isArray(assessment.answers) ? assessment.answers : [],
                id: assessment.id || Date.now().toString()
            }));
            
            // ใช้ข้อมูล user สำหรับ historyData
            historyData = userHistoryData;
            console.log('อัปเดต historyData จาก app.js:', historyData.length, 'รายการ');
        } else {
            console.warn('ไม่พบข้อมูลจาก app.js');
        }
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        historyData = [];
    }
    
    return historyData;
}

// โหลดข้อมูลจาก localStorage (สำหรับ guest)
function loadHistoryFromLocalStorage() {
    try {
        const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
        const storageKey = 'mindbloomData_guest'; // ใช้เฉพาะ key สำหรับ guest
        
        console.log('กำลังโหลดข้อมูล guest จาก localStorage...', 'storageKey:', storageKey);
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
            console.log('🔍 Raw savedData:', savedData.substring(0, 200) + '...');
            console.log('🔍 savedData startsWith Q:', savedData.startsWith('Q'));
            console.log('🔍 savedData matches base64 pattern:', savedData.match(/^[A-Za-z0-9+/=]+$/));
            
            try {
                // Try to decrypt data first (from app.js encryption)
                let data;
                try {
                    // Check if data is encrypted (starts with specific pattern)
                    if (savedData.startsWith('Q') || savedData.match(/^[A-Za-z0-9+/=]+$/)) {
                        console.log('🔐 Attempting to decrypt data...');
                        // Try to decrypt using global decrypt function
                        if (decryptFunction && typeof decryptFunction === 'function') {
                            data = decryptFunction(savedData);
                            console.log('✅ Decryption successful, data type:', typeof data);
                            // After decryption, data might still be a string, so parse it
                            if (typeof data === 'string') {
                                console.log('🔄 Parsing decrypted string to object...');
                                data = JSON.parse(data);
                                console.log('✅ Parsed decrypted data, type:', typeof data);
                            }
                        } else {
                            console.log('⚠️ No decrypt function available, trying direct parse');
                            // Fallback: try direct parse
                            data = JSON.parse(savedData);
                        }
                    } else {
                        console.log('📄 Data appears to be plain JSON, parsing directly...');
                        data = JSON.parse(savedData);
                    }
                } catch (decryptError) {
                    console.warn('❌ Decryption failed, trying direct parse:', decryptError);
                    data = JSON.parse(savedData);
                }
                
                console.log('ข้อมูล guest ที่โหลดได้จาก localStorage:', data);
                
                // ตรวจสอบและแปลงข้อมูลให้ถูกต้อง
                console.log('🔍 Data structure analysis:');
                console.log('- data.assessmentHistory exists:', !!data.assessmentHistory);
                console.log('- data.assessmentHistory type:', typeof data.assessmentHistory);
                console.log('- Is Array?', Array.isArray(data.assessmentHistory));
                console.log('- data.assessmentHistory length:', data.assessmentHistory ? data.assessmentHistory.length : 'N/A');
                
                if (data.assessmentHistory) {
                    // ถ้าเป็น array อยู่แล้ว
                    if (Array.isArray(data.assessmentHistory)) {
                        guestHistoryData = data.assessmentHistory;
                        console.log('✅ guestHistoryData assigned from assessmentHistory:', guestHistoryData.length, 'items');
                    } 
                    // ถ้าเป็น object เดี่ยว ให้แปลงเป็น array
                    else if (typeof data.assessmentHistory === 'object' && data.assessmentHistory !== null) {
                        guestHistoryData = [data.assessmentHistory];
                    }
                } 
                // ถ้าไม่มี assessmentHistory แต่มีข้อมูลโดยตรงใน data (guest data structure)
                else if (Array.isArray(data)) {
                    // กรองเอาเฉพาะ assessment จาก array แต่ตรวจสอบว่าเป็น array ของ assessments หรือ object ที่มี assessmentHistory
                    if (data.length > 0 && typeof data[0] === 'object' && (data[0].quizId || data[0].assessmentId || data[0].id)) {
                        // กรณีอีน data เป็น array ของ assessments
                        guestHistoryData = data;
                    } else {
                        // กรณีอีน data เป็น object ที่มี assessmentHistory
                        const assessments = data.filter(item => 
                            item && (item.quizId || item.assessmentId || item.id)
                        );
                        guestHistoryData = assessments;
                    }
                    
                    console.log('Filtered guest assessments count:', guestHistoryData.length);
                } else {
                    // ถ้าเป็น object เดี่ยวที่ไม่มี assessmentHistory
                    if (typeof data === 'object' && data !== null) {
                        // ตรวจสอบว่าเป็น assessment หรือไม่
                        if (data.quizId || data.assessmentId || data.id) {
                            guestHistoryData = [data];
                        }
                    }
                }
            } catch (jsonError) {
                console.error('เกิดข้อผิดพลาดในการแปลงข้อมูล JSON จาก localStorage:', jsonError);
                console.log('กำลังล้างข้อมูลที่อาจเสียหาย...');
                // ล้างข้อมูลที่เสียหาย
                localStorage.removeItem(storageKey);
                guestHistoryData = [];
            }
        } else {
            console.log('ไม่พบข้อมูล guest ใน localStorage');
            guestHistoryData = [];
        }
        console.log('🏁 Final guestHistoryData length:', guestHistoryData.length);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดจาก localStorage:', error);
        guestHistoryData = [];
    }
}
async function loadHistoryFromFirebase() {
    if (!window.db) {
        console.warn('Firebase Firestore not available');
        throw new Error('Firebase not available');
    }

    try {
        const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
        if (!user || user.isGuest) {
            console.warn('User not authenticated or is guest, using localStorage');
            throw new Error('User not authenticated');
        }

        console.log('🔄 กำลังโหลดข้อมูลจาก Firebase...');
        const assessmentSnapshot = await window.db
            .collection('users')
            .doc(user.uid)
            .collection('assessments')
            .orderBy('completedAt', 'desc')
            .limit(50)
            .get();

        if (assessmentSnapshot.empty) {
            console.log('⚠️ ไม่พบข้อมูลใน Firebase');
            historyData = [];
            return [];
        }

        const assessments = assessmentSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                // เก็บ reference ไปยัง document
                _ref: doc.ref
            }))
            .filter(assessment => assessment.id !== 'init');

        console.log('📥 ได้รับข้อมูลจาก Firebase:', assessments.length, 'รายการ');
        
        // แปลงข้อมูลให้ตรงกับรูปแบบที่ต้องการ
        const formattedData = assessments.map(assessment => {
            // ตรวจสอบและแปลงวันที่ให้ถูกต้อง
            let dateValue = assessment.completedAt || assessment.date || assessment.timestamp;
            if (dateValue && typeof dateValue.toDate === 'function') {
                dateValue = dateValue.toDate().toISOString();
            } else if (!dateValue) {
                dateValue = new Date().toISOString();
            }

            return {
                title: assessment.title || assessment.quizTitle || 'ไม่ระบุชื่อแบบทดสอบ',
                score: assessment.score || 0,
                result: assessment.result || assessment.interpretation || 'ไม่มีผลลัพธ์',
                date: dateValue,
                quizId: assessment.quizId || assessment.assessmentId || 'unknown',
                answers: Array.isArray(assessment.answers) ? assessment.answers : [],
                id: assessment.id,
                // เก็บข้อมูลต้นฉบับเพื่อใช้ในภายหลัง
                _raw: assessment
            };
        });
        
        // อัปเดตข้อมูลใน historyData
        historyData = formattedData;
        
        // อัปเดต userHistoryData ด้วย
        userHistoryData = formattedData;
        
        // บันทึกลง localStorage เป็นข้อมูลสำรอง
        saveHistoryData();
        
        console.log('✅ โหลดข้อมูลจาก Firebase สำเร็จ:', historyData.length, 'รายการ');
        console.log('ตัวอย่างข้อมูล:', JSON.stringify(historyData[0], null, 2));
        
        // อัปเดต UI
        updateUI();
        
        return historyData;

    } catch (error) {
        console.error('❌ ไม่สามารถโหลดข้อมูลจาก Firebase:', error);
        throw error; // Let caller handle fallback
    }
}

// ฟังก์ชันสำหรับล้างข้อมูลที่เสียหาย
function clearCorruptedData() {
    try {
        const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
        const storageKey = user && user.isGuest ? 'mindbloomData_guest' : 'mindbloomData_user';
        
        localStorage.removeItem(storageKey);
        
        // ล้างตัวแปรที่เกี่ยวข้องด้วย
        if (user && user.isGuest) {
            guestHistoryData = [];
        } else {
            userHistoryData = [];
        }
        
        console.log('Cleared corrupted data from localStorage');
        showNotification('ล้างข้อมูลที่เสียหายเรียบร้อยแล้ว', 'success');
        
        // โหลดข้อมูลใหม่
        loadHistoryData();
    } catch (error) {
        console.error('Error clearing corrupted data:', error);
        showNotification('ไม่สามารถล้างข้อมูลที่เสียหาย', 'error');
    }
}

// ==================== UI UPDATES ====================

// อัปเดต UI
function updateUI() {
    console.log('updateUI: กำลังอัปเดต UI...');
    console.log('จำนวนข้อมูลใน historyData:', historyData.length);
    console.log('ตัวอย่างข้อมูลรายการแรก:', historyData.length > 0 ? JSON.stringify(historyData[0], null, 2) : 'ไม่มีข้อมูล');
    
    try {
        console.log('Updating test type summary...');
        updateTestTypeSummary();
        
        console.log('Updating mental health overview...');
        updateMentalHealthOverview();
        
        console.log('Updating history table...');
        updateHistoryTable();
        
        console.log('Updating last test date...');
        updateLastTestDate();
        
        // ซ่อน/แสดงปุ่มล้างประวัติ
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.style.display = historyData.length > 0 ? 'flex' : 'none';
        }
        
        console.log('updateUI: สำเร็จ');
    } catch (error) {
        console.error('updateUI error:', error);
        console.error('Error details:', error.message);
        showNotification('เกิดข้อผิดพลาดในการอัปเดต UI: ' + error.message, 'error');
    }
}

// อัปเดตวันที่ทดสอบล่าสุด
function updateLastTestDate() {
    try {
        const lastTestDateElement = document.getElementById('lastTestDate');
        if (lastTestDateElement && historyData.length > 0) {
            // เรียงข้อมูลตามวันที่ล่าสุด
            const sortedData = [...historyData].sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp || 0);
                const dateB = new Date(b.date || b.timestamp || 0);
                return dateB - dateA;
            });
            
            const lastTest = sortedData[0];
            const date = new Date(lastTest.date || lastTest.timestamp || lastTest.completedAt);
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                lastTestDateElement.textContent = formattedDate;
            } else {
                lastTestDateElement.textContent = '-';
            }
        } else if (lastTestDateElement) {
            lastTestDateElement.textContent = '-';
        }
    } catch (error) {
        console.error('updateLastTestDate error:', error);
    }
}

// อัปเดตเวลาอัปเดตล่าสุด
function updateLastUpdateTime() {
    try {
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
            lastUpdateElement.textContent = timeString;
        }
    } catch (error) {
        console.error('updateLastUpdateTime error:', error);
    }
}

// ==================== DASHBOARD ====================

function updateMentalHealthOverview() {
    const container = document.getElementById('mentalHealthOverview');
    if (!container) return;
    
    console.log('updateMentalHealthOverview: กำลังอัปเดต...');
    
    if (historyData.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-heart text-2xl text-gray-300 mb-2"></i>
                <p class="text-gray-500 text-sm">ยังไม่มีข้อมูลสุขภาพจิตภาพรวม</p>
                <p class="text-gray-400 text-xs mt-1">ทำแบบทดสอบเพื่อดูสุขภาพจิตภาพรวมของคุณ</p>
            </div>
        `;
        return;
    }
    
    try {
        const analysis = analyzeMentalHealth();
        
        let html = `
            <div class="grid grid-cols-3 gap-2 mb-4">
                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-bold text-green-600 dark:text-green-400">${analysis.totalTests}</div>
                    <div class="text-xs text-green-700 dark:text-green-300">แบบทดสอบทั้งหมด</div>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-bold text-blue-600 dark:text-blue-400">${analysis.differentTests}</div>
                    <div class="text-xs text-blue-700 dark:text-blue-300">ประเภทแบบทดสอบ</div>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-lg p-2 text-center">
                    <div class="text-lg font-bold text-purple-600 dark:text-purple-400">${analysis.averageMentalScore}%</div>
                    <div class="text-xs text-purple-700 dark:text-purple-300">สุขภาพจิตโดยรวม</div>
                </div>
            </div>
            
            <div class="space-y-2">
        `;
        
        analysis.aspects.forEach(aspect => {
            const stars = Math.ceil(aspect.score / 20);
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += `<span class="${i <= stars ? 'text-yellow-500' : 'text-gray-300'}">★</span>`;
            }
            
            let statusLabel = '';
            let statusColor = '';
            
            if (aspect.score >= 80) {
                statusLabel = 'ยอดเยี่ยม';
                statusColor = 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            } else if (aspect.score >= 60) {
                statusLabel = 'ดี';
                statusColor = 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            } else if (aspect.score >= 40) {
                statusLabel = 'ปานกลาง';
                statusColor = 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            } else if (aspect.score >= 20) {
                statusLabel = 'ควรดูแล';
                statusColor = 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
            } else {
                statusLabel = 'ต้องการความช่วยเหลือ';
                statusColor = 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            }
            
            html += `
                <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div class="flex items-center">
                        <span class="text-xl mr-2">${aspect.icon}</span>
                        <div>
                            <div class="text-sm font-medium">${aspect.name}</div>
                            <div class="flex items-center text-xs text-gray-500">
                                <div class="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                                    <div class="h-full bg-gradient-to-r ${aspect.colorFrom} ${aspect.colorTo}" style="width: ${aspect.score}%"></div>
                                </div>
                                ${Math.round(aspect.score)}%
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="flex mb-1">${starsHTML}</div>
                        <span class="text-xs px-2 py-0.5 rounded-full ${statusColor}">${statusLabel}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (analysis.recommendation) {
            html += `
                <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 rounded-lg">
                    <div class="flex items-start">
                        <i class="fas fa-lightbulb text-yellow-500 mt-0.5 mr-2"></i>
                        <div>
                            <div class="text-xs font-medium text-primary mb-1">คำแนะนำจาก Cloudy-Puk-Jai</div>
                            <div class="text-xs text-gray-600 dark:text-gray-300">${analysis.recommendation}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('updateMentalHealthOverview: สำเร็จ');
    } catch (error) {
        console.error('updateMentalHealthOverview error:', error);
        container.innerHTML = `<p class="text-red-500 text-sm">เกิดข้อผิดพลาดในการแสดงข้อมูล</p>`;
    }
}

// วิเคราะห์สุขภาพจิต
function analyzeMentalHealth() {
    console.log('analyzeMentalHealth: กำลังวิเคราะห์...');
    
    const analysis = {
        totalTests: historyData.length,
        differentTests: 0,
        averageMentalScore: 0,
        aspects: [],
        recommendation: ''
    };
    
    try {
        const testGroups = {};
        const testTypes = new Set();
        
        historyData.forEach(item => {
            const testType = getTestCategory(item.title);
            testTypes.add(testType);
            
            if (!testGroups[testType]) {
                testGroups[testType] = {
                    scores: [],
                    count: 0,
                    latestScore: 0
                };
            }
            
            testGroups[testType].scores.push(Number(item.score) || 0);
            testGroups[testType].count++;
            testGroups[testType].latestScore = Number(item.score) || 0;
        });
        
        analysis.differentTests = testTypes.size;
        
        const aspectConfigs = {
            'wellbeing': { 
                name: 'ความสุข', 
                icon: '❤️',
                colorFrom: 'from-green-400',
                colorTo: 'to-emerald-500'
            },
            'stress': { 
                name: 'ความเครียด', 
                icon: '😰',
                colorFrom: 'from-red-400',
                colorTo: 'to-rose-500',
                invert: true
            },
            'anxiety': { 
                name: 'ความวิตกกังวล', 
                icon: '😟',
                colorFrom: 'from-orange-400',
                colorTo: 'to-amber-500',
                invert: true
            },
            'depression': { 
                name: 'ภาวะซึมเศร้า', 
                icon: '😔',
                colorFrom: 'from-purple-400',
                colorTo: 'to-violet-500',
                invert: true
            },
            'burnout': { 
                name: 'การฟื้นตัว', 
                icon: '💪',
                colorFrom: 'from-blue-400',
                colorTo: 'to-cyan-500'
            },
            'selfcare': { 
                name: 'การดูแลตัวเอง', 
                icon: '💖',
                colorFrom: 'from-pink-400',
                colorTo: 'to-rose-500'
            }
        };
        
        let totalScore = 0;
        let aspectCount = 0;
        
        Object.keys(aspectConfigs).forEach(aspectKey => {
            if (testGroups[aspectKey] && testGroups[aspectKey].scores.length > 0) {
                const config = aspectConfigs[aspectKey];
                const group = testGroups[aspectKey];
                
                const maxScore = getMaxScoreForCategory(aspectKey);
                const avgScore = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;
                let normalizedScore = (avgScore / maxScore) * 100;
                
                if (config.invert) {
                    normalizedScore = 100 - normalizedScore;
                }
                
                normalizedScore = Math.min(100, Math.max(0, Math.round(normalizedScore)));
                
                analysis.aspects.push({
                    ...config,
                    key: aspectKey,
                    score: normalizedScore
                });
                
                totalScore += normalizedScore;
                aspectCount++;
            }
        });
        
        if (aspectCount > 0) {
            analysis.averageMentalScore = Math.round(totalScore / aspectCount);
        }
        
        if (analysis.averageMentalScore >= 80) {
            analysis.recommendation = 'คุณมีสุขภาพจิตที่ยอดเยี่ยม! รักษาสุขภาพจิตที่ดีนี้ไว้และแบ่งปันพลังงานดีๆ ให้คนรอบข้างนะ';
        } else if (analysis.averageMentalScore >= 60) {
            analysis.recommendation = 'สุขภาพจิตของคุณอยู่ในระดับดี พยายามทำแบบทดสอบสม่ำเสมอเพื่อติดตามพัฒนาการ';
        } else if (analysis.averageMentalScore >= 40) {
            analysis.recommendation = 'ลองหาเวลาพักผ่อนและทำกิจกรรมที่ชอบ อย่าลืมดูแลตัวเองให้มากขึ้นนะ';
        } else {
            analysis.recommendation = 'อาจเป็นช่วงที่จิตใจต้องการการดูแลเป็นพิเศษ ลองพูดคุยกับคนใกล้ชิดหรือผู้เชี่ยวชาญดูนะ';
        }
        
        console.log('analyzeMentalHealth: สำเร็จ', analysis);
    } catch (error) {
        console.error('analyzeMentalHealth error:', error);
    }
    
    return analysis;
}

// ==================== TEST TYPE SUMMARY ====================

function updateTestTypeSummary() {
    const container = document.getElementById('testTypeSummary');
    if (!container) {
        console.error('❌ ไม่พบ element #testTypeSummary ในหน้าเว็บ');
        return;
    }
    
    console.log('🔍 updateTestTypeSummary: กำลังอัปเดต...');
    console.log('📊 จำนวนข้อมูลใน historyData:', historyData.length);
    
    if (historyData.length === 0) {
        console.log('ℹ️ ไม่พบข้อมูลใน historyData แสดงสถานะว่างเปล่า');
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-chart-pie text-3xl text-gray-300 mb-2"></i>
                <p class="text-gray-500 text-sm">ยังไม่มีข้อมูลสรุป</p>
                <p class="text-gray-400 text-xs mt-1">เริ่มทำแบบทดสอบเพื่อดูสรุปผล</p>
            </div>
        `;
        return;
    }
    
    try {
        console.log('📋 ตัวอย่างข้อมูลใน historyData[0]:', JSON.stringify(historyData[0], null, 2));
        
        const testGroups = {};
        
        historyData.forEach((item, index) => {
            try {
                const title = item.title || 'ไม่มีชื่อ';
                console.log(`📌 รายการที่ ${index + 1}: ${title} (คะแนน: ${item.score || 'ไม่มี'}, วันที่: ${item.date || 'ไม่มี'})`);
                
                if (!testGroups[title]) {
                    testGroups[title] = {
                        title: title,
                        count: 0,
                        scores: [],
                        latestResult: '',
                        latestDate: '',
                        latestScore: 0
                    };
                    console.log(`➕ สร้างกลุ่มใหม่สำหรับ: ${title}`);
                }
                
                testGroups[title].count++;
                const score = Number(item.score) || 0;
                testGroups[title].scores.push(score);
                
                const itemDate = item.date ? new Date(item.date) : new Date(0);
                const currentDate = testGroups[title].latestDate ? new Date(testGroups[title].latestDate) : new Date(0);
                
                if (!testGroups[title].latestDate || itemDate > currentDate) {
                    testGroups[title].latestResult = item.result?.title || item.result || 'ไม่มีข้อมูล';
                    testGroups[title].latestDate = item.date || '';
                    testGroups[title].latestScore = score;
                    console.log(`🔄 อัปเดตรายการล่าสุดสำหรับ ${title}: ${score} คะแนน`);
                }
            } catch (error) {
                console.error(`❌ เกิดข้อผิดพลาดในการประมวลผลรายการที่ ${index + 1}:`, error);
                console.error('รายละเอียดรายการ:', JSON.stringify(item, null, 2));
            }
        });
        
        console.log(`📊 จำนวนกลุ่มแบบทดสอบที่พบ: ${Object.keys(testGroups).length} กลุ่ม`);
        
        let html = '';
        const testGroupsArray = Object.values(testGroups);
        console.log(`🔄 กำลังสร้าง HTML สำหรับ ${testGroupsArray.length} กลุ่มแบบทดสอบ...`);
        
        testGroupsArray.forEach((test, index) => {
            console.log(`📝 กำลังประมวลผลกลุ่มที่ ${index + 1}: ${test.title} (${test.count} ครั้ง)`);
            const avgScore = test.scores.length > 0 
                ? Math.round(test.scores.reduce((a, b) => a + b, 0) / test.scores.length)
                : 0;
            
            const maxScore = getMaxScoreFromTestTitle(test.title);
            const { icon, color } = getTestInfo(test.title);
            
            html += `
                <div class="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <span class="text-xl mr-2">${icon}</span>
                            <div>
                                <div class="font-medium text-sm">${getShortTitle(test.title)}</div>
                                <div class="text-xs text-gray-500">ทำแล้ว ${test.count} ครั้ง</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-sm" style="color: ${color}">${test.latestScore}${maxScore ? '/' + maxScore : ''}</div>
                            <div class="text-xs text-gray-500">ล่าสุด</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-gray-100 dark:bg-gray-800 rounded p-1.5 text-center">
                            <div class="font-medium">${avgScore}${maxScore ? '/' + maxScore : ''}</div>
                            <div class="text-gray-500">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="bg-gray-100 dark:bg-gray-800 rounded p-1.5 text-center">
                            <div class="font-medium">${test.latestResult}</div>
                            <div class="text-gray-500">ผลล่าสุด</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (html.trim() === '') {
            console.warn('⚠️ ไม่มี HTML ที่ถูกสร้างขึ้นสำหรับแสดงผล');
            container.innerHTML = `
                <div class="text-center py-8 text-yellow-600">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p class="text-sm">ไม่พบข้อมูลที่สามารถแสดงได้</p>
                    <p class="text-xs mt-1">กรุณาตรวจสอบคอนโซลสำหรับรายละเอียดเพิ่มเติม</p>
                </div>
            `;
        } else {
            container.innerHTML = html;
            console.log('✅ updateTestTypeSummary: สร้าง HTML สำเร็จ');
        }
    } catch (error) {
        console.error('updateTestTypeSummary error:', error);
        container.innerHTML = `<p class="text-red-500 text-sm">เกิดข้อผิดพลาดในการแสดงข้อมูล</p>`;
    }
}

// ==================== HISTORY TABLE ====================

function updateHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    const tableContainer = document.getElementById('historyTableContainer');
    const emptyMessage = document.getElementById('emptyHistoryMessage');
    
    if (!tableBody || !tableContainer || !emptyMessage) return;
    
    console.log('updateHistoryTable: กำลังอัปเดต...');
    console.log('จำนวนข้อมูลสำหรับตาราง:', historyData.length);
    console.log('โครงสร้างข้อมูล:', historyData); // Debug: show full data structure
    
    if (historyData.length === 0) {
        tableContainer.classList.add('hidden');
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    try {
        tableContainer.classList.remove('hidden');
        emptyMessage.classList.add('hidden');
        
        let html = '';
        historyData.forEach((item, index) => {
            const { icon, color } = getTestInfo(item.title);
            const maxScore = getMaxScoreFromTestTitle(item.title);
            const dateFormatted = formatDate(item.date);
            
            html += `
                <tr class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="py-2 px-3 text-sm">${dateFormatted}</td>
                    <td class="py-2 px-3">
                        <div class="flex items-center">
                            <span class="mr-2">${icon}</span>
                            <span class="text-sm">${getShortTitle(item.title)}</span>
                        </div>
                    </td>
                    <td class="py-2 px-3">
                        <div class="font-bold text-sm" style="color: ${color}">${item.score}${maxScore ? '/' + maxScore : ''}</div>
                    </td>
                    <td class="py-2 px-3 text-sm">${item.result?.title || item.result || 'ไม่มีข้อมูล'}</td>
                    <td class="py-2 px-3">
                        <button onclick="viewDetails(${index})" class="text-primary hover:text-primary-dark mr-2 text-sm">
                            <i class="fas fa-eye mr-1"></i>ดู
                        </button>
                        <button onclick="deleteItem(${index})" class="text-red-300 hover:text-red-500 text-sm">
                            <i class="fas fa-trash mr-1"></i>ลบ
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        console.log('updateHistoryTable: สำเร็จ');
    } catch (error) {
        console.error('updateHistoryTable error:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">เกิดข้อผิดพลาดในการแสดงตาราง</td></tr>`;
    }
}

// ==================== HELPER FUNCTIONS ====================

function getShortTitle(title) {
    if (!title) return 'ไม่มีชื่อ';
    if (title.includes('(')) {
        return title.split('(')[0].trim();
    }
    if (title.length > 25) {
        return title.substring(0, 22) + '...';
    }
    return title;
}

function getTestInfo(title) {
    if (!title) return { icon: '📊', color: '#6D9F71' };
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('who-5') || titleLower.includes('ความสุข')) {
        return { icon: '❤️', color: '#10b981' };
    }
    if (titleLower.includes('pss-10') || titleLower.includes('ความเครียด')) {
        return { icon: '😰', color: '#ef4444' };
    }
    if (titleLower.includes('gad-7') || titleLower.includes('วิตกกังวล')) {
        return { icon: '😟', color: '#f59e0b' };
    }
    if (titleLower.includes('phq-9') || titleLower.includes('ซึมเศร้า')) {
        return { icon: '😔', color: '#8b5cf6' };
    }
    if (titleLower.includes('หมดไฟ') || titleLower.includes('burnout')) {
        return { icon: '🔥', color: '#f97316' };
    }
    if (titleLower.includes('ใจดีกับตัวเอง')) {
        return { icon: '💖', color: '#ec4899' };
    }
    if (titleLower.includes('พลังแห่งการฟื้นตัว')) {
        return { icon: '💪', color: '#3b82f6' };
    }
    if (titleLower.includes('รู้จักอารมณ์ตัวเอง')) {
        return { icon: '🧠', color: '#06b6d4' };
    }
    if (titleLower.includes('mbti')) {
        return { icon: '👤', color: '#6b7280' };
    }
    if (titleLower.includes('big five')) {
        return { icon: '🌍', color: '#6b7280' };
    }
    return { icon: '📊', color: '#6D9F71' };
}

function getTestCategory(title) {
    if (!title) return 'other';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('who-5') || titleLower.includes('ความสุข')) return 'wellbeing';
    if (titleLower.includes('pss-10') || titleLower.includes('ความเครียด')) return 'stress';
    if (titleLower.includes('gad-7') || titleLower.includes('วิตกกังวล')) return 'anxiety';
    if (titleLower.includes('phq-9') || titleLower.includes('ซึมเศร้า')) return 'depression';
    if (titleLower.includes('หมดไฟ') || titleLower.includes('burnout')) return 'burnout';
    if (titleLower.includes('ใจดีกับตัวเอง') || titleLower.includes('self-compassion')) return 'selfcare';
    if (titleLower.includes('พลังแห่งการฟื้นตัว') || titleLower.includes('resilience')) return 'burnout';
    if (titleLower.includes('รู้จักอารมณ์ตัวเอง') || titleLower.includes('emotional-awareness')) return 'selfcare';
    return 'other';
}

function getMaxScoreForCategory(category) {
    const maxScores = {
        'wellbeing': 25,
        'stress': 40,
        'anxiety': 21,
        'depression': 27,
        'burnout': 12,
        'selfcare': 10
    };
    return maxScores[category] || 100;
}

function getMaxScoreFromTestTitle(title) {
    if (!title) return null;
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('who-5') || titleLower.includes('ความสุข')) return 25;
    if (titleLower.includes('pss-10') || titleLower.includes('ความเครียด')) return 40;
    if (titleLower.includes('gad-7') || titleLower.includes('วิตกกังวล')) return 21;
    if (titleLower.includes('phq-9') || titleLower.includes('ซึมเศร้า')) return 27;
    if (titleLower.includes('หมดไฟ') || titleLower.includes('burnout')) return 12;
    if (titleLower.includes('ใจดีกับตัวเอง')) return 10;
    if (titleLower.includes('พลังแห่งการฟื้นตัว')) return 10;
    if (titleLower.includes('รู้จักอารมณ์ตัวเอง')) return 10;
    if (titleLower.includes('mbti')) return 20;
    if (titleLower.includes('big five')) return 10;
    return null;
}

function formatDate(dateString) {
    try {
        if (!dateString) return 'ไม่มีวันที่';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        console.error('formatDate error:', error);
        return dateString || 'ไม่มีวันที่';
    }
}

function showEmptyState() {
    console.log('showEmptyState: แสดงสถานะว่างเปล่า');
    
    try {
        const testTypeSummary = document.getElementById('testTypeSummary');
        const historyTableContainer = document.getElementById('historyTableContainer');
        const emptyMessage = document.getElementById('emptyHistoryMessage');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        if (testTypeSummary) {
            testTypeSummary.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-clipboard-list text-3xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500 text-sm">ยังไม่มีประวัติการทดสอบ</p>
                    <p class="text-gray-400 text-xs mt-1">เริ่มทำแบบทดสอบเพื่อเก็บประวัติของคุณ</p>
                </div>
            `;
        }
        
        if (historyTableContainer) {
            historyTableContainer.classList.add('hidden');
        }
        
        if (emptyMessage) {
            emptyMessage.classList.remove('hidden');
        }
        
        if (clearHistoryBtn) {
            clearHistoryBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('showEmptyState error:', error);
    }
}

function showItemDetails(index) {
    try {
        if (index < 0 || index >= historyData.length) {
            showNotification('ไม่พบข้อมูลประวัตินี้', 'error');
            return;
        }
        
        const item = historyData[index];
        const maxScore = getMaxScoreFromTestTitle(item.title);
        
        // สร้าง popup แสดงรายละเอียด
        showDetailsDialog(
            '📋 รายละเอียดแบบทดสอบ',
            `
                <div class="text-left space-y-3">
                    <div class="flex items-start">
                        <i class="fas fa-file-alt text-blue-500 mt-1 mr-3"></i>
                        <div>
                            <span class="font-semibold">ชื่อ:</span>
                            <span class="text-gray-700 dark:text-gray-300">${item.title || 'ไม่มีชื่อ'}</span>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <i class="fas fa-chart-line text-green-500 mt-1 mr-3"></i>
                        <div>
                            <span class="font-semibold">คะแนน:</span>
                            <span class="text-gray-700 dark:text-gray-300">${item.score}${maxScore ? '/' + maxScore : ''}</span>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <i class="fas fa-calendar text-purple-500 mt-1 mr-3"></i>
                        <div>
                            <span class="font-semibold">วันที่:</span>
                            <span class="text-gray-700 dark:text-gray-300">${new Date(item.date).toLocaleString('th-TH')}</span>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <i class="fas fa-clock text-orange-500 mt-1 mr-3"></i>
                        <div>
                            <span class="font-semibold">เวลา:</span>
                            <span class="text-gray-700 dark:text-gray-300">${new Date(item.date).toLocaleTimeString('th-TH')}</span>
                        </div>
                    </div>
                </div>
            `,
            'ปิด',
            null,
            null
        );
    } catch (error) {
        console.error('showItemDetails error:', error);
        showNotification('เกิดข้อผิดพลาดในการแสดงรายละเอียด', 'error');
    }
}

function deleteItem(index) {
    try {
        if (index < 0 || index >= historyData.length) {
            showNotification('ไม่พบข้อมูลประวัตินี้', 'error');
            return;
        }
        
        const historyItem = historyData[index];
        
        // แสดง SweetAlert2 ยืนยันการลบ
        Swal.fire({
            title: 'ยืนยันการลบ?',
            html: `
                <p class="text-gray-600 mb-3">คุณต้องการลบรายการนี้หรือไม่?</p>
                <div class="bg-gray-50 p-3 rounded-lg text-left">
                    <p class="font-semibold">${getShortTitle(historyItem.title)}</p>
                    <p class="text-sm text-gray-500">${formatDate(historyItem.date)}</p>
                    <p class="text-sm">คะแนน: ${historyItem.score}</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบรายการ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
                
                if (user && !user.isGuest && window.db && historyItem.id) {
                    // ผู้ใช้ Firebase - ลบจาก Firebase
                    try {
                        await window.db
                            .collection('users')
                            .doc(user.uid)
                            .collection('assessments')
                            .doc(historyItem.id)
                            .delete();
                        console.log('✅ ลบข้อมูลจาก Firebase สำเร็จ');
                    } catch (error) {
                        console.error('❌ ลบจาก Firebase ไม่สำเร็จ:', error);
                        showNotification('ลบข้อมูลไม่สำเร็จ: ' + error.message, 'error');
                        return;
                    }
                } else {
                    // Guest user - ลบจาก localStorage
                    try {
                        const savedData = localStorage.getItem('mindbloomData_guest');
                        if (savedData) {
                            const data = JSON.parse(savedData);
                            const history = data.assessmentHistory || [];
                            
                            // หา index ที่ตรงกันใน localStorage
                            const localIndex = history.findIndex(item => 
                                item.date === historyItem.date && 
                                item.title === historyItem.title
                            );
                            
                            if (localIndex !== -1) {
                                history.splice(localIndex, 1);
                                data.assessmentHistory = history;
                                localStorage.setItem('mindbloomData_guest', JSON.stringify(data));
                                // อัปเดต guestHistoryData ด้วย
                                guestHistoryData = history;
                                console.log('✅ ลบข้อมูล guest จาก localStorage สำเร็จ');
                            }
                        }
                    } catch (error) {
                        console.error('❌ ลบจาก localStorage ไม่สำเร็จ:', error);
                        showNotification('ลบข้อมูลไม่สำเร็จ: ' + error.message, 'error');
                        return;
                    }
                }
                
                // โหลดข้อมูลใหม่
                loadHistoryData();
                
                // แสดง SweetAlert2 สำเร็จ
                Swal.fire({
                    title: 'ลบสำเร็จ!',
                    text: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                console.log('Item deleted successfully');
            }
        });
        
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('เกิดข้อผิดพลาดในการลบ: ' + error.message, 'error');
    }
}

function clearAllHistory() {
    try {
        if (historyData.length === 0) {
            showNotification('ไม่มีประวัติที่จะลบ', 'info');
            return;
        }
        
        // แสดง SweetAlert2 ยืนยันการลบทั้งหมด
        Swal.fire({
            title: 'ยืนยันการลบทั้งหมด?',
            html: `
                <p class="text-gray-600 mb-3">คุณต้องการลบประวัติทั้งหมดหรือไม่?</p>
                <p class="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const user = window.AuthUtils ? window.AuthUtils.getCurrentUser() : null;
                
                if (user && !user.isGuest && window.db) {
                    // ผู้ใช้ Firebase - ลบทั้งหมดจาก Firebase
                    try {
                        const assessmentsSnapshot = await window.db
                            .collection('users')
                            .doc(user.uid)
                            .collection('assessments')
                            .get();
                        
                        const batch = window.db.batch();
                        assessmentsSnapshot.docs.forEach(doc => {
                            if (doc.id !== 'init') {
                                batch.delete(doc.ref);
                            }
                        });
                        
                        await batch.commit();
                        console.log('✅ ลบข้อมูลทั้งหมดจาก Firebase สำเร็จ');
                    } catch (error) {
                        console.error('❌ ลบจาก Firebase ไม่สำเร็จ:', error);
                        showNotification('ลบข้อมูลไม่สำเร็จ: ' + error.message, 'error');
                        return;
                    }
                } else {
                    // Guest user - ลบทั้งหมดจาก localStorage
                    try {
                        const storageKey = 'mindbloomData_guest';
                        localStorage.setItem(storageKey, JSON.stringify({ assessmentHistory: [] }));
                        // ล้าง guestHistoryData ด้วย
                        guestHistoryData = [];
                        console.log('✅ ลบข้อมูล guest ทั้งหมดจาก localStorage สำเร็จ');
                    } catch (error) {
                        console.error('❌ ลบจาก localStorage ไม่สำเร็จ:', error);
                        showNotification('ลบข้อมูลไม่สำเร็จ: ' + error.message, 'error');
                        return;
                    }
                }
                
                // ล้างข้อมูลใน memory
                if (user && user.isGuest) {
                    guestHistoryData = [];
                } else {
                    userHistoryData = [];
                }
                historyData = [];
                
                // โหลดข้อมูลใหม่
                loadHistoryData();
                
                // แสดง SweetAlert2 สำเร็จ
                Swal.fire({
                    title: 'ลบทั้งหมดสำเร็จ!',
                    text: 'ลบประวัติทั้งหมดเรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                console.log('All history deleted successfully');
            }
        });
        
    } catch (error) {
        console.error('Error clearing all history:', error);
        showNotification('เกิดข้อผิดพลาดในการล้างประวัติ: ' + error.message, 'error');
    }
}

// ฟังก์ชันสร้าง popup แจ้งเตือน
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm, onCancel) {
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
            <div class="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-exclamation-triangle text-2xl text-red-600 dark:text-red-400"></i>
            </div>
            
            <!-- Title -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${title}</h3>
            
            <!-- Message -->
            <p class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">${message}</p>
            
            <!-- Buttons -->
            <div class="flex gap-3 justify-center">
                <button id="cancelBtn" class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center">
                    <i class="fas fa-times mr-2"></i>
                    ${cancelText}
                </button>
                <button id="confirmBtn" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                    <i class="fas fa-trash-alt mr-2"></i>
                    ${confirmText}
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
        closeConfirmDialog(overlay, onCancel);
    });
    
    confirmBtn.addEventListener('click', () => {
        closeConfirmDialog(overlay, onConfirm);
    });
    
    // ปิด popup เมื่อคลิก overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeConfirmDialog(overlay, onCancel);
        }
    });
    
    // ปิด popup เมื่อกด Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeConfirmDialog(overlay, onCancel);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// ฟังก์ชันปิด popup
function closeConfirmDialog(overlay, callback) {
    const popup = overlay.querySelector('div');
    popup.classList.remove('scale-100');
    popup.classList.add('scale-95');
    
    setTimeout(() => {
        document.body.removeChild(overlay);
        if (callback) callback();
    }, 300);
}

// ฟังก์ชันสร้าง popup แสดงรายละเอียด
function showDetailsDialog(title, message, confirmText, cancelText, onConfirm, onCancel) {
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
                <i class="fas fa-info-circle text-2xl text-blue-600 dark:text-blue-400"></i>
            </div>
            
            <!-- Title -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${title}</h3>
            
            <!-- Message -->
            <div class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed text-left">
                ${message}
            </div>
            
            <!-- Buttons -->
            <div class="flex gap-3 justify-center">
                ${cancelText ? `
                    <button id="cancelBtn" class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center">
                        <i class="fas fa-times mr-2"></i>
                        ${cancelText}
                    </button>
                ` : ''}
                <button id="confirmBtn" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                    <i class="fas fa-check mr-2"></i>
                    ${confirmText}
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
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeConfirmDialog(overlay, onCancel);
        });
    }
    
    confirmBtn.addEventListener('click', () => {
        closeConfirmDialog(overlay, onConfirm);
    });
    
    // ปิด popup เมื่อคลิก overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeConfirmDialog(overlay, onCancel);
        }
    });
    
    // ปิด popup เมื่อกด Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeConfirmDialog(overlay, onCancel);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// ==================== EXPORT FUNCTIONS ====================

function exportJSON() {
    try {
        const data = {
            history: historyData,
            exportDate: new Date().toISOString(),
            totalRecords: historyData.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloudy-puk-jai-history-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('ส่งออกข้อมูล JSON สำเร็จแล้ว!', 'success');
    } catch (error) {
        console.error('Export JSON error:', error);
        showNotification('เกิดข้อผิดพลาดในการส่งออก JSON', 'error');
    }
}

async function exportPDF() {
    if (isExportingPDF) return;
    
    console.log('exportPDF: เริ่มต้นสร้าง PDF...');
    
    isExportingPDF = true;
    
    try {
        // อัปเดต UI
        const pdfIcon = document.getElementById('pdfIcon');
        const pdfText = document.getElementById('pdfText');
        
        if (pdfIcon) pdfIcon.className = 'fas fa-spinner fa-spin mr-1.5';
        if (pdfText) pdfText.textContent = 'กำลังสร้าง...';
        
        // ตรวจสอบว่า html2pdf พร้อมใช้งาน (รอสักครู่ถ้ายังโหลดไม่เสร็จ)
        let attempts = 0;
        const maxAttempts = 10;
        
        while (typeof html2pdf === 'undefined' && attempts < maxAttempts) {
            console.log(`รอ html2pdf... ครั้งที่ ${attempts + 1}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof html2pdf === 'undefined') {
            console.warn('html2pdf ไม่พร้อมใช้งาน ใช้วิธี fallback');
            fallbackPDFExport();
            return;
        }
        
        console.log('html2pdf พร้อมใช้งาน');
        
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (historyData.length === 0) {
            showNotification('ไม่มีข้อมูลสำหรับสร้างรายงาน PDF', 'info');
            return;
        }
        
        // สร้างเนื้อหา PDF อย่างง่าย
        const pdfContent = createSimplePDFContent();
        
        // ตั้งค่า options
        const opt = {
            margin: [15, 15, 15, 15],
            filename: `cloudy-puk-jai-report-${new Date().getTime()}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.95 
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            }
        };
        
        console.log('exportPDF: กำลังสร้าง PDF...');
        
        // สร้างและดาวน์โหลด PDF
        await html2pdf().set(opt).from(pdfContent).save();
        
        showNotification('สร้างไฟล์ PDF สำเร็จแล้ว!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        console.error('Error details:', error.message, error.stack);
        
        // ลองใช้วิธี fallback
        try {
            await fallbackPDFExport();
        } catch (fallbackError) {
            console.error('Fallback PDF export error:', fallbackError);
            showNotification('ไม่สามารถสร้าง PDF ได้: ' + error.message, 'error');
        }
        
    } finally {
        isExportingPDF = false;
        
        // คืนค่า UI
        const pdfIcon = document.getElementById('pdfIcon');
        const pdfText = document.getElementById('pdfText');
        
        if (pdfIcon) pdfIcon.className = 'fas fa-file-pdf mr-1.5';
        if (pdfText) pdfText.textContent = 'PDF';
    }
}

function createSimplePDFContent() {
    const container = document.createElement('div');
    container.style.cssText = `
        padding: 20px;
        background: white;
        color: black;
        font-family: 'Anuphan', 'Noto Sans Thai', sans-serif;
        font-size: 12px;
        max-width: 100%;
    `;
    
    const today = new Date().toLocaleDateString('th-TH');
    const analysis = historyData.length > 0 ? analyzeMentalHealth() : null;
    
    let content = `
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #6D9F71;">
            <h1 style="color: #6D9F71; font-size: 24px; margin: 0; font-weight: bold;">Cloudy-Puk-Jai</h1>
            <h2 style="color: #555; font-size: 18px; margin: 8px 0;">รายงานผลการทดสอบสุขภาพจิต</h2>
            <p style="color: #777; font-size: 13px; margin: 4px 0;">วันที่ออกรายงาน: ${today}</p>
            <p style="color: #777; font-size: 13px; margin: 4px 0;">จำนวนแบบทดสอบทั้งหมด: ${historyData.length} รายการ</p>
        </div>
    `;
    
    if (analysis) {
        content += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #6D9F71; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 5px;">สุขภาพจิตภาพรวม</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="text-align: center; flex: 1; padding: 10px;">
                        <div style="font-size: 18px; font-weight: bold; color: #6D9F71;">${analysis.totalTests}</div>
                        <div style="font-size: 11px; color: #666;">แบบทดสอบทั้งหมด</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px;">
                        <div style="font-size: 18px; font-weight: bold; color: #6D9F71;">${analysis.differentTests}</div>
                        <div style="font-size: 11px; color: #666;">ประเภทแบบทดสอบ</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px;">
                        <div style="font-size: 18px; font-weight: bold; color: #6D9F71;">${analysis.averageMentalScore}%</div>
                        <div style="font-size: 11px; color: #666;">สุขภาพจิตโดยรวม</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ตารางประวัติ
    if (historyData.length > 0) {
        content += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #6D9F71; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 5px;">รายการประวัติการทดสอบ</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background-color: #6D9F71; color: white;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #5a8a5d;">วันที่</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #5a8a5d;">แบบทดสอบ</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #5a8a5d;">คะแนน</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #5a8a5d;">ผลลัพธ์</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // แสดงเฉพาะ 20 รายการแรก
        const itemsToShow = historyData.slice(0, 20);
        itemsToShow.forEach(item => {
            const maxScore = getMaxScoreFromTestTitle(item.title);
            content += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px; border: 1px solid #ddd;">${formatDate(item.date)}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${getShortTitle(item.title)}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">${item.score}${maxScore ? '/' + maxScore : ''}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${item.result?.title || item.result || ''}</td>
                </tr>
            `;
        });
        
        content += `
                    </tbody>
                </table>
                ${historyData.length > 20 ? `
                    <p style="text-align: center; font-style: italic; color: #777; margin-top: 8px; font-size: 10px;">
                        แสดงเพียง 20 รายการล่าสุด จากทั้งหมด ${historyData.length} รายการ
                    </p>
                ` : ''}
            </div>
        `;
    }
    
    // Footer
    content += `
        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 10px; line-height: 1.4;">
            <p>รายงานนี้ถูกสร้างขึ้นโดย Cloudy-Puk-Jai - แอพพลิเคชันดูแลสุขภาพจิต</p>
            <p>หมายเหตุ: ข้อมูลนี้ใช้เพื่อการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</p>
            <p>© 2026 Cloudy-Puk-Jai - สุขภาพใจที่ดีเริ่มต้นที่การดูแลตัวเอง</p>
        </div>
    `;
    
    container.innerHTML = content;
    return container;
}

async function fallbackPDFExport() {
    console.log('fallbackPDFExport: ใช้วิธี fallback...');
    
    const printContent = createSimplePDFContent();
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        throw new Error('ไม่สามารถเปิดหน้าต่างใหม่ได้ กรุณาปิดป๊อปอัพบล็อกเกอร์');
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cloudy-Puk-Jai - รายงานผลการทดสอบ</title>
            <style>
                body { 
                    font-family: 'Anuphan', 'Noto Sans Thai', sans-serif;
                    line-height: 1.4;
                    color: #000;
                    margin: 0;
                    padding: 20px;
                }
                @media print {
                    @page { margin: 15mm; }
                }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showNotification('เปิดหน้าต่างพิมพ์แล้ว กรุณาเลือก "บันทึกเป็น PDF"', 'info');
}

function printReport() {
    console.log('printReport: พิมพ์รายงาน...');
    
    try {
        const printContent = createSimplePDFContent();
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showNotification('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาปิดป๊อปอัพบล็อกเกอร์', 'error');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cloudy-Puk-Jai - รายงานผลการทดสอบ</title>
                <style>
                    body { 
                        font-family: 'Anuphan', 'Noto Sans Thai', sans-serif;
                        line-height: 1.4;
                        color: #000;
                        margin: 0;
                        padding: 20px;
                    }
                    @media print {
                        @page { margin: 15mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    } catch (error) {
        console.error('printReport error:', error);
        showNotification('เกิดข้อผิดพลาดในการพิมพ์', 'error');
    }
}

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'info', duration = 3000) {
    try {
        // ลบ notification เก่าที่ซ้ำกัน
        const oldNotifications = document.querySelectorAll('.notification-item');
        oldNotifications.forEach(notif => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        });
        
        // สร้าง notification element
        const notification = document.createElement('div');
        notification.className = 'notification-item fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-8 opacity-0';
        
        // ตั้งค่าสีตามประเภท
        const colors = {
            success: 'bg-green-500 text-white border-l-4 border-green-600',
            error: 'bg-red-500 text-white border-l-4 border-red-600',
            info: 'bg-blue-500 text-white border-l-4 border-blue-600',
            warning: 'bg-yellow-500 text-white border-l-4 border-yellow-600'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        
        // ตั้งค่าไอคอนตามประเภท
        let icon = 'info-circle';
        switch (type) {
            case 'success': icon = 'check-circle'; break;
            case 'error': icon = 'exclamation-circle'; break;
            case 'warning': icon = 'exclamation-triangle'; break;
        }
        
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-${icon} text-lg"></i>
                <div class="flex-1">
                    <p class="font-medium text-sm">${message}</p>
                    <p class="text-xs opacity-90 mt-0.5">${getCurrentTime()}</p>
                </div>
                <button class="notification-close ml-2 opacity-70 hover:opacity-100 transition-opacity">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // เพิ่มเข้า DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-y-8', 'opacity-0');
            notification.classList.add('translate-y-0', 'opacity-100');
        }, 10);
        
        // ปิด notification เมื่อคลิกปุ่มปิด
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        // Auto remove หลังจากเวลาที่กำหนด
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
        
        console.log(`[Notification] ${type.toUpperCase()}: ${message}`);
        
    } catch (error) {
        console.error('showNotification error:', error);
        // Fallback ใช้ SweetAlert2
        Swal.fire({
            icon: 'info',
            title: type.toUpperCase(),
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }
}

function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== HEALTH OVERVIEW FUNCTIONS ====================

function refreshHealthOverview() {
    console.log('Refreshing health overview...');
    
    // แสดงสถานะกำลังโหลด
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement) {
        lastUpdateElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>กำลังอัปเดต...';
    }
    
    // โหลดข้อมูลใหม่
    loadHistoryData();
    
    // แสดงการแจ้งเตือน
    showNotification('อัปเดตข้อมูลสุขภาพจิตภาพรวมเรียบร้อยแล้ว', 'success');
    
    // อัปเดตเวลาล่าสุด
    setTimeout(() => {
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdateElement.textContent = timeString;
        }
    }, 500);
}

function loadLastTestDate() {
    try {
        // ใช้ข้อมูลจาก historyData ที่โหลดมาแล้ว
        if (historyData.length > 0) {
            // เรียงจากล่าสุดไปเก่าสุด
            const sortedHistory = [...historyData].sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp || a.completedAt || 0);
                const dateB = new Date(b.date || b.timestamp || b.completedAt || 0);
                return dateB - dateA;
            });
            
            const lastTest = sortedHistory[0];
            const lastTestDateElement = document.getElementById('lastTestDate');
            
            if (lastTestDateElement && (lastTest.date || lastTest.timestamp || lastTest.completedAt)) {
                const date = new Date(lastTest.date || lastTest.timestamp || lastTest.completedAt);
                const formattedDate = date.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                lastTestDateElement.textContent = formattedDate;
            }
        }
    } catch (error) {
        console.error('Error loading last test date:', error);
    }
}

// ==================== MODAL MANAGEMENT ====================

function openHealthTipsModal() {
    const modal = document.getElementById('healthOverviewTipsModal');
    if (!modal) {
        console.error('Health tips modal not found');
        return;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    
    // เพิ่ม animation เมื่อเปิด
    modal.style.animation = 'fadeIn 0.3s ease-out';
    
    console.log('Health tips modal opened');
}

function closeHealthTipsModal() {
    const modal = document.getElementById('healthOverviewTipsModal');
    if (!modal) {
        console.error('Health tips modal not found');
        return;
    }
    
    modal.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        modal.style.animation = '';
    }, 250);
    
    console.log('Health tips modal closed');
}

function initHealthOverviewTips() {
    const modal = document.getElementById('healthOverviewTipsModal');
    const openBtn = document.getElementById('healthOverviewTipsBtn');
    const closeBtn = document.getElementById('closeHealthTipsModalBtn');
    
    if (!modal || !openBtn) {
        console.warn('Health overview tips modal elements not found');
        return;
    }
    
    // เปิด Modal
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openHealthTipsModal();
    });
    
    // ปิด Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeHealthTipsModal();
        });
    }
    
    // ปิดเมื่อคลิกนอก Modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeHealthTipsModal();
        }
    });
    
    // ปิดด้วยปุ่ม Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('flex')) {
            closeHealthTipsModal();
        }
    });
}

// ==================== EVENT LISTENERS SETUP ====================

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    try {
        // ปุ่มรีเฟรช Dashboard
        const refreshBtn = document.querySelector('button[onclick*="refreshHealthOverview"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshHealthOverview);
            console.log('Refresh button listener added');
        }
        
        // ปุ่ม Export PDF (ถ้ามี)
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', exportPDF);
            console.log('Export PDF button listener added');
        }
        
        // ปุ่ม Export JSON (ถ้ามี)
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', exportJSON);
            console.log('Export JSON button listener added');
        }
        
        // ปุ่มพิมพ์ (ถ้ามี)
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', printReport);
            console.log('Print button listener added');
        }
        
        // ปุ่มล้างประวัติ
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearAllHistory);
            console.log('Clear history button listener added');
        }
        
        // ปุ่มคู่มือสุขภาพจิตภาพรวม
        const healthOverviewTipsBtn = document.getElementById('healthOverviewTipsBtn');
        if (healthOverviewTipsBtn) {
            healthOverviewTipsBtn.addEventListener('click', function() {
                openHealthTipsModal();
            });
            console.log('Health tips button listener added');
        }
        
        // ปุ่มปิด modal คู่มือ
        const closeHealthTipsModalBtn = document.getElementById('closeHealthTipsModalBtn');
        if (closeHealthTipsModalBtn) {
            closeHealthTipsModalBtn.addEventListener('click', function() {
                closeHealthTipsModal();
            });
            console.log('Close health tips modal button listener added');
        }
        
        // คลิกนอก modal เพื่อปิด
        const healthTipsModal = document.getElementById('healthOverviewTipsModal');
        if (healthTipsModal) {
            healthTipsModal.addEventListener('click', function(e) {
                if (e.target === healthTipsModal) {
                    closeHealthTipsModal();
                }
            });
            console.log('Health tips modal backdrop click listener added');
        }
        
        // Quick access buttons
        const quickPdfBtn = document.querySelector('button[onclick*="exportPdfBtn"]');
        if (quickPdfBtn) {
            quickPdfBtn.addEventListener('click', function() {
                document.getElementById('exportPdfBtn')?.click();
            });
        }
        
        const quickPrintBtn = document.querySelector('button[onclick*="printBtn"]');
        if (quickPrintBtn) {
            quickPrintBtn.addEventListener('click', function() {
                document.getElementById('printBtn')?.click();
            });
        }
        
        console.log('All event listeners setup complete');
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showNotification('เกิดข้อผิดพลาดในการตั้งค่า Event Listeners', 'error');
    }
}

// ==================== CSS ANIMATION SUPPORT ====================

// เพิ่ม CSS animations ถ้ายังไม่มีใน history.css
(function() {
    // ตรวจสอบว่า CSS animations ถูกโหลดหรือยัง
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
        
        .notification-item {
            min-width: 300px;
            max-width: 400px;
            backdrop-filter: blur(10px);
            background-opacity: 0.9;
        }
        
        .notification-success {
            background-color: rgba(16, 185, 129, 0.95) !important;
        }
        
        .notification-error {
            background-color: rgba(239, 68, 68, 0.95) !important;
        }
        
        .notification-info {
            background-color: rgba(59, 130, 246, 0.95) !important;
        }
        
        .notification-warning {
            background-color: rgba(245, 158, 11, 0.95) !important;
        }
    `;
    document.head.appendChild(style);
})();
// ==================== END OF FILE ====================
