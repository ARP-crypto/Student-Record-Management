/* CampusList - Student Record Management System
   Core records are maintained in a singly linked list. Local storage is used
   only for persistence between reloads in the same browser. */

'use strict';

const PASS_MARK = 40;
const STORAGE_KEY = 'campusList.studentRecords.v1';

class StudentNode {
  constructor(student) {
    this.rollNo = Number(student.rollNo);
    this.name = String(student.name).trim();
    this.marks = Number(student.marks);
    this.next = null;
  }
}

class StudentLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  findByRoll(rollNo) {
    let current = this.head;
    while (current !== null) {
      if (current.rollNo === Number(rollNo)) return current;
      current = current.next;
    }
    return null;
  }

  add(student) {
    if (this.findByRoll(student.rollNo)) {
      return { ok: false, message: 'That roll number is already in use.' };
    }
    const node = new StudentNode(student);
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next !== null) current = current.next;
      current.next = node;
    }
    this.size += 1;
    return { ok: true, node };
  }

  update(rollNo, updatedValues) {
    const node = this.findByRoll(rollNo);
    if (!node) return false;
    node.name = String(updatedValues.name).trim();
    node.marks = Number(updatedValues.marks);
    return true;
  }

  remove(rollNo) {
    let current = this.head;
    let previous = null;
    while (current !== null && current.rollNo !== Number(rollNo)) {
      previous = current;
      current = current.next;
    }
    if (current === null) return false;
    if (previous === null) this.head = current.next;
    else previous.next = current.next;
    current.next = null;
    this.size -= 1;
    return true;
  }

  toArray() {
    const records = [];
    let current = this.head;
    while (current !== null) {
      records.push({ rollNo: current.rollNo, name: current.name, marks: current.marks });
      current = current.next;
    }
    return records;
  }

  count() {
    let count = 0;
    let current = this.head;
    while (current !== null) {
      count += 1;
      current = current.next;
    }
    return count;
  }
}

const list = new StudentLinkedList();
let currentView = 'overview';
let modalMode = 'add';
let editingRollNo = null;
let toastTimeout = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  studentModal: $('#studentModal'),
  exitModal: $('#exitModal'),
  studentForm: $('#studentForm'),
  modalTitle: $('#modalTitle'),
  modalDescription: $('#modalDescription'),
  rollNo: $('#rollNo'),
  studentName: $('#studentName'),
  studentMarks: $('#studentMarks'),
  formError: $('#formError'),
  toast: $('#toast'),
  toastMessage: $('#toastMessage'),
  searchInput: $('#searchInput'),
  statusFilter: $('#statusFilter'),
  sortSelect: $('#sortSelect')
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function initials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'ST';
}

function formatMarks(value) {
  return Number(value).toFixed(2);
}

function getStatus(marks) {
  return Number(marks) >= PASS_MARK ? 'pass' : 'fail';
}

function showToast(message, kind = 'success') {
  clearTimeout(toastTimeout);
  elements.toastMessage.textContent = message;
  const check = elements.toast.querySelector('.toast-check');
  check.textContent = kind === 'error' ? '!' : '✓';
  check.style.background = kind === 'error' ? '#d96a59' : '#27b583';
  elements.toast.classList.add('show');
  toastTimeout = setTimeout(() => elements.toast.classList.remove('show'), 2700);
}

function persistRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.toArray()));
    $('#saveStatus').textContent = 'Saved on this device';
    return true;
  } catch (error) {
    $('#saveStatus').textContent = 'Unable to save locally';
    return false;
  }
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Stored data is not a list.');
    parsed.forEach((student) => {
      if (!student || !Number.isInteger(Number(student.rollNo)) || Number(student.rollNo) < 1) return;
      if (typeof student.name !== 'string' || !student.name.trim()) return;
      if (!Number.isFinite(Number(student.marks)) || Number(student.marks) < 0 || Number(student.marks) > 100) return;
      list.add(student);
    });
  } catch (error) {
    console.error('Unable to load saved student records:', error);
    showToast('Saved records could not be read. You can start a new list.', 'error');
  }
}

function getStats() {
  let total = 0;
  let pass = 0;
  let fail = 0;
  let sum = 0;
  let highest = null;
  let lowest = null;
  let current = list.head;
  while (current !== null) {
    total += 1;
    sum += current.marks;
    if (current.marks >= PASS_MARK) pass += 1;
    else fail += 1;
    if (!highest || current.marks > highest.marks) highest = current;
    if (!lowest || current.marks < lowest.marks) lowest = current;
    current = current.next;
  }
  return {
    total, pass, fail, sum,
    average: total ? sum / total : 0,
    passPercentage: total ? (pass / total) * 100 : 0,
    failPercentage: total ? (fail / total) * 100 : 0,
    highest, lowest
  };
}

