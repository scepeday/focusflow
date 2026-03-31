(function () {
  const TASKS_KEY = 'focusflowTasks';
  const SELECTED_TASK_KEY = 'focusflowSelectedTaskId';
  const CITY_KEY = 'focusflowCity';

  function getTasks() {
    const savedTasks = localStorage.getItem(TASKS_KEY);

    if (!savedTasks) {
      return [];
    }

    try {
      return JSON.parse(savedTasks);
    } catch (error) {
      console.error('Tasks could not be read from localStorage.', error);
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  function formatDate(dateString) {
    if (!dateString) {
      return 'No due date';
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function calculateTaskScore(task) {
    if (task.completed) {
      return -1;
    }

    // This scoring is intentionally simple so it is easy to explain:
    // overdue and urgent tasks go up, difficult tasks go up,
    // and short tasks get a small bonus.
    let score = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.dueDate) {
      const dueDate = new Date(`${task.dueDate}T00:00:00`);
      const differenceInDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (differenceInDays < 0) {
        score += 50;
      } else if (differenceInDays === 0) {
        score += 35;
      } else if (differenceInDays <= 2) {
        score += 20;
      } else if (differenceInDays <= 7) {
        score += 10;
      }
    }

    score += Number(task.difficulty || 1) * 5;

    if (Number(task.estimatedMinutes) <= 30) {
      score += 8;
    } else if (Number(task.estimatedMinutes) <= 60) {
      score += 4;
    }

    return score;
  }

  function sortRankedTasks(firstTask, secondTask) {
    if (secondTask.score !== firstTask.score) {
      return secondTask.score - firstTask.score;
    }

    if (firstTask.dueDate && secondTask.dueDate) {
      return new Date(firstTask.dueDate) - new Date(secondTask.dueDate);
    }

    if (firstTask.dueDate) {
      return -1;
    }

    if (secondTask.dueDate) {
      return 1;
    }

    return new Date(firstTask.createdAt) - new Date(secondTask.createdAt);
  }

  function rankTasks(tasks) {
    return tasks
      .filter((task) => !task.completed)
      .map((task) => {
        return {
          ...task,
          score: calculateTaskScore(task)
        };
      })
      .sort(sortRankedTasks);
  }

  function sortTasksForList(tasks) {
    const rankedTasks = rankTasks(tasks);
    const completedTasks = tasks
      .filter((task) => task.completed)
      .map((task) => {
        return {
          ...task,
          score: 0
        };
      })
      .sort((firstTask, secondTask) => {
        return new Date(secondTask.createdAt) - new Date(firstTask.createdAt);
      });

    return rankedTasks.concat(completedTasks);
  }

  function getTaskById(taskId) {
    return getTasks().find((task) => task.id === taskId) || null;
  }

  function getSuggestedFocusMinutes(task) {
    const minutes = Number(task && task.estimatedMinutes);

    if (!minutes) {
      return 25;
    }

    if (minutes <= 30) {
      return 25;
    }

    if (minutes <= 60) {
      return 35;
    }

    return 45;
  }

  function setSelectedTaskId(taskId) {
    localStorage.setItem(SELECTED_TASK_KEY, taskId);
  }

  function getSelectedTaskId() {
    return localStorage.getItem(SELECTED_TASK_KEY) || '';
  }

  function setSavedCity(city) {
    localStorage.setItem(CITY_KEY, city);
  }

  function getSavedCity() {
    return localStorage.getItem(CITY_KEY) || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  window.FocusFlowStorage = {
    getTasks,
    saveTasks,
    formatDate,
    calculateTaskScore,
    rankTasks,
    sortTasksForList,
    getTaskById,
    getSuggestedFocusMinutes,
    setSelectedTaskId,
    getSelectedTaskId,
    setSavedCity,
    getSavedCity,
    escapeHtml
  };
})();
