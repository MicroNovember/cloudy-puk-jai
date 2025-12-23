// ==========================================
// 1. ตัวแปร Global
// ==========================================
let currentSet = "";
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let is2QMode = false;
let musicPlaylist = [];
let currentTrackIndex = 0;

// ==========================================
// 2. ระบบเริ่มต้น (Initial Load)
// ==========================================
async function initHome() {
    // โหลดคำคม
    try {
        const resQuote = await fetch('quotes.json');
        const quotes = await resQuote.json();
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById("quoteText").innerText = `"${q.text}"`;
        document.getElementById("quoteAuthor").innerText = `- ${q.author}`;
    } catch (e) { 
        document.getElementById("quoteText").innerText = "วันนี้คุณเก่งมากแล้ว"; 
    }

    // โหลดเพลงและตั้งค่าเครื่องเล่น
    try {
        const resMusic = await fetch('music-url.json');
        musicPlaylist = await resMusic.json();
        renderPlaylist();
        // สุ่มเพลงเริ่มต้น 1 เพลง
        loadTrack(Math.floor(Math.random() * musicPlaylist.length), false);
    } catch (e) { 
        console.error("Music load error:", e); 
    }

    displayNotes();
    setupAudioListeners();
}

// ==========================================
// 3. ระบบเครื่องเล่นเพลง (Music Player)
// ==========================================
function renderPlaylist() {
    const container = document.getElementById("playlistContainer");
    if (!container) return;
    container.innerHTML = musicPlaylist.map((track, index) => `
        <div class="track-item" id="track-${index}" onclick="loadTrack(${index}, true)">
            <span>${index + 1}. ${track.title}</span>
            <small>▶</small>
        </div>
    `).join('');
}

function loadTrack(index, shouldPlay = false) {
    currentTrackIndex = index;
    const audio = document.getElementById("bgMusic");
    const status = document.getElementById("musicStatus");
    const track = musicPlaylist[index];

    if (!track) return;

    audio.src = track.url;
    audio.load();
    status.innerText = `🎵 กำลังเล่น: ${track.title}`;
    
    // ไฮไลท์เพลงในรายการ
    document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`track-${index}`);
    if (activeItem) activeItem.classList.add('active');

    if (shouldPlay) {
        toggleMusic(true);
    }
}

async function toggleMusic(forcePlay = false) {
    const audio = document.getElementById("bgMusic");
    const btn = document.getElementById("playPauseBtn");

    if (audio.paused || forcePlay) {
        try {
            await audio.play();
            btn.innerText = "⏸";
        } catch (e) { 
            console.log("Play blocked by browser. Interaction required."); 
        }
    } else {
        audio.pause();
        btn.innerText = "▶";
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    loadTrack(currentTrackIndex, true);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    loadTrack(currentTrackIndex, true);
}

function setupAudioListeners() {
    const audio = document.getElementById("bgMusic");
    const seekSlider = document.getElementById("seekSlider");
    const volSlider = document.getElementById("volumeSlider");

    // อัปเดตเวลาและแถบ Progress
    audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime;
        const duration = audio.duration;
        if (duration) {
            seekSlider.value = (current / duration) * 100;
            document.getElementById("currentTime").innerText = formatTime(current);
            document.getElementById("durationTime").innerText = formatTime(duration);
        }
    });

    // เลื่อนเวลาเพลง
    seekSlider.addEventListener('input', () => {
        const duration = audio.duration;
        audio.currentTime = (seekSlider.value / 100) * duration;
    });

    // ปรับเสียง
    volSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // เมื่อจบเพลงให้สุ่มเล่นเพลงถัดไป
    audio.addEventListener('ended', () => {
        nextTrack();
    });

    // กรณีโหลดเพลงไม่ได้
    audio.onerror = () => {
        document.getElementById("musicStatus").innerText = "⚠️ ลิงก์เสีย กำลังข้ามเพลง...";
        setTimeout(nextTrack, 2000);
    };
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ==========================================
// 4. ระบบบันทึกใจ (Accordion Journal)
// ==========================================
function saveNote() {
    const text = document.getElementById("dailyNote").value;
    if(!text.trim()) return alert("พิมพ์ข้อความก่อนบันทึกนะ");
    
    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    notes.unshift({ 
        date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }), 
        text: text 
    });
    localStorage.setItem("myNotes", JSON.stringify(notes));
    document.getElementById("dailyNote").value = "";
    displayNotes();
}

function displayNotes() {
    const list = document.getElementById("notesList");
    if (!list) return;
    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    
    list.innerHTML = notes.map((n, index) => `
        <div class="note-wrapper">
            <div class="note-header" onclick="toggleNote(${index})">
                <span>📅 ${n.date}</span>
                <span id="icon-${index}">▼</span>
            </div>
            <div id="content-${index}" class="note-content hidden">
                <p>${n.text}</p>
                <button class="delete-btn" onclick="deleteNote(${index})">ลบบันทึก</button>
            </div>
        </div>
    `).join('') || "<p>ยังไม่มีบันทึก</p>";
}

