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
    
    console.log('History page fully loaded');
});

// ฟังก์ชันดูรายละเอียด
function viewDetails(index) {
    console.log('viewDetails called with index:', index);
    
    const historyData = getHistoryData();
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
function initializePage() {
    console.log('Initializing history page...');
    
    try {
        // 1. โหลดข้อมูลประวัติ
        loadHistoryData();
        
        // 3. ตั้งค่า Event Listeners
        setupEventListeners();
        
        // 4. ตั้งค่า Health Overview Tips Modal
        initHealthOverviewTips();
        
        // 5. โหลดวันที่ทดสอบล่าสุด
        loadLastTestDate();
        
        // 6. ตั้งค่าเวลาอัปเดตเริ่มต้น
        updateLastUpdateTime();
        
        // 7. แสดงสถานะพร้อมใช้งาน
        setTimeout(() => {
            showNotification('ระบบประวัติการทดสอบพร้อมใช้งาน', 'info', 2000);
        }, 500);
        
        console.log('Page initialization complete');
        
    } catch (error) {
        console.error('initializePage error:', error);
        showNotification('เกิดข้อผิดพลาดในการเริ่มต้นหน้า: ' + error.message, 'error');
    }
}

// ==================== DATA MANAGEMENT ====================

// โหลดข้อมูลประวัติ
function loadHistoryData() {
    console.log('loadHistoryData: กำลังโหลดข้อมูล...');
    
    try {
        // ดึงข้อมูลจาก Alpine.js
        const app = Alpine.store('mindbloomApp') || Alpine.$data(document.querySelector('[x-data*="mindbloomApp"]'));
        
        if (app && app.assessmentHistory) {
            historyData = app.assessmentHistory;
            console.log('โหลดข้อมูลจาก Alpine.js:', historyData.length, 'รายการ');
            
            // เรียงจากใหม่ไปเก่า
            historyData.sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp || 0);
                const dateB = new Date(b.date || b.timestamp || 0);
                return dateB - dateA;
            });
            
            console.log('โหลดข้อมูลสำเร็จ:', historyData.length, 'รายการ');
            updateUI();
            
        } else {
            console.log('ไม่พบข้อมูลจาก Alpine.js, ลองโหลดจาก localStorage');
            // Fallback: โหลดจาก localStorage
            const savedData = localStorage.getItem('mindbloomData');
            if (savedData) {
                const data = JSON.parse(savedData);
                historyData = data.assessmentHistory || [];
                console.log('โหลดจาก localStorage fallback:', historyData.length, 'รายการ');
                updateUI();
            } else {
                console.log('ไม่พบข้อมูลประวัติใน localStorage');
                showEmptyState();
            }
        }
    } catch (error) {
        console.error('Error loading history data:', error);
        console.error('Error details:', error.message, error.stack);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'error');
        showEmptyState();
    }
}

