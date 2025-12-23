// ==========================================
// 1. ตัวแปร Global
// ==========================================
let currentSet = "";
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let musicPlaylist = [];
let currentTrackIndex = 0;
let selectedMoodEmoji = "";
let selectedMoodName = "";
let is2QMode = false;

// ==========================================
// 2. เริ่มต้นระบบ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    updateGreeting();
    initHomeData();
    setupAudioListeners();
    displayHistory();
});

async function initHomeData() {
    try {
        const resMusic = await fetch('music-url.json');
        musicPlaylist = await resMusic.json();
        if (musicPlaylist.length > 0) loadTrack(0, false);
    } catch (e) {
        const status = document.getElementById("musicStatus");
        if (status) status.innerText = "พร้อมฟังเพลงผ่อนคลายไหม?";
    }

    try {
        const resQuote = await fetch('quotes.json');
        const quotes = await resQuote.json();
        const rand = quotes[Math.floor(Math.random() * quotes.length)];
        const qText = document.getElementById("quoteText");
        const qAuthor = document.getElementById("quoteAuthor");
        if (qText) qText.innerText = rand.text;
        if (qAuthor) qAuthor.innerText = `- ${rand.author}`;
    } catch (e) {
        console.log("Quotes loading skipped.");
    }
}

function updateGreeting() {
    const hour = new Date().getHours();
    let text = "สวัสดีตอนดึก 🌙";
    if (hour >= 5 && hour < 12) text = "สวัสดีตอนเช้า ✨";
    else if (hour >= 12 && hour < 17) text = "สวัสดีตอนบ่าย 😊";
    else if (hour >= 17 && hour < 21) text = "สวัสดีตอนเย็น 🌅";
    const el = document.getElementById("greetingText");
    if (el) el.innerText = text;
}

// ==========================================
// 3. ระบบนำทาง (Navigation)
// ==========================================
function toggleMenu() {
    const menu = document.getElementById("menu");
    if (menu.classList.contains("hidden")) {
        menu.classList.remove("hidden");
        document.body.style.overflow = "hidden"; 
    } else {
        menu.classList.add("hidden");
        document.body.style.overflow = "auto";
    }
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    if (id === 'history') displayHistory();
    
    const menu = document.getElementById("menu");
    if (menu) menu.classList.add("hidden");
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
}

// ==========================================
// 4. บันทึกอารมณ์ & ประวัติ
// ==========================================
function selectMood(name, emoji) {
    selectedMoodName = name;
    selectedMoodEmoji = emoji;
    const section = document.getElementById("noteSection");
    const text = document.getElementById("selectedMoodText");
    if (section) section.classList.remove("hidden");
    if (text) text.innerHTML = `ตอนนี้คุณรู้สึก: <strong>${emoji} ${name}</strong>`;
}

function saveMoodAndNote() {
    const noteEl = document.getElementById("moodNote");
    if (!selectedMoodName) return alert("กรุณาเลือกอารมณ์ก่อนบันทึกนะครับ");

    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    notes.unshift({
        date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        text: `อารมณ์: ${selectedMoodEmoji} ${selectedMoodName}\nบันทึก: ${noteEl.value}`
    });
    
    localStorage.setItem("myNotes", JSON.stringify(notes));
    alert("บันทึกความรู้สึกเรียบร้อยแล้ว ❤️");
    
    if (noteEl) noteEl.value = "";
    document.getElementById("noteSection").classList.add("hidden");
    showPage('history');
}

function displayHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;
    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    
    list.innerHTML = notes.map((n, i) => `
        <div class="glass-card" style="margin-bottom:12px; border-left: 5px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <small style="color:#888;">${n.date}</small>
                <button onclick="deleteNote(${i})" style="color:#d9534f; border:none; background:none; cursor:pointer; font-size:0.8rem;">ลบ</button>
            </div>
            <p style="white-space: pre-wrap; margin-top:8px;">${n.text}</p>
        </div>
    `).join('') || "<p style='text-align:center;'>ยังไม่มีบันทึกใจ</p>";
}

