document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.querySelector('#task-form');
  const taskList = document.querySelector('#task-list');
  const taskSummary = document.querySelector('#task-summary');
  const taskFormMessage = document.querySelector('#task-form-message');
  const saveTaskButton = document.querySelector('#save-task');
  const cancelEditButton = document.querySelector('#cancel-edit');
  const filterButtons = document.querySelectorAll('.filter-button');

  if (!taskForm) {
    return;
  }

  const state = {
    currentFilter: 'all',
    editingTaskId: ''
  };

  // One form handles both adding and editing to keep the page simple.
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveTask(state, taskForm, taskFormMessage, saveTaskButton);
    renderTasks(state, taskList, taskSummary);
  });

  cancelEditButton.addEventListener('click', () => {
    resetForm(state, taskForm, taskFormMessage, saveTaskButton);
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.currentFilter = button.dataset.filter;
      updateFilterButtons(filterButtons, state.currentFilter);
      renderTasks(state, taskList, taskSummary);
    });
  });

  taskList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');

    if (!actionButton) {
      return;
    }

    const taskId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    handleTaskAction(action, taskId, state, taskForm, taskFormMessage, saveTaskButton);
    renderTasks(state, taskList, taskSummary);
  });

  renderTasks(state, taskList, taskSummary);
});

function saveTask(state, taskForm, messageElement, saveButton) {
  const formData = new FormData(taskForm);
  const tasks = FocusFlowStorage.getTasks();
  const taskData = {
    title: formData.get('title').trim(),
    category: formData.get('category').trim(),
    dueDate: formData.get('dueDate'),
    estimatedMinutes: Number(formData.get('estimatedMinutes')),
    difficulty: Number(formData.get('difficulty'))
  };

  if (state.editingTaskId) {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== state.editingTaskId) {
        return task;
      }

      return {
        ...task,
        ...taskData
      };
    });

    FocusFlowStorage.saveTasks(updatedTasks);
    messageElement.textContent = 'Task updated successfully.';
  } else {
    const newTask = {
      id: String(Date.now()),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    FocusFlowStorage.saveTasks(tasks);
    messageElement.textContent = 'Task added successfully.';
  }

  resetForm(state, taskForm, messageElement, saveButton, true);
}

function handleTaskAction(action, taskId, state, taskForm, messageElement, saveButton) {
  const tasks = FocusFlowStorage.getTasks();

  if (action === 'edit') {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    state.editingTaskId = task.id;
    taskForm.querySelector('#task-id').value = task.id;
    taskForm.querySelector('#title').value = task.title;
    taskForm.querySelector('#category').value = task.category;
    taskForm.querySelector('#dueDate').value = task.dueDate || '';
    taskForm.querySelector('#estimatedMinutes').value = task.estimatedMinutes;
    taskForm.querySelector('#difficulty').value = task.difficulty;
    saveButton.textContent = 'Update Task';
    messageElement.textContent = 'Editing task. Change the fields and save again.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (action === 'delete') {
    const shouldDelete = window.confirm('Delete this task?');

    if (!shouldDelete) {
      return;
    }

    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    FocusFlowStorage.saveTasks(updatedTasks);
    messageElement.textContent = 'Task deleted.';

    if (state.editingTaskId === taskId) {
      resetForm(state, taskForm, messageElement, saveButton, true);
    }

    return;
  }

  if (action === 'toggle-complete') {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        completed: !task.completed
      };
    });

    FocusFlowStorage.saveTasks(updatedTasks);
    messageElement.textContent = 'Task status updated.';
    return;
  }

  if (action === 'focus') {
    FocusFlowStorage.setSelectedTaskId(taskId);
    window.location.href = `/focus?taskId=${encodeURIComponent(taskId)}`;
  }
}

function renderTasks(state, taskList, taskSummary) {
  const tasks = FocusFlowStorage.sortTasksForList(FocusFlowStorage.getTasks());
  const visibleTasks = tasks.filter((task) => {
    if (state.currentFilter === 'active') {
      return !task.completed;
    }

    if (state.currentFilter === 'completed') {
      return task.completed;
    }

    return true;
  });

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  taskSummary.textContent = `${activeCount} active task(s) and ${completedCount} completed task(s).`;

  if (visibleTasks.length === 0) {
    taskList.innerHTML = '<li class="task-item empty-state">No tasks match this filter yet.</li>';
    return;
  }

  // Active tasks are shown first because they matter most for the dashboard.
  const taskItems = visibleTasks.map((task) => {
    const safeTitle = FocusFlowStorage.escapeHtml(task.title);
    const safeCategory = FocusFlowStorage.escapeHtml(task.category);
    const scoreText = task.completed ? 'Completed' : `Score ${task.score}`;
    const completeButtonText = task.completed ? 'Mark Active' : 'Complete';

    return `
      <li class="task-item ${task.completed ? 'completed-task' : ''}">
        <div class="task-main">
          <div>
            <h3>${safeTitle}</h3>
            <p>${safeCategory}</p>
          </div>
          <p class="task-score">${scoreText}</p>
        </div>
        <div class="task-meta">
          <span>Due: ${FocusFlowStorage.formatDate(task.dueDate)}</span>
          <span>Minutes: ${task.estimatedMinutes}</span>
          <span>Difficulty: ${task.difficulty}/5</span>
        </div>
        <div class="button-row">
          <button class="button button-secondary small-button" type="button" data-action="edit" data-id="${task.id}">Edit</button>
          <button class="button button-secondary small-button" type="button" data-action="toggle-complete" data-id="${task.id}">${completeButtonText}</button>
          <button class="button button-secondary small-button" type="button" data-action="focus" data-id="${task.id}">Focus</button>
          <button class="button danger-button small-button" type="button" data-action="delete" data-id="${task.id}">Delete</button>
        </div>
      </li>
    `;
  }).join('');

  taskList.innerHTML = taskItems;
}

function resetForm(state, taskForm, messageElement, saveButton, keepMessage) {
  state.editingTaskId = '';
  taskForm.reset();
  taskForm.querySelector('#task-id').value = '';
  taskForm.querySelector('#estimatedMinutes').value = 25;
  taskForm.querySelector('#difficulty').value = 3;
  saveButton.textContent = 'Save Task';

  if (!keepMessage) {
    messageElement.textContent = 'Fill in the form and click save.';
  }
}

function updateFilterButtons(buttons, selectedFilter) {
  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === selectedFilter);
  });
}