function studentRow(student) {
  const status = getStatus(student.marks);
  return `<tr>
    <td><span class="roll-number">${escapeHTML(student.rollNo)}</span></td>
    <td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials(student.name))}</span><span class="student-name">${escapeHTML(student.name)}</span></div></td>
    <td><span class="marks-number">${formatMarks(student.marks)}</span></td>
    <td><span class="status-pill ${status === 'pass' ? 'status-pass' : 'status-fail'}">${status === 'pass' ? 'Passed' : 'Failed'}</span></td>
    <td><div class="row-actions"><button class="row-action" type="button" data-edit-roll="${escapeHTML(student.rollNo)}">Edit</button><button class="row-action delete" type="button" data-delete-roll="${escapeHTML(student.rollNo)}">Remove</button></div></td>
  </tr>`;
}

function tableMarkup(records, options = {}) {
  if (!records.length) return '';
  const includeActions = options.includeActions !== false;
  const actionsHeader = includeActions ? '<th scope="col">ACTIONS</th>' : '';
  const rows = records.map((student) => {
    if (includeActions) return studentRow(student);
    const status = getStatus(student.marks);
    return `<tr>
      <td><span class="roll-number">${escapeHTML(student.rollNo)}</span></td>
      <td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials(student.name))}</span><span class="student-name">${escapeHTML(student.name)}</span></div></td>
      <td><span class="marks-number">${formatMarks(student.marks)}</span></td>
      <td><span class="status-pill ${status === 'pass' ? 'status-pass' : 'status-fail'}">${status === 'pass' ? 'Passed' : 'Failed'}</span></td>
    </tr>`;
  }).join('');
  return `<table class="data-table"><thead><tr><th scope="col">ROLL NO.</th><th scope="col">STUDENT</th><th scope="col">MARKS</th><th scope="col">STATUS</th>${actionsHeader}</tr></thead><tbody>${rows}</tbody></table>`;
}

function filteredStudents() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const sort = elements.sortSelect.value;
  let records = list.toArray().filter((student) => {
    const matchesQuery = !query || String(student.rollNo).includes(query) || student.name.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || getStatus(student.marks) === status;
    return matchesQuery && matchesStatus;
  });
  records.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'roll') return a.rollNo - b.rollNo;
    if (sort === 'marks-high') return b.marks - a.marks;
    if (sort === 'marks-low') return a.marks - b.marks;
    return 0;
  });
  return records;
}

function renderOverviewTable() {
  const records = list.toArray().slice(-5).reverse();
  $('#overviewTableWrap').innerHTML = records.length ? tableMarkup(records) : '';
  $('#overviewEmpty').hidden = records.length !== 0;
  $('#overviewTableWrap').hidden = records.length === 0;
}

function renderStudentsTable() {
  const allRecordsCount = list.count();
  const records = filteredStudents();
  $('#studentsTableWrap').innerHTML = records.length ? tableMarkup(records) : '';
  $('#studentsTableWrap').hidden = records.length === 0;
  $('#studentsEmpty').hidden = records.length !== 0;
  if (allRecordsCount === 0) {
    $('#studentsEmptyTitle').textContent = 'No student records yet';
    $('#studentsEmptyText').textContent = 'Add a student to see their details here.';
  } else {
    $('#studentsEmptyTitle').textContent = 'No matching students';
    $('#studentsEmptyText').textContent = 'Try another search term or change the performance filter.';
  }
  $('#showingCount').textContent = records.length === allRecordsCount
    ? `Showing ${records.length} student${records.length === 1 ? '' : 's'}`
    : `Showing ${records.length} of ${allRecordsCount} students`;
}

