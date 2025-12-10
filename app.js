// ตัวแปร Global 
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let currentSet = "";

let answers2Q = []; // เก็บคำตอบ 2Q
let currentIndex2Q = 0; // Index สำหรับ 2Q


// Helper Function: สลับตำแหน่งใน Array
function shuffleArray(arr) {
   return arr.sort(() => Math.random() - 0.5);
}

// Utility Function: สลับหน้า
function showPage(pageId) {
   document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
   document.getElementById(pageId).classList.add("active");
  
  // ซ่อนเมนูเมื่อมีการสลับหน้า (สำหรับ Mobile)
  const menu = document.getElementById("menu");
  if (window.innerWidth < 768 && !menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
  }
}

// Function: Toggle Hamburger Menu
function toggleMenu() {
    document.getElementById("menu").classList.toggle("hidden");
}

// =======================================================
// 1. Logic สำหรับ 2Q Pre-Screening
// =======================================================

// Function: เริ่มการทำแบบทดสอบ 2Q
function startPreScreening(setName) {
    //setName คือ 'PHQ2'
    currentQuestions = QUESTIONS[setName].questions;
    currentIndex2Q = 0;
    answers2Q = new Array(currentQuestions.length).fill(null);
    
    document.getElementById("questionTitle2Q").innerText = QUESTIONS[setName].title;
    
    showQuestion2Q();
    showPage("screening2Q");
}

// Function: แสดงคำถาม 2Q
function showQuestion2Q() {
    const q = currentQuestions[currentIndex2Q];
    
    document.getElementById("questionNumber2Q").innerText = `คำถามข้อที่ ${currentIndex2Q + 1}/${currentQuestions.length}`;
    document.getElementById("questionText2Q").innerText = q;

    const form = document.getElementById("questionForm2Q");
    form.innerHTML = "";
    
    // ดึงตัวเลือกคำตอบจาก OPTIONS.PHQ2
    const choices = OPTIONS.PHQ2; 

    choices.forEach(c => {
        const label = document.createElement("label");
        label.className = "choice";
        
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "answer2Q";
        input.value = c.score; 
        
        if (answers2Q[currentIndex2Q] !== null && answers2Q[currentIndex2Q] === c.score) {
            input.checked = true;
        }
        
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + c.text));
        form.appendChild(label);
    });
}

// Function: ไปคำถามถัดไปของ 2Q / คำนวณผล 2Q
function nextQuestion2Q() {
    const selected = document.querySelector('#questionForm2Q input[name="answer2Q"]:checked');
    if (!selected) {
        alert("กรุณาเลือกคำตอบก่อน");
        return;
    }
    answers2Q[currentIndex2Q] = parseInt(selected.value, 10);

    if (currentIndex2Q < currentQuestions.length - 1) {
        currentIndex2Q++;
        showQuestion2Q();
    } else {
        calculateResult2Q();
    }
}

// Function: คำนวณผลลัพธ์ 2Q และตัดสินใจ
function calculateResult2Q() {
    const total2Q = answers2Q.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);

    if (total2Q > 0) {
        // ผล: เข้าข่าย -> ให้ทำ PHQ-9 ต่อ
        alert("ผลการคัดกรองเบื้องต้นพบอาการที่เข้าข่าย กรุณาทำแบบสอบถาม PHQ-9 ต่อเพื่อประเมินระดับอาการ");
        
        // ** เริ่ม PHQ-9 จริง **
        startScreening('PHQ9'); 
    } else {
        // ผล: ไม่เข้าข่าย -> จบการทดสอบ
        showResult2Q(total2Q); 
    }
}