function deleteNote(i) {
    if (confirm("ลบบันทึกนี้ใช่ไหม?")) {
        const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
        notes.splice(i, 1);
        localStorage.setItem("myNotes", JSON.stringify(notes));
        displayHistory();
    }
}

// ==========================================
// 5. ระบบแบบทดสอบ (Core Logic)
// ==========================================
function startPreScreening(set) {
    is2QMode = (set === 'PHQ2');
    startScreening(set);
}

function startTest(set) {
    is2QMode = false;
    startScreening(set);
}

function startScreening(set) {
    if (typeof QUESTIONS === 'undefined' || !QUESTIONS[set]) {
        return alert("ไม่พบข้อมูลชุดคำถาม กรุณาตรวจสอบการเชื่อมต่อไฟล์ questions.js");
    }
    currentSet = set;
    currentQuestions = QUESTIONS[set].questions;
    currentIndex = 0;
    answers = [];
    updateQuestionUI();
    showPage('screening');
}

function updateQuestionUI() {
    document.getElementById("qTitle").innerText = QUESTIONS[currentSet].title;
    document.getElementById("qNumber").innerText = `ข้อที่ ${currentIndex + 1} / ${currentQuestions.length}`;
    document.getElementById("qText").innerText = currentQuestions[currentIndex];
    
    const options = OPTIONS[currentSet];
    document.getElementById("qOptions").innerHTML = options.map(opt => `
        <button class="option-btn" onclick="handleAnswer(${opt.score})">
            ${opt.text}
        </button>
    `).join('');
}

function handleAnswer(score) {
    answers.push(score);
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        setTimeout(updateQuestionUI, 150);
    } else {
        const total = answers.reduce((a, b) => a + b, 0);
        
        // Logic 2Q -> PHQ9
        if (is2QMode && currentSet === 'PHQ2' && total > 0) {
            alert("พบความเสี่ยงเบื้องต้น โปรดทำแบบประเมิน PHQ-9 ต่อครับ");
            is2QMode = false;
            startScreening('PHQ9');
            return;
        }
        showDetailedResult(total, currentSet);
    }
}

// ==========================================
// 6. ระบบแสดงผลลัพธ์เชิงลึก & สถิติ
// ==========================================
function showDetailedResult(total, set) {
    const interpretationSet = INTERPRETATION[set];
    let finalScore = total;
    
    // กำหนดคะแนนเต็มเพื่อทำกราฟ
    let maxScore = 15; // default สำหรับ Burnout/ST5
    if (set === 'PHQ9') maxScore = 27;
    if (set === 'ST5') maxScore = 20;
    if (set === 'WHO5') { maxScore = 100; finalScore = total * 4; }
    if (set === 'PHQ2') maxScore = 2;

    const result = interpretationSet.find(i => finalScore >= i.range[0] && finalScore <= i.range[1]);

    // --- ส่วนสถิติย้อนหลัง ---
    const statsKey = `stats_${set}`;
    const stats = JSON.parse(localStorage.getItem(statsKey) || "[]");
    stats.push({ score: finalScore, date: new Date().toLocaleDateString('th-TH', {day:'numeric', month:'short'}) });
    if (stats.length > 3) stats.shift(); // เก็บแค่ 3 ครั้งล่าสุด
    localStorage.setItem(statsKey, JSON.stringify(stats));

    // วาดกราฟแท่ง
    const historyBars = document.getElementById("historyBars");
    if (historyBars) {
        historyBars.innerHTML = stats.map(s => `
            <div class="bar-item">
                <div class="bar" style="height: ${Math.max((s.score / maxScore) * 100, 5)}%">
                    <span class="bar-value">${s.score}</span>
                </div>
                <span class="bar-date">${s.date}</span>
            </div>
        `).join('');
    }

    // --- อัปเดต UI ผลลัพธ์ ---
    document.getElementById("resLevel").innerText = result ? result.level : "เสร็จสิ้น";
    document.getElementById("resScore").innerText = finalScore;
    document.getElementById("maxScoreLabel").innerText = `จากคะแนนเต็ม ${maxScore}`;
    document.getElementById("resAdvice").innerText = result ? result.recommendation : "ดูแลใจให้ดีนะ";
    document.getElementById("resDate").innerText = "วันที่ประเมิน: " + new Date().toLocaleString('th-TH');

    // อัปเดต Progress Bar และสี Banner
    const percent = (finalScore / maxScore) * 100;
    document.getElementById("resBar").style.width = percent + "%";
    
    const header = document.getElementById("resultHeader");
    if (percent < 35) header.style.background = "#8da399"; // เขียว/เทา
    else if (percent < 65) header.style.background = "#ebbc5e"; // เหลือง
    else header.style.background = "#d9534f"; // แดง

    // แสดงคำแนะนำทางการแพทย์ถ้าคะแนนสูง (>= 50%)
    const medicalBox = document.getElementById("medicalAdvice");
    if (medicalBox) {
        if (percent >= 50 && set !== 'WHO5') medicalBox.classList.remove("hidden");
        else medicalBox.classList.add("hidden");
    }

    showPage('result');
}