function renderStats() {
  const stats = getStats();
  $('#totalStudents').textContent = stats.total;
  $('#averageMarks').textContent = formatMarks(stats.average);
  $('#passRate').textContent = stats.passPercentage.toFixed(0);
  $('#passCount').textContent = stats.pass;
  $('#failCount').textContent = stats.fail;
  $('#navStudentCount').textContent = stats.total;
  $('#directoryCount').textContent = stats.total;
  $('#donutRate').textContent = `${stats.passPercentage.toFixed(0)}%`;
  $('#passDonut').style.setProperty('--pass-angle', `${stats.total ? stats.passPercentage * 3.6 : 0}deg`);
  $('#passDonut').style.background = stats.total
    ? `conic-gradient(var(--green) 0deg ${stats.passPercentage * 3.6}deg, #f0a15c ${stats.passPercentage * 3.6}deg 360deg)`
    : 'conic-gradient(#e8ecf4 0deg 360deg)';
  $('#legendPass').textContent = stats.pass;
  $('#legendFail').textContent = stats.fail;
  $('#legendTotal').textContent = stats.total;

  $('#reportTotal').textContent = stats.total;
  $('#reportAverage').textContent = formatMarks(stats.average);
  $('#reportPass').textContent = stats.pass;
  $('#reportFail').textContent = stats.fail;
  $('#reportPassPercentage').textContent = `${stats.passPercentage.toFixed(2)}% of students`;
  $('#reportFailPercentage').textContent = `${stats.failPercentage.toFixed(2)}% of students`;
  $('#breakdownPassText').textContent = `${stats.pass} · ${stats.passPercentage.toFixed(2)}%`;
  $('#breakdownFailText').textContent = `${stats.fail} · ${stats.failPercentage.toFixed(2)}%`;
  $('#passProgress').style.width = `${stats.passPercentage}%`;
  $('#failProgress').style.width = `${stats.failPercentage}%`;

  $('#highestMarks').textContent = stats.highest ? formatMarks(stats.highest.marks) : '—';
  $('#highestStudent').textContent = stats.highest ? `${stats.highest.name} · Roll ${stats.highest.rollNo}` : 'No records available';
  $('#lowestMarks').textContent = stats.lowest ? formatMarks(stats.lowest.marks) : '—';
  $('#lowestStudent').textContent = stats.lowest ? `${stats.lowest.name} · Roll ${stats.lowest.rollNo}` : 'No records available';
}

function renderAll() {
  renderStats();
  renderOverviewTable();
  renderStudentsTable();
}

function persistAndNotify(successMessage) {
  const saved = persistRecords();
  renderAll();
  if (saved) showToast(successMessage);
  else showToast('Changes were made but could not be saved in browser storage. Export a CSV backup.', 'error');
}

function switchView(viewName) {
  if (!['overview', 'students', 'performance'].includes(viewName)) return;
  currentView = viewName;
  $$('[data-view-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.viewPanel === viewName));
  $$('.nav-item[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  const titles = {
    overview: ['Overview', 'Student records, ', 'made simple.', 'A clear view of student information and class performance.'],
    students: ['Student directory', 'Every student, ', 'in one place.', 'Search, update, and manage your linked-list records.'],
    performance: ['Performance', 'Progress at ', 'a glance.', 'Understand class results with live pass, fail, and average calculations.']
  };
  const config = titles[viewName];
  $('#breadcrumbCurrent').textContent = config[0];
  $('#pageTitle').innerHTML = `${escapeHTML(config[1])}<span>${escapeHTML(config[2])}</span>`;
  $('#pageSubtitle').textContent = config[3];
  if (viewName === 'students') elements.searchInput.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openStudentModal(mode = 'add', rollNo = null) {
  modalMode = mode;
  editingRollNo = rollNo === null ? null : Number(rollNo);
  elements.studentForm.reset();
  elements.formError.hidden = true;
  elements.formError.textContent = '';
  if (mode === 'edit') {
    const student = list.findByRoll(editingRollNo);
    if (!student) {
      showToast('That student record could not be found.', 'error');
      return;
    }
    elements.modalTitle.textContent = 'Edit student data';
    elements.modalDescription.textContent = 'Update the name or marks for this existing student.';
    elements.rollNo.value = student.rollNo;
    elements.rollNo.readOnly = true;
    elements.studentName.value = student.name;
    elements.studentMarks.value = student.marks;
    $('#saveStudentButton').innerHTML = 'Save changes <span aria-hidden="true">→</span>';
  } else {
    elements.modalTitle.textContent = 'Add a student';
    elements.modalDescription.textContent = 'Enter the details below to create a new record.';
    elements.rollNo.readOnly = false;
    $('#saveStudentButton').innerHTML = 'Save student <span aria-hidden="true">→</span>';
  }
  elements.studentModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => (mode === 'edit' ? elements.studentName : elements.rollNo).focus(), 30);
}

function closeStudentModal() {
  elements.studentModal.hidden = true;
  document.body.style.overflow = '';
  editingRollNo = null;
}

function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = false;
}