// บันทึกข้อมูลประวัติ
function saveHistoryData() {
    try {
        // อัปเดตข้อมูลใน Alpine.js
        const app = Alpine.store('mindbloomApp') || Alpine.$data(document.querySelector('[x-data*="mindbloomApp"]'));
        if (app) {
            app.assessmentHistory = historyData;
            app.saveData(); // เรียกใช้ฟังก์ชัน saveData ของ Alpine.js
        }
        
        // Fallback: บันทึกใน localStorage สำหรับความเข้ากัน
        let data = {};
        const savedData = localStorage.getItem('mindbloomData');
        
        if (savedData) {
            data = JSON.parse(savedData);
        }
        
        data.assessmentHistory = historyData;
        localStorage.setItem('mindbloomData', JSON.stringify(data));
        console.log('saveHistoryData: บันทึกข้อมูลสำเร็จ');
    } catch (error) {
        console.error('Error saving history data:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
}

// ==================== UI UPDATES ====================

// อัปเดต UI
function updateUI() {
    console.log('updateUI: กำลังอัปเดต UI...');
    console.log('จำนวนข้อมูล:', historyData.length);
    
    try {
        updateTestTypeSummary();
        updateMentalHealthOverview();
        updateHistoryTable();
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
            const lastTest = historyData[0];
            const date = new Date(lastTest.date || lastTest.timestamp);
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
                                    <div class="h-full bg-gradient-to-r ${aspect.colorFrom} ${aspect.colorTo}" 
                                         style="width: ${aspect.score}%"></div>
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
    if (!container) return;
    
    console.log('updateTestTypeSummary: กำลังอัปเดต...');
    
    if (historyData.length === 0) {
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
        const testGroups = {};
        
        historyData.forEach(item => {
            const title = item.title || 'ไม่มีชื่อ';
            if (!testGroups[title]) {
                testGroups[title] = {
                    title: title,
                    count: 0,
                    scores: [],
                    latestResult: '',
                    latestDate: '',
                    latestScore: 0
                };
            }
            
            testGroups[title].count++;
            testGroups[title].scores.push(Number(item.score) || 0);
            
            const itemDate = new Date(item.date || 0);
            const currentDate = new Date(testGroups[title].latestDate || 0);
            
            if (!testGroups[title].latestDate || itemDate > currentDate) {
                testGroups[title].latestResult = item.result || 'ไม่มีข้อมูล';
                testGroups[title].latestDate = item.date || '';
                testGroups[title].latestScore = Number(item.score) || 0;
            }
        });
        
        let html = '';
        Object.values(testGroups).forEach(test => {
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
        
        container.innerHTML = html;
        console.log('updateTestTypeSummary: สำเร็จ');
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
                    <td class="py-2 px-3 text-sm">${item.result || 'ไม่มีข้อมูล'}</td>
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

// ==================== BASIC FUNCTIONS ====================

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
        
        const item = historyData[index];
        
        // สร้าง popup แจ้งเตือนการลบรายการเดียว
        showConfirmDialog(
            '⚠️ ยืนยันการลบข้อมูล',
            `คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการทดสอบนี้?\n\n📝 ชื่อ: ${item.title || 'ไม่มีชื่อ'}\n📊 คะแนน: ${item.score}\n📅 วันที่: ${new Date(item.date).toLocaleDateString('th-TH')}\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`,
            'ลบรายการนี้',
            'ยกเลิก',
            () => {
                // ลบข้อมูล
                historyData.splice(index, 1);
                saveHistoryData();
                updateUI();
                showNotification('ลบประวัติเรียบร้อยแล้ว', 'success');
            },
            () => {
                showNotification('ยกเลิกการลบประวัติ', 'info');
            }
        );
    } catch (error) {
        console.error('deleteItem error:', error);
        showNotification('เกิดข้อผิดพลาดในการลบประวัติ', 'error');
    }
}

function clearAllHistory() {
    try {
        if (historyData.length === 0) {
            showNotification('ไม่มีประวัติที่จะลบ', 'info');
            return;
        }
        
        // สร้าง popup แจ้งเตือนสำหรับมือถือ
        showConfirmDialog(
            '⚠️ ยืนยันการลบข้อมูล',
            'คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการทดสอบทั้งหมด?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้',
            'ลบทั้งหมด',
            'ยกเลิก',
            () => {
                // ลบข้อมูล
                historyData = [];
                saveHistoryData();
                updateUI();
                showNotification('ลบประวัติทั้งหมดเรียบร้อยแล้ว', 'success');
            },
            () => {
                showNotification('ยกเลิกการลบประวัติ', 'info');
            }
        );
    } catch (error) {
        console.error('clearAllHistory error:', error);
        showNotification('เกิดข้อผิดพลาดในการล้างประวัติ', 'error');
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
                    <td style="padding: 6px; border: 1px solid #ddd;">${item.result || ''}</td>
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
        // Fallback ใช้ alert ธรรมดา
        alert(`${type.toUpperCase()}: ${message}`);
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
        // อ่านข้อมูลจาก localStorage (ใช้ key เดียวกับระบบหลัก)
        const savedData = localStorage.getItem('mindbloomData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            const history = data.assessmentHistory || [];
            
            if (history.length > 0) {
                // เรียงจากล่าสุดไปเก่าสุด
                const sortedHistory = history.sort((a, b) => {
                    const dateA = new Date(a.date || a.timestamp || 0);
                    const dateB = new Date(b.date || b.timestamp || 0);
                    return dateB - dateA;
                });
                
                const lastTest = sortedHistory[0];
                const lastTestDateElement = document.getElementById('lastTestDate');
                
                if (lastTestDateElement && (lastTest.date || lastTest.timestamp)) {
                    const date = new Date(lastTest.date || lastTest.timestamp);
                    const formattedDate = date.toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    lastTestDateElement.textContent = formattedDate;
                }
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