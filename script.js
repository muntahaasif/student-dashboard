const $ = (selector) => document.querySelector(selector);

const studentForm = $("#studentForm");
const resultBody = $("#resultBody");
const searchInput = $("#search");
const statusFilter = $("#statusFilter");
const marksList = $("#marksList");
const topThree = $("#topThree");
const avgOutput = $("#avgOutput");
const toast = $("#toast");

let students = [
  { id: 1, name: "Ayesha Khan", city: "Karachi", math: 94, english: 91, passMarks: 100 },
  { id: 2, name: "Hamza Ali", city: "Lahore", math: 88, english: 84, passMarks: 100 },
  { id: 3, name: "Zara Ahmed", city: "Islamabad", math: 98, english: 96, passMarks: 100 },
  { id: 4, name: "Hassan Raza", city: "Karachi", math: 62, english: 71, passMarks: 100 },
  { id: 5, name: "Mariam Noor", city: "Hyderabad", math: 76, english: 82, passMarks: 100 },
  { id: 6, name: "Usman Shah", city: "Multan", math: 42, english: 49, passMarks: 100 }
];

let clickCount = 0;

function getTotal(student) {
  return student.math + student.english;
}

function getGrade(total) {
  const percentage = (total / 200) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

function isPassed(student) {
  return getTotal(student) >= student.passMarks;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0].toUpperCase()).join("");
}

function renderStats() {
  const totalStudents = students.length;
  const totalMarks = students.reduce((sum, student) => sum + getTotal(student), 0);
  const average = totalStudents ? totalMarks / (totalStudents * 2) : 0;
  const passed = students.filter(isPassed).length;
  const failed = totalStudents - passed;
  const passRate = totalStudents ? (passed / totalStudents) * 100 : 0;

  $("#totalStudents").textContent = totalStudents;
  $("#classAverage").innerHTML = `${average.toFixed(1)}<small>%</small>`;
  $("#passedStudents").textContent = passed;
  $("#failedStudents").textContent = failed;
  $("#passRate").textContent = `${passRate.toFixed(0)}% pass rate`;
  $("#passProgress").style.width = `${passRate}%`;
  $("#recordCount").textContent = `${totalStudents} RECORD${totalStudents === 1 ? "" : "S"}`;
}

function renderResults() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
      student.city.toLowerCase().includes(searchTerm);
    const matchesStatus = filter === "all" ||
      (filter === "pass" && isPassed(student)) ||
      (filter === "fail" && !isPassed(student));
    return matchesSearch && matchesStatus;
  });

  if (filteredStudents.length === 0) {
    resultBody.innerHTML = `<tr><td colspan="8" class="empty-row">No student records found. Try another search.</td></tr>`;
  } else {
    resultBody.innerHTML = filteredStudents.map(student => {
      const total = getTotal(student);
      const passed = isPassed(student);
      return `
        <tr>
          <td><div class="student-cell"><span class="student-avatar">${getInitials(student.name)}</span><span class="student-name">${escapeHTML(student.name)}</span></div></td>
          <td>${escapeHTML(student.city)}</td>
          <td>${student.math}</td>
          <td>${student.english}</td>
          <td class="total-cell">${total}<span style="color:#aab0bd;font-weight:400"> / 200</span></td>
          <td><span class="grade-pill">${getGrade(total)}</span></td>
          <td><span class="status-pill ${passed ? "pass" : "fail"}">${passed ? "Passed" : "Support"}</span></td>
          <td><button class="delete-btn" data-delete="${student.id}" aria-label="Delete ${escapeHTML(student.name)}" title="Delete student">✕</button></td>
        </tr>`;
    }).join("");
  }
  $("#showingText").textContent = `Showing ${filteredStudents.length} of ${students.length} students`;
}