function shareResult() {
    const text = `ผลประเมินสุขภาพใจของฉัน: ${document.getElementById("resLevel").innerText} (คะแนน ${document.getElementById("resScore").innerText})`;
    if (navigator.share) {
        navigator.share({ title: 'แอปสุขใจ', text: text, url: window.location.href });
    } else {
        alert("คุณสามารถคัดลอกข้อความนี้เพื่อส่งต่อ: " + text);
    }
}

// ==========================================
// 7. ระบบเพลง & บทความ (ตามโค้ดเดิม)
// ==========================================
function loadTrack(idx, play = false) {
    currentTrackIndex = idx;
    const audio = document.getElementById("bgMusic");
    if (!musicPlaylist[idx] || !audio) return;
    audio.src = musicPlaylist[idx].url;
    document.getElementById("musicStatus").innerText = `🎵 ${musicPlaylist[idx].title}`;
    if (play) toggleMusic(true);
}

async function toggleMusic(force = false) {
    const audio = document.getElementById("bgMusic");
    const btn = document.getElementById("playPauseBtn");
    if (!audio) return;
    if (audio.paused || force) {
        try { await audio.play(); if(btn) btn.innerText = "⏸"; } 
        catch (e) { console.log("User interaction required"); }
    } else {
        audio.pause(); if(btn) btn.innerText = "▶";
    }
}

function nextTrack() { 
    if (musicPlaylist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length; 
    loadTrack(currentTrackIndex, true); 
}

function prevTrack() { 
    if (musicPlaylist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length; 
    loadTrack(currentTrackIndex, true); 
}

function setupAudioListeners() { 
    const audio = document.getElementById("bgMusic");
    if(audio) audio.addEventListener('ended', nextTrack); 
}

async function loadArticles() {
    let artSection = document.getElementById("articles");
    if (!artSection) {
        artSection = document.createElement("section");
        artSection.id = "articles";
        artSection.innerHTML = `<div class="section-header"><h2>บทความสุขภาพใจ 📚</h2></div><div id="articleList"></div><button class="btn-ghost" onclick="showPage('home')">กลับหน้าหลัก</button>`;
        document.querySelector("main").appendChild(artSection);
    }
    try {
        const res = await fetch('articles.json');
        const data = await res.json();
        const list = document.getElementById("articleList");
        list.innerHTML = data.map(a => `
            <div class="glass-card" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                <div><h4 style="margin:0;">${a.topic}</h4><p style="font-size:0.8rem; margin:5px 0 0; color:#666;">${a.description || ''}</p></div>
                <a href="${a.url}" target="_blank" class="btn-primary" style="width:auto; padding:8px 15px; font-size:0.8rem; text-decoration:none;">อ่าน</a>
            </div>
        `).join('');
        showPage('articles');
    } catch (e) { alert("ยังไม่มีบทความในขณะนี้"); }
}