// Function: แสดงผลลัพธ์ 2Q (เมื่อคะแนนเป็น 0)
function showResult2Q(totalScore) {
    const resultDiv = document.getElementById("scoreSummary");
    const recommendationDiv = document.getElementById("recommendation");
    const tableDiv = document.getElementById("scoreTable");
    
    const resultData = INTERPRETATION.PHQ2.find(item => {
        const [min, max] = item.range;
        return totalScore >= min && totalScore <= max;
    });

    resultDiv.innerHTML = `
        <h2>${QUESTIONS.PHQ2.title}</h2>
        <p>คะแนนรวมที่ได้รับ: <strong>${totalScore}</strong></p>
        <p><strong>ระดับการประเมิน: ${resultData.level}</strong></p>
    `;
    
    recommendationDiv.innerHTML = `<p class="advice-text">${resultData.recommendation}</p>`;
    
    // เคลียร์ตารางผลลัพธ์อื่น ๆ
    tableDiv.innerHTML = ""; 

    showPage("result");
}

// =======================================================
// 2. Logic สำหรับแบบทดสอบเต็มรูปแบบ (PHQ9, WHO5, ST5)
// =======================================================

// Function: เริ่มการทำแบบทดสอบ (สำหรับ WHO5, ST5, และ PHQ9 หลังผ่าน 2Q)
function startScreening(setName) {
   currentSet = setName;
   
   const questionList = QUESTIONS[setName].questions; 
   
   currentQuestions = shuffleArray([...questionList]);
   currentIndex = 0;
   answers = new Array(currentQuestions.length).fill(null); 
  
  // แสดงชื่อแบบทดสอบ
  document.getElementById("questionTitle").innerText = QUESTIONS[setName].title;

   showQuestion();
   showPage("screening");
}

// Function: แสดงคำถามปัจจุบัน
function showQuestion() {
   const q = currentQuestions[currentIndex];
   document.getElementById("questionNumber").innerText = `คำถามข้อที่ ${currentIndex + 1}/${currentQuestions.length}`;
   document.getElementById("questionText").innerText = q;

   const form = document.getElementById("questionForm");
   form.innerHTML = "";
  
   // ดึงตัวเลือกคำตอบจาก OPTIONS (questions.js)
   const choices = OPTIONS[currentSet]; 

   choices.forEach(c => {
      const label = document.createElement("label");
      label.className = "choice";
      
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = c.score; 
      
      if (answers[currentIndex] !== null && answers[currentIndex] === c.score) {
        input.checked = true;
    }
    
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + c.text));
      form.appendChild(label);
   });
  
  // สร้างและแสดงปุ่มนำทาง (ย้อนกลับ/ต่อไป/เสร็จสิ้น)
  createNavigationButtons();
}

// Function: สร้างปุ่มนำทาง
function createNavigationButtons() {
    const navDiv = document.querySelector("#screening .navigation-buttons");
    navDiv.innerHTML = "";

    // ปุ่มย้อนกลับ
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn prev-btn";
    prevBtn.innerText = "ย้อนกลับ";
    prevBtn.onclick = prevQuestion;
    prevBtn.disabled = currentIndex === 0;
    navDiv.appendChild(prevBtn);

    // ปุ่มต่อไป/เสร็จสิ้น
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn next-btn";
    nextBtn.onclick = nextQuestion;
    if (currentIndex < currentQuestions.length - 1) {
        nextBtn.innerText = "ต่อไป";
    } else {
        nextBtn.innerText = "เสร็จสิ้น";
    }
    navDiv.appendChild(nextBtn);
}


// Function: ไปคำถามถัดไป
function nextQuestion() {
   const selected = document.querySelector('input[name="answer"]:checked');
   if (!selected) {
      alert("กรุณาเลือกคำตอบก่อน");
      return;
   }
   // บันทึกค่าคะแนนที่เลือก
   answers[currentIndex] = parseInt(selected.value, 10);

   if (currentIndex < currentQuestions.length - 1) {
      currentIndex++;
      showQuestion();
   } else {
      calculateResult();
   }
}

// Function: ย้อนกลับคำถามก่อนหน้า
function prevQuestion() {
   if (currentIndex > 0) {
      currentIndex--;
      showQuestion();
   }
}

