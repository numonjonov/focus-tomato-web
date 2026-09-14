(function exportTasksPanel(root) {
  const {
    parseTaskInput,
    createTask,
    toggleTask,
    reorderTasks,
    getOpenTodayTasks,
    getDoneTodayTasks
  } = root.FocusForgeTasks;

  const { applyTaskToggleXP, formatDateKey } = root.FocusForgeCore;

  let data = null;
  let elements = {};
  let activeTab = 'open';
  let draggedTaskId = null;
  let todayDate = '';

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    data = root.FocusForgeStorage.loadData();
    todayDate = formatDateKey(new Date());
    bindElements();

    elements.tabOpen.addEventListener('click', () => { activeTab = 'open'; render(); });
    elements.tabDone.addEventListener('click', () => { activeTab = 'done'; render(); });
    elements.tasksBulkSubmit.addEventListener('click', onBulkSubmit);
    elements.tasksInlineInput.addEventListener('keydown', onInlineKeydown);

    render();
  }

  function refreshData() {
    data = root.FocusForgeStorage.loadData();
    return data;
  }

  function persist() {
    data = root.FocusForgeStorage.saveData(data);
    root.FocusForgeGamification.refresh();
  }

  function render() {
    const open = getOpenTodayTasks(data.tasks, todayDate);
    const done = getDoneTodayTasks(data.tasks, todayDate);

    elements.tabOpenCount.textContent = `${done.length}/${open.length + done.length}`;
    elements.tabDoneCount.textContent = String(done.length);

    elements.tabOpen.classList.toggle('is-active', activeTab === 'open');
    elements.tabDone.classList.toggle('is-active', activeTab === 'done');
    elements.tasksOpenView.classList.toggle('hidden', activeTab !== 'open');
    elements.tasksDoneView.classList.toggle('hidden', activeTab !== 'done');

    if (activeTab === 'open') {
      renderOpenList(open);
    } else {
      renderDoneList(done);
    }
  }

  function renderOpenList(open) {
    const hasAny = open.length > 0;
    elements.tasksEmpty.classList.toggle('hidden', hasAny);
    elements.tasksList.classList.toggle('hidden', !hasAny);
    elements.tasksInlineRow.classList.toggle('hidden', !hasAny);
    elements.tasksList.innerHTML = '';
    for (const task of open) {
      elements.tasksList.appendChild(buildTaskRow(task, true));
    }
  }

  function renderDoneList(done) {
    elements.tasksDoneList.innerHTML = '';
    if (!done.length) {
      const empty = document.createElement('div');
      empty.className = 'tasks-empty-inline';
      empty.textContent = 'Пока ничего не закрыто';
      elements.tasksDoneList.appendChild(empty);
      return;
    }
    for (const task of done) {
      elements.tasksDoneList.appendChild(buildTaskRow(task, false));
    }
  }

  function buildTaskRow(task, draggable) {
    const row = document.createElement('div');
    row.className = `task-row ${task.done ? 'is-done' : ''}`;
    row.dataset.taskId = task.id;
    if (draggable) {
      row.draggable = true;
    }
    row.innerHTML = `
      <div class="checkbox">${task.done ? '✓' : ''}</div>
      <div class="title">${escapeHTML(task.title)}</div>
      ${draggable ? '<span class="grip">⋮⋮</span>' : ''}
    `;
    row.querySelector('.checkbox').addEventListener('click', () => onTaskCheckboxClick(task.id));
    if (draggable) {
      row.addEventListener('dragstart', (event) => onTaskDragStart(event, task.id, row));
      row.addEventListener('dragover', (event) => onTaskDragOver(event, row));
      row.addEventListener('dragleave', () => row.classList.remove('is-drop-target'));
      row.addEventListener('drop', (event) => onTaskDrop(event, task.id, row));
      row.addEventListener('dragend', () => onTaskDragEnd(row));
    }
    return row;
  }

  function onBulkSubmit() {
    const raw = elements.tasksBulkInput.value;
    const parsed = parseTaskInput(raw);
    if (!parsed.length) {
      return;
    }
    refreshData();
    let order = 0;
    for (const row of parsed) {
      const task = createTask(row.title, todayDate, order, row.done);
      data.tasks.push(task);
      if (row.done) {
        data.stats.totalXP = applyTaskToggleXP(data.stats.totalXP, true);
      }
      order += 1;
    }
    elements.tasksBulkInput.value = '';
    persist();
    render();
  }

  function onInlineKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const raw = elements.tasksInlineInput.value;
    const parsed = parseTaskInput(raw);
    if (!parsed.length) {
      return;
    }
    refreshData();
    const existing = getOpenTodayTasks(data.tasks, todayDate);
    let order = existing.length;
    for (const row of parsed) {
      const task = createTask(row.title, todayDate, order, row.done);
      data.tasks.push(task);
      if (row.done) {
        data.stats.totalXP = applyTaskToggleXP(data.stats.totalXP, true);
      }
      order += 1;
    }
    elements.tasksInlineInput.value = '';
    persist();
    render();
  }

  function onTaskCheckboxClick(taskId) {
    refreshData();
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }
    const nextDone = !task.done;
    data.stats.totalXP = applyTaskToggleXP(data.stats.totalXP, nextDone);
    data.tasks = toggleTask(data.tasks, taskId);
    persist();
    render();
  }

  function onTaskDragStart(event, taskId, row) {
    draggedTaskId = taskId;
    row.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
  }

  function onTaskDragOver(event, row) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (row.dataset.taskId !== draggedTaskId) {
      row.classList.add('is-drop-target');
    }
  }

  function onTaskDrop(event, targetId, row) {
    event.preventDefault();
    row.classList.remove('is-drop-target');
    if (!draggedTaskId || draggedTaskId === targetId) {
      return;
    }
    refreshData();
    data.tasks = reorderTasks(data.tasks, draggedTaskId, targetId);
    persist();
    render();
  }

  function onTaskDragEnd(row) {
    row.classList.remove('is-dragging');
    row.classList.remove('is-drop-target');
    draggedTaskId = null;
    document.querySelectorAll('.task-row.is-drop-target').forEach((el) => el.classList.remove('is-drop-target'));
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  root.FocusForgeTasksPanel = { init };
})(window);