function toggleNote(index) {
    const content = document.getElementById(`content-${index}`);
    const icon = document.getElementById(`icon-${index}`);
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.innerText = "▲";
    } else {
        content.classList.add('hidden');
        icon.innerText = "▼";
    }
}

function deleteNote(index) {
    if(confirm("ต้องการลบบันทึกนี้ใช่ไหม?")) {
        const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
        notes.splice(index, 1);
        localStorage.setItem("myNotes", JSON.stringify(notes));
        displayNotes();
    }
}

// ==========================================
// 5. ระบบแบบทดสอบ (Screening)
// ==========================================
function startPreScreening(set) {
    is2QMode = true;
    startScreening(set);
}

function startScreening(set) {
    currentSet = set;
    currentQuestions = QUESTIONS[set].questions;
    currentIndex = 0;
    answers = new Array(currentQuestions.length).fill(null);
    updateQuestionUI();
    showPage("screening");
}

function updateQuestionUI() {
    document.getElementById("qTitle").innerText = QUESTIONS[currentSet].title;
    document.getElementById("qNumber").innerText = `ข้อที่ ${currentIndex + 1} / ${currentQuestions.length}`;
    document.getElementById("qText").innerText = currentQuestions[currentIndex];
    
    const container = document.getElementById("qOptions");
    container.innerHTML = "";
    const choices = OPTIONS[currentSet];
    
    choices.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = `choice-btn ${answers[currentIndex] === opt.score ? 'selected' : ''}`;
        btn.innerText = opt.text;
        btn.onclick = () => { 
            answers[currentIndex] = opt.score; 
            updateQuestionUI(); 
        };
        container.appendChild(btn);
    });

    document.getElementById("prevBtn").style.visibility = currentIndex === 0 ? "hidden" : "visible";
    document.getElementById("nextBtn").innerText = currentIndex === currentQuestions.length - 1 ? "สรุปผล" : "ถัดไป";
}

function nextQuestion() {
    if(answers[currentIndex] === null) return alert("กรุณาเลือกคำตอบก่อนนะ");
    if(currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        updateQuestionUI();
    } else {
        processFinalResult();
    }
}

function prevQuestion() {
    if(currentIndex > 0) {
        currentIndex--;
        updateQuestionUI();
    }
}

function processFinalResult() {
    const totalScore = answers.reduce((a, b) => a + b, 0);
    
    if (is2QMode && currentSet === "PHQ2") {
        if (totalScore > 0) {
            is2QMode = false;
            alert("พบความเสี่ยงเบื้องต้น กรุณาตอบแบบสอบถาม PHQ-9 ต่อครับ");
            startScreening("PHQ9");
        } else {
            showResultPage("ปกติ", "ยินดีด้วย! คุณไม่มีความเสี่ยงภาวะซึมเศร้าเบื้องต้น", totalScore);
        }
    } else {
        let scoreToUse = totalScore;
        if(currentSet === "WHO5") scoreToUse = Math.round((totalScore / 25) * 100);

        const interp = INTERPRETATION[currentSet];
        const res = interp.find(i => scoreToUse >= i.range[0] && scoreToUse <= i.range[1]);
        
        let advice = res ? res.recommendation : "ดูแลใจตัวเองสม่ำเสมอนะ";
        if (currentSet === "PHQ9" && answers[8] > 0) {
            advice = "⚠️ **สำคัญ:** คุณมีคะแนนในข้อที่เกี่ยวกับการทำร้ายตนเอง โปรดปรึกษาผู้เชี่ยวชาญทันที";
        }
        showResultPage(res ? res.level : "เสร็จสิ้น", advice, totalScore, scoreToUse);
    }
}

function showResultPage(level, advice, raw, percent) {
    document.getElementById("resLevel").innerText = level;
    document.getElementById("resScore").innerText = currentSet === "WHO5" ? `คะแนน: ${percent}%` : `คะแนนรวม: ${raw}`;
    document.getElementById("resAdvice").innerText = advice;
    showPage("result");
}

// ==========================================
// 6. Navigation & Global Helpers
// ==========================================
function showPage(id) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.getElementById("menu").classList.add("hidden");
    window.scrollTo(0,0);
}

function toggleMenu() {
    document.getElementById("menu").classList.toggle("hidden");
}

async function loadArticles() {
    const res = await fetch('articles.json');
    const data = await res.json();
    document.getElementById("articleList").innerHTML = data.map(a => `
        <div class="glass-card">
            <h4>${a.topic}</h4>
            <a href="${a.url}" target="_blank">อ่านต่อ ➔</a>
        </div>
    `).join('');
    showPage("articles");
}

document.addEventListener("DOMContentLoaded", initHome);