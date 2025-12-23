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
// 2. เริ่มต้นระบบ (Fixed Error Points)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    updateGreeting();
    initHomeData();
    setupAudioListeners();
    displayHistory();
});

async function initHomeData() {
    // 1. โหลดเพลง
    try {
        const resMusic = await fetch('music-url.json');
        musicPlaylist = await resMusic.json();
        if (musicPlaylist.length > 0) loadTrack(0, false);
    } catch (e) {
        const status = document.getElementById("musicStatus");
        if (status) status.innerText = "พร้อมฟังเพลงผ่อนคลายไหม?";
    }

    // 2. โหลดคำคม (เพิ่ม Check ป้องกัน Error null)
    try {
        const resQuote = await fetch('quotes.json');
        const quotes = await resQuote.json();
        const rand = quotes[Math.floor(Math.random() * quotes.length)];
        
        const qText = document.getElementById("quoteText");
        const qAuthor = document.getElementById("quoteAuthor");
        
        if (qText) qText.innerText = rand.text;
        if (qAuthor) qAuthor.innerText = `- ${rand.author}`;
    } catch (e) {
        console.log("Quote elements not found or file missing - skipping.");
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
// 3. ระบบนำทาง
// ==========================================
function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    if (id === 'history') displayHistory();
    document.getElementById("menu").classList.add("hidden");
    window.scrollTo(0, 0);
}

function toggleMenu() {
    document.getElementById("menu").classList.toggle("hidden");
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
    if (text) text.innerText = `ตอนนี้คุณรู้สึก: ${emoji} ${name}`;
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
    displayHistory();
}

function displayHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;
    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    
    list.innerHTML = notes.map((n, i) => `
        <div class="glass-card" style="margin-bottom:12px; border-left: 5px solid var(--primary);">
            <div style="display:flex; justify-content:space-between;">
                <small style="color:#888;">${n.date}</small>
                <button onclick="deleteNote(${i})" style="color:#d9534f; border:none; background:none; cursor:pointer;">ลบ</button>
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
// 5. ระบบเพลง
// ==========================================
function loadTrack(idx, play = false) {
    currentTrackIndex = idx;
    const audio = document.getElementById("bgMusic");
    if (!musicPlaylist[idx] || !audio) return;
    audio.src = musicPlaylist[idx].url;
    document.getElementById("musicStatus").innerText = `🎵 กำลังเล่น: ${musicPlaylist[idx].title}`;
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

function nextTrack() { currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length; loadTrack(currentTrackIndex, true); }
function prevTrack() { currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length; loadTrack(currentTrackIndex, true); }
function setupAudioListeners() { 
    const audio = document.getElementById("bgMusic");
    if(audio) audio.addEventListener('ended', nextTrack); 
}

// ==========================================
// 6. ระบบแบบทดสอบ
// ==========================================
function startPreScreening(set) {
    is2QMode = (set === 'PHQ2');
    startScreening(set);
}

function startScreening(set) {
    if (typeof QUESTIONS === 'undefined' || !QUESTIONS[set]) return alert("ไม่พบข้อมูลชุดนี้");
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
    
    const options = OPTIONS[currentSet] || OPTIONS.PHQ9;
    document.getElementById("qOptions").innerHTML = options.map(opt => `
        <button class="option-btn" style="width:100%; padding:15px; margin-bottom:10px; border-radius:12px; border:1px solid var(--primary); background:white; cursor:pointer;" onclick="handleAnswer(${opt.score})">
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
        if (is2QMode && currentSet === 'PHQ2' && total > 0) {
            alert("พบความเสี่ยงเบื้องต้น โปรดทำแบบประเมิน PHQ-9 ต่อครับ");
            is2QMode = false;
            startScreening('PHQ9');
        } else {
            const result = INTERPRETATION[currentSet].find(i => total >= i.range[0] && total <= i.range[1]);
            document.getElementById("resLevel").innerText = result ? result.level : "เสร็จสิ้น";
            document.getElementById("resScore").innerText = `คะแนนรวม: ${total}`;
            document.getElementById("resAdvice").innerText = result ? result.recommendation : "ดูแลใจให้ดีนะ";
            showPage('result');
        }
    }
}

// ==========================================
// 7. ระบบบทความ (Fixed Articles)
// ==========================================
async function loadArticles() {
    // สร้าง Section สำหรับบทความถ้ายังไม่มีใน HTML (กันพัง)
    let artSection = document.getElementById("articles");
    if (!artSection) {
        artSection = document.createElement("section");
        artSection.id = "articles";
        artSection.innerHTML = `<h2>บทความสุขภาพใจ 📚</h2><div id="articleList"></div><button class="btn-main" onclick="showPage('home')">กลับหน้าหลัก</button>`;
        document.querySelector("main").appendChild(artSection);
    }

    try {
        const res = await fetch('articles.json');
        const data = await res.json();
        const list = document.getElementById("articleList");
        
        list.innerHTML = data.map(a => `
            <div class="glass-card" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0;">${a.topic}</h4>
                    <p style="font-size:0.8rem; margin:5px 0 0;">${a.description || ''}</p>
                </div>
                <a href="${a.url}" target="_blank" style="background:var(--primary); color:white; padding:8px 12px; border-radius:8px; text-decoration:none; font-size:0.8rem;">อ่าน</a>
            </div>
        `).join('');
        
        showPage('articles');
    } catch (e) {
        alert("ยังไม่มีบทความในขณะนี้");
    }
}