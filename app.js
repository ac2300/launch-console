// Launch Console - app logic
const STORAGE_KEY = "launch-console-tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");

let tasks = loadTasks();

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable (e.g. private mode) - app still works for this session
  }
}

function addTask(title) {
  tasks.push({ id: Date.now().toString(), title, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = pct + "%";
  const ready = total > 0 && done === total;
  progressLabel.textContent = ready
    ? "100% ready - you're cleared for launch! 🚀"
    : `${pct}% ready (${done} of ${total} tasks done)`;
  progressLabel.classList.toggle("ready", ready);
}

function render() {
  list.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, title, del);
    list.appendChild(li);
  });
  emptyState.hidden = tasks.length > 0;
  renderProgress();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title);
  input.value = "";
  input.focus();
});

render();
