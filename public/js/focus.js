document.addEventListener('DOMContentLoaded', () => {
  const focusTaskSelect = document.querySelector('#focus-task-select');
  const focusTaskCard = document.querySelector('#focus-task-card');
  const timerDisplay = document.querySelector('#timer-display');
  const timerMessage = document.querySelector('#timer-message');
  const startTimerButton = document.querySelector('#start-timer');
  const pauseTimerButton = document.querySelector('#pause-timer');
  const resetTimerButton = document.querySelector('#reset-timer');

  if (!focusTaskSelect) {
    return;
  }

  const state = {
    timerId: null,
    currentTask: null,
    remainingSeconds: 25 * 60
  };

  const rankedTasks = FocusFlowStorage.rankTasks(FocusFlowStorage.getTasks());
  const urlTaskId = new URLSearchParams(window.location.search).get('taskId');
  const savedTaskId = FocusFlowStorage.getSelectedTaskId();
  const firstTask = rankedTasks[0] || null;
  const startingTaskId = urlTaskId || savedTaskId || (firstTask ? firstTask.id : '');

  renderTaskOptions(rankedTasks, focusTaskSelect);

  if (startingTaskId) {
    focusTaskSelect.value = startingTaskId;
    updateCurrentTask(startingTaskId, rankedTasks, state, focusTaskCard, timerDisplay, timerMessage);
  } else {
    focusTaskCard.innerHTML = '<p class="empty-state">No active tasks yet. Add one on the Tasks page.</p>';
    timerMessage.textContent = 'Add a task first, then come back to start a focus session.';
  }

  focusTaskSelect.addEventListener('change', () => {
    updateCurrentTask(focusTaskSelect.value, rankedTasks, state, focusTaskCard, timerDisplay, timerMessage);
  });

  startTimerButton.addEventListener('click', () => {
    startTimer(state, timerDisplay, timerMessage);
  });

  pauseTimerButton.addEventListener('click', () => {
    pauseTimer(state, timerMessage);
  });

  resetTimerButton.addEventListener('click', () => {
    resetTimer(state, timerDisplay, timerMessage);
  });
});

function renderTaskOptions(tasks, selectElement) {
  if (tasks.length === 0) {
    selectElement.innerHTML = '<option value="">No active tasks available</option>';
    selectElement.disabled = true;
    return;
  }

  const options = tasks.map((task) => {
    return `<option value="${task.id}">${FocusFlowStorage.escapeHtml(task.title)}</option>`;
  }).join('');

  selectElement.innerHTML = `<option value="">Select a task</option>${options}`;
}

function updateCurrentTask(taskId, tasks, state, focusTaskCard, timerDisplay, timerMessage) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }

    state.currentTask = null;
    state.remainingSeconds = 25 * 60;
    updateTimerDisplay(timerDisplay, state.remainingSeconds);
    focusTaskCard.innerHTML = '<p class="empty-state">Select a task to start focusing.</p>';
    timerMessage.textContent = 'Choose a task before starting the timer.';
    return;
  }

  state.currentTask = task;
  FocusFlowStorage.setSelectedTaskId(task.id);

  // The timer length is based on task size so the session feels personalized.
  const suggestedMinutes = FocusFlowStorage.getSuggestedFocusMinutes(task);

  focusTaskCard.innerHTML = `
    <div class="focus-task-details">
      <p class="badge">Ready to focus</p>
      <h3>${FocusFlowStorage.escapeHtml(task.title)}</h3>
      <p><strong>Category:</strong> ${FocusFlowStorage.escapeHtml(task.category)}</p>
      <p><strong>Due:</strong> ${FocusFlowStorage.formatDate(task.dueDate)}</p>
      <p><strong>Estimated time:</strong> ${task.estimatedMinutes} minutes</p>
      <p><strong>Suggested session:</strong> ${suggestedMinutes} minutes</p>
    </div>
  `;

  resetTimer(state, timerDisplay, timerMessage);
}

function startTimer(state, timerDisplay, timerMessage) {
  if (!state.currentTask) {
    timerMessage.textContent = 'Choose a task before starting the timer.';
    return;
  }

  if (state.timerId) {
    return;
  }

  timerMessage.textContent = `Working on ${state.currentTask.title}. Stay with this task until the timer ends.`;

  state.timerId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    updateTimerDisplay(timerDisplay, state.remainingSeconds);

    if (state.remainingSeconds <= 0) {
      pauseTimer(state, timerMessage);
      timerMessage.textContent = 'Session complete. Take a short break.';
      window.alert('Focus session complete. Take a short break.');
    }
  }, 1000);
}

function pauseTimer(state, timerMessage) {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }

  if (state.remainingSeconds > 0) {
    timerMessage.textContent = 'Timer paused.';
  }
}

function resetTimer(state, timerDisplay, timerMessage) {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }

  const minutes = FocusFlowStorage.getSuggestedFocusMinutes(state.currentTask);
  state.remainingSeconds = minutes * 60;
  updateTimerDisplay(timerDisplay, state.remainingSeconds);
  timerMessage.textContent = `Ready for a ${minutes}-minute session.`;
}

function updateTimerDisplay(displayElement, totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  displayElement.textContent = `${paddedMinutes}:${paddedSeconds}`;
}