// Function: คำนวณและแสดงผลลัพธ์
function calculateResult() {
   const total = answers.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
  
   const interpretationData = INTERPRETATION[currentSet]; 
   const currentQuestionSet = QUESTIONS[currentSet];
  
   let summaryTitle = currentQuestionSet.title;
   let tableHTML = "<tr><th>เกณฑ์คะแนน</th><th>ระดับการแปลผล</th></tr>";
   let advice = "";
   let summaryLine = "";
  
  let scoreForInterpretation = total;
  
  // Logic สำหรับ WHO5: แปลงคะแนนรวม (0-25) เป็นเปอร์เซ็นต์ (0-100)
  if (currentSet === "WHO5") {
      const maxScore = currentQuestions.length * 5; 
      scoreForInterpretation = Math.round((total / maxScore) * 100); 
      summaryLine = `คะแนนสุขภาวะทางใจ: ${scoreForInterpretation}%`;
  } else {
      summaryLine = `คะแนนรวม: ${total}`;
  }

  // หาผลลัพธ์ที่ตรงกับช่วงคะแนน
   const result = interpretationData.find(item => {
         const [min, max] = item.range;
         return scoreForInterpretation >= min && scoreForInterpretation <= max;
   });
  
  if (result) {
      advice = result.recommendation;
      summaryLine += `\nระดับการประเมิน: ${result.level}`;
  } else {
      advice = "ไม่พบข้อมูลการแปลผลสำหรับคะแนนนี้";
  }

  // สร้างตารางผลลัพธ์
  interpretationData.forEach(item => {
      const [min, max] = item.range;
      const isCurrentRange = scoreForInterpretation >= min && scoreForInterpretation <= max;
      
      let scoreDisplay = `${min} - ${max}`;
      if (currentSet === "WHO5") {
          scoreDisplay = `${min}% - ${max}%`;
      } else if (currentSet === "PHQ9") {
          scoreDisplay = `${min}${max === 27 ? '+' : ` - ${max}`}`; 
      }
      
      tableHTML += `
          <tr${isCurrentRange ? ' class="highlight-row"' : ''}>
              <td>${scoreDisplay}</td>
              <td>${item.level}</td>
          </tr>
      `;
  });

   // Logic พิเศษสำหรับข้อ 9 ของ PHQ9 (ความคิดฆ่าตัวตาย/ทำร้ายตนเอง)
   if (currentSet === "PHQ9" && answers.length === 9 && answers[8] > 0) {
         advice = "⚠️ **คำเตือนเร่งด่วน:** พบการประเมินความคิดอยากทำร้ายตนเอง กรุณาติดต่อสายด่วนสุขภาพจิต 1323 หรือพบแพทย์โดยด่วน";
   }

   // แสดงผล
   document.getElementById("scoreSummary").innerHTML = `
      <h2>${summaryTitle}</h2>
      <p>คะแนนรวมที่ได้รับ: <strong>${total}</strong></p>
      <p><strong>${summaryLine.replace('\n', '<br>')}</strong></p>
  `;
   document.getElementById("scoreTable").innerHTML = `<table>${tableHTML}</table>`;
   document.getElementById("recommendation").innerHTML = `<p class="advice-text">${advice}</p>`;

   showPage("result");
}

// =======================================================
// 3. Logic สำหรับบทความ
// =======================================================

// Function: โหลดบทความ
function loadArticles() {
   fetch("articles.json")
      .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
      .then(data => {
         const list = document.getElementById("articleList");
         list.innerHTML = "";
         data.forEach(item => {
            const li = document.createElement("li");
        li.className = "article-item";
            const link = document.createElement("a");
            link.href = item.url;
            link.target = "_blank";
            link.innerText = item.topic;
            li.appendChild(link);
            list.appendChild(li);
         });
         showPage("articles");
      })
      .catch(err => {
         console.error("Error loading articles:", err);
         document.getElementById("articleList").innerHTML =
            "<li>ไม่สามารถโหลดบทความได้ กรุณาตรวจสอบไฟล์ articles.json</li>";
       showPage("articles");
      });
}

// Initial setup: ให้หน้าแรกเป็นหน้า active เมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    showPage('home'); 
});