function saveStudent(event) {
  event.preventDefault();
  const name = elements.studentName.value.trim();
  const marks = Number(elements.studentMarks.value);
  const rollNo = Number(elements.rollNo.value);
  if (!name) return showFormError('Please enter the student name.');
  if (name.length > 49) return showFormError('Name must be 49 characters or fewer.');
  if (!Number.isInteger(rollNo) || rollNo < 1) return showFormError('Roll number must be a positive whole number.');
  if (elements.studentMarks.value.trim() === '' || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    return showFormError('Marks must be a number between 0 and 100.');
  }

  if (modalMode === 'edit') {
    const updated = list.update(editingRollNo, { name, marks });
    if (!updated) return showFormError('This student record no longer exists. Refresh the page and try again.');
    closeStudentModal();
    persistAndNotify('Student data updated successfully.');
  } else {
    const result = list.add({ rollNo, name, marks });
    if (!result.ok) return showFormError(result.message);
    closeStudentModal();
    persistAndNotify('Student added successfully.');
  }
}

function removeStudent(rollNo) {
  const student = list.findByRoll(rollNo);
  if (!student) return showToast('That student record could not be found.', 'error');
  const confirmed = window.confirm(`Remove ${student.name} (roll number ${student.rollNo})? This action cannot be undone.`);
  if (!confirmed) return;
  list.remove(rollNo);
  persistAndNotify('Student removed successfully.');
}

function exportCSV() {
  const records = list.toArray();
  if (records.length === 0) {
    showToast('There are no records to export yet.', 'error');
    return;
  }
  const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [['Roll Number', 'Student Name', 'Marks', 'Status']];
  records.forEach((student) => rows.push([
    student.rollNo, student.name, formatMarks(student.marks), getStatus(student.marks) === 'pass' ? 'PASS' : 'FAIL'
  ]));
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-records-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('CSV file exported successfully.');
}

function loadDemoRecords() {
  if (list.count() > 0) return;
  const demo = [
    { rollNo: 101, name: 'Amulya Ratna', marks: 87 },
    { rollNo: 102, name: 'Rahul Kumar', marks: 74 },
    { rollNo: 103, name: 'Priya Sharma', marks: 93 },
    { rollNo: 104, name: 'Arjun Patel', marks: 36 },
    { rollNo: 105, name: 'Kiran Das', marks: 58 }
  ];
  demo.forEach((student) => list.add(student));
  persistAndNotify('Sample records loaded. You can edit or remove them.');
}

function openExitModal() {
  elements.exitModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeExitModal() {
  elements.exitModal.hidden = true;
  document.body.style.overflow = '';
}

// Navigation and delegated row actions.
$('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  switchView('overview');
});
$$('.nav-item[data-view]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
$$('[data-open-view]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.openView)));
$$('[data-open-add]').forEach((button) => button.addEventListener('click', () => openStudentModal('add')));
$('#addStudentButton').addEventListener('click', () => openStudentModal('add'));
$('#closeModalButton').addEventListener('click', closeStudentModal);
$('#cancelModalButton').addEventListener('click', closeStudentModal);
elements.studentModal.addEventListener('click', (event) => { if (event.target === elements.studentModal) closeStudentModal(); });
elements.studentForm.addEventListener('submit', saveStudent);

function handleTableAction(event) {
  const editButton = event.target.closest('[data-edit-roll]');
  const deleteButton = event.target.closest('[data-delete-roll]');
  if (editButton) openStudentModal('edit', Number(editButton.dataset.editRoll));
  if (deleteButton) removeStudent(Number(deleteButton.dataset.deleteRoll));
}
$('#overviewTableWrap').addEventListener('click', handleTableAction);
$('#studentsTableWrap').addEventListener('click', handleTableAction);
[elements.searchInput, elements.statusFilter, elements.sortSelect].forEach((control) => control.addEventListener('input', renderStudentsTable));
$('#exportButton').addEventListener('click', exportCSV);
$('#exportFromOverview').addEventListener('click', exportCSV);
$('#loadDemoButton').addEventListener('click', loadDemoRecords);
$('#exitButton').addEventListener('click', openExitModal);
$('#closeExitButton').addEventListener('click', closeExitModal);
$('#backToAppButton').addEventListener('click', closeExitModal);
elements.exitModal.addEventListener('click', (event) => { if (event.target === elements.exitModal) closeExitModal(); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!elements.studentModal.hidden) closeStudentModal();
    if (!elements.exitModal.hidden) closeExitModal();
  }
  if (event.key === 'Enter' && document.activeElement === elements.searchInput) {
    event.preventDefault();
    renderStudentsTable();
  }
});

loadRecords();
renderAll();
