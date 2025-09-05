// ------------------------------
// Selectors
// ------------------------------
const addTaskBtn = document.getElementById("addTaskBtn");
const titleInput = document.getElementById("taskTitle");
const assigneeInput = document.getElementById("taskAssignee");
const dueInput = document.getElementById("taskDue");

const board = document.getElementById("board");

// Modal elements
const modalBackdrop = document.getElementById("modalBackdrop");
const mTitle = document.getElementById("mTitle");
const mAssignee = document.getElementById("mAssignee");
const mDue = document.getElementById("mDue");
const mStatus = document.getElementById("mStatus");
const mDesc = document.getElementById("mDesc");
const commentsBox = document.getElementById("comments");
const cAuthor = document.getElementById("cAuthor");
const cText = document.getElementById("cText");

const addCommentBtn = document.getElementById("addComment");
const saveTaskBtn = document.getElementById("saveTask");
const closeModalBtn = document.getElementById("closeModal");
const deleteTaskBtn = document.getElementById("deleteTask");

// ------------------------------
// State
// ------------------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let activeTaskId = null;

// ------------------------------
// Helpers
// ------------------------------
function saveToStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounts() {
  ["todo", "doing", "done"].forEach(status => {
    const count = tasks.filter(t => t.status === status).length;
    document.getElementById(`count-${status}`).textContent = count;
  });
}

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task";
  card.draggable = true;
  card.dataset.id = task.id;
  card.innerHTML = `
    <div><b>${task.title}</b></div>
    <div style="font-size:12px; color:#ccc;">${task.assignee || ""} ${task.due ? " | Due: " + task.due : ""}</div>
  `;

  // Drag events
  card.addEventListener("dragstart", e => {
    e.dataTransfer.setData("id", task.id);
  });

  // Open modal
  card.addEventListener("click", () => openModal(task.id));

  return card;
}

function renderBoard() {
  ["todo", "doing", "done"].forEach(status => {
    const col = document.getElementById(`col-${status}`);
    col.innerHTML = "";
    tasks.filter(t => t.status === status).forEach(task => {
      col.appendChild(createTaskCard(task));
    });
  });
  updateCounts();
}

// ------------------------------
// Task CRUD
// ------------------------------
function addTask() {
  const title = titleInput.value.trim();
  if (!title) return alert("Enter a task title");

  const task = {
    id: Date.now().toString(),
    title,
    assignee: assigneeInput.value,
    due: dueInput.value,
    status: "todo",
    desc: "",
    comments: []
  };

  tasks.push(task);
  saveToStorage();
  renderBoard();

  titleInput.value = "";
  assigneeInput.value = "";
  dueInput.value = "";
}

function updateTask(id, updates) {
  const task = tasks.find(t => t.id === id);
  Object.assign(task, updates);
  saveToStorage();
  renderBoard();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage();
  renderBoard();
  closeModal();
}

// ------------------------------
// Modal Functions
// ------------------------------
function openModal(id) {
  activeTaskId = id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  mTitle.value = task.title;
  mAssignee.value = task.assignee;
  mDue.value = task.due;
  mStatus.value = task.status;
  mDesc.value = task.desc;

  commentsBox.innerHTML = "";
  task.comments.forEach(c => {
    const div = document.createElement("div");
    div.style.padding = "6px";
    div.style.background = "#1f1f1f";
    div.style.borderRadius = "4px";
    div.textContent = `${c.author}: ${c.text}`;
    commentsBox.appendChild(div);
  });

  modalBackdrop.classList.add("active");
}

function closeModal() {
  modalBackdrop.classList.remove("active");
  activeTaskId = null;
}

function saveModalTask() {
  if (!activeTaskId) return;
  updateTask(activeTaskId, {
    title: mTitle.value,
    assignee: mAssignee.value,
    due: mDue.value,
    status: mStatus.value,
    desc: mDesc.value
  });
  closeModal();
}

function addComment() {
  if (!activeTaskId) return;
  const author = cAuthor.value.trim();
  const text = cText.value.trim();
  if (!author || !text) return;

  const task = tasks.find(t => t.id === activeTaskId);
  task.comments.push({ author, text });

  cAuthor.value = "";
  cText.value = "";

  saveToStorage();
  openModal(activeTaskId); // re-render comments
}

// ------------------------------
// Drag & Drop
// ------------------------------
document.querySelectorAll(".dropzone").forEach(dz => {
  dz.addEventListener("dragover", e => e.preventDefault());
  dz.addEventListener("drop", e => {
    const id = e.dataTransfer.getData("id");
    const status = dz.id.replace("dz-", "");
    updateTask(id, { status });
  });
});

// ------------------------------
// Events
// ------------------------------
addTaskBtn.addEventListener("click", addTask);
saveTaskBtn.addEventListener("click", saveModalTask);
closeModalBtn.addEventListener("click", closeModal);
deleteTaskBtn.addEventListener("click", () => deleteTask(activeTaskId));
addCommentBtn.addEventListener("click", addComment);

// ------------------------------
// Init
// ------------------------------
renderBoard();