function renderMarksList() {
  if (students.length === 0) {
    marksList.innerHTML = `<li class="no-marks">No marks to display yet.</li>`;
    return;
  }
  const sorted = [...students].sort((a, b) => getTotal(b) - getTotal(a));
  marksList.innerHTML = sorted.slice(0, 5).map(student => {
    const total = getTotal(student);
    const percentage = (total / 200) * 100;
    return `<li><span class="mark-name">${escapeHTML(student.name)}</span><span class="mark-track"><span style="width:${percentage}%"></span></span><span class="mark-value">${total}/200</span></li>`;
  }).join("");
}

function renderTopThree() {
  if (students.length === 0) {
    topThree.innerHTML = `<div class="rank-empty">Your class podium will appear here.</div>`;
    $("#others").textContent = "Add students to see the class ranking.";
    return;
  }

  const sorted = [...students].sort((a, b) => getTotal(b) - getTotal(a));
  const winners = sorted.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const positions = ["1ST PLACE", "2ND PLACE", "3RD PLACE"];
  const order = winners.length === 3 ? [1, 0, 2] : winners.map((_, index) => index);

  topThree.innerHTML = order.map(index => {
    const student = winners[index];
    return `<div class="rank-card ${index === 0 ? "first" : ""}">
      <span class="rank-medal">${medals[index]}</span>
      <span class="rank-position">${positions[index]}</span>
      <div class="rank-name" title="${escapeHTML(student.name)}">${escapeHTML(student.name)}</div>
      <div class="rank-score">${getTotal(student)}<small> / 200</small></div>
    </div>`;
  }).join("");

  const remaining = sorted.slice(3);
  $("#others").textContent = remaining.length
    ? `${remaining.length} more student${remaining.length === 1 ? "" : "s"} working towards the top.`
    : "Every student is featured on the podium!";
}

function renderAll() {
  renderStats();
  renderResults();
  renderMarksList();
  renderTopThree();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

studentForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#name").value.trim();
  const city = $("#city").value.trim();
  const math = Number($("#math").value);
  const english = Number($("#english").value);
  const passMarksInput = $("#passMarks").value;
  const passMarks = passMarksInput === "" ? 100 : Number(passMarksInput);

  if (!name || !city) {
    showToast("Please enter the student name and city.");
    return;
  }
  if (!Number.isFinite(math) || !Number.isFinite(english) ||
      math < 0 || math > 100 || english < 0 || english > 100) {
    showToast("Subject marks must be between 0 and 100.");
    return;
  }
  if (!Number.isFinite(passMarks) || passMarks < 0 || passMarks > 200) {
    showToast("Pass marks must be between 0 and 200.");
    return;
  }

  students.push({
    id: Date.now(),
    name,
    city,
    math,
    english,
    passMarks
  });

  studentForm.reset();
  renderAll();
  showToast(`${name} has been added successfully!`);
});

searchInput.addEventListener("input", renderResults);
statusFilter.addEventListener("change", renderResults);

resultBody.addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;

  const studentId = Number(deleteButton.dataset.delete);
  const student = students.find(item => item.id === studentId);
  students = students.filter(item => item.id !== studentId);
  renderAll();
  showToast(`${student ? student.name : "Student"} record removed.`);
});

$("#avgBtn").addEventListener("click", () => {
  if (students.length === 0) {
    avgOutput.textContent = "Add students first to calculate the class average.";
    return;
  }
  const total = students.reduce((sum, student) => sum + getTotal(student), 0);
  const average = total / students.length;
  avgOutput.textContent = `Class average: ${average.toFixed(1)} out of 200 (${(average / 2).toFixed(1)}%).`;
});

$("#counterBtn").addEventListener("click", () => {
  clickCount++;
  $("#counterOutput").textContent = clickCount;
});

$("#todayDate").textContent = new Intl.DateTimeFormat("en", {
  day: "numeric", month: "short", year: "numeric"
}).format(new Date());

$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("#sidebar").classList.remove("open");
  });
});

renderAll();
