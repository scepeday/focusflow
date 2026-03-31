document.addEventListener('DOMContentLoaded', () => {
  const weatherForm = document.querySelector('#weather-form');
  const cityInput = document.querySelector('#city');
  const weatherResult = document.querySelector('#weather-result');
  const topPriorityContent = document.querySelector('#top-priority-content');
  const topThreeList = document.querySelector('#top-three-list');
  const focusSuggestion = document.querySelector('#focus-suggestion');
  const resourceList = document.querySelector('#resource-list');

  if (!weatherForm) {
    return;
  }

  const tasks = FocusFlowStorage.getTasks();
  const rankedTasks = FocusFlowStorage.rankTasks(tasks);
  const topTask = rankedTasks[0] || null;
  const savedCity = FocusFlowStorage.getSavedCity();

  // The dashboard is built from local task data first, then API data.
  renderTopPriority(topTask, topPriorityContent);
  renderTopThree(rankedTasks, topThreeList);
  renderFocusSuggestion(topTask, focusSuggestion);
  loadResources(topTask, resourceList);

  if (savedCity) {
    cityInput.value = savedCity;
    loadWeather(savedCity, weatherResult);
  }

  weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
      weatherResult.innerHTML = '<p class="empty-state">Please enter a city name.</p>';
      return;
    }

    FocusFlowStorage.setSavedCity(city);
    loadWeather(city, weatherResult);
  });
});

function renderTopPriority(task, container) {
  if (!task) {
    container.innerHTML = `
      <p class="empty-state">No active tasks yet. Add one on the <a href="/tasks">Tasks page</a>.</p>
    `;
    return;
  }

  const safeTitle = FocusFlowStorage.escapeHtml(task.title);
  const safeCategory = FocusFlowStorage.escapeHtml(task.category);

  container.innerHTML = `
    <div class="priority-card">
      <p class="badge">Top priority</p>
      <h3>${safeTitle}</h3>
      <p><strong>Category:</strong> ${safeCategory}</p>
      <p><strong>Due:</strong> ${FocusFlowStorage.formatDate(task.dueDate)}</p>
      <p><strong>Score:</strong> ${task.score}</p>
      <a class="button button-secondary" href="/focus?taskId=${encodeURIComponent(task.id)}">Focus on This Task</a>
    </div>
  `;
}

function renderTopThree(tasks, container) {
  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">Add tasks to see the ranked list.</p>';
    return;
  }

  const items = tasks.slice(0, 3).map((task, index) => {
    const safeTitle = FocusFlowStorage.escapeHtml(task.title);
    const safeCategory = FocusFlowStorage.escapeHtml(task.category);

    return `
      <li>
        <span class="rank-number">${index + 1}</span>
        <div>
          <strong>${safeTitle}</strong>
          <p>${safeCategory} | Score ${task.score}</p>
        </div>
      </li>
    `;
  }).join('');

  container.innerHTML = `<ol class="rank-list">${items}</ol>`;
}

function renderFocusSuggestion(task, container) {
  if (!task) {
    container.innerHTML = '<p class="empty-state">Your next focus suggestion will appear here.</p>';
    return;
  }

  const suggestedMinutes = FocusFlowStorage.getSuggestedFocusMinutes(task);
  const safeTitle = FocusFlowStorage.escapeHtml(task.title);

  container.innerHTML = `
    <div class="focus-box">
      <h3>${suggestedMinutes}-minute session</h3>
      <p>Start with <strong>${safeTitle}</strong> and work for one clear block.</p>
      <a class="button" href="/focus?taskId=${encodeURIComponent(task.id)}">Start Focus Session</a>
    </div>
  `;
}

async function loadWeather(city, container) {
  container.innerHTML = '<p class="empty-state">Loading weather...</p>';

  try {
    const response = await fetch(`/tools/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Weather data could not be loaded.');
    }

    const locationName = data.country
      ? `${FocusFlowStorage.escapeHtml(data.city)}, ${FocusFlowStorage.escapeHtml(data.country)}`
      : FocusFlowStorage.escapeHtml(data.city);

    container.innerHTML = `
      <div class="weather-card">
        <h3>${locationName}</h3>
        <p><strong>${data.description}</strong></p>
        <p>Temperature: ${data.temperature}&deg;C</p>
        <p>Feels like: ${data.apparentTemperature}&deg;C</p>
        <p>Wind speed: ${data.windSpeed} km/h</p>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<p class="empty-state">${FocusFlowStorage.escapeHtml(error.message)}</p>`;
  }
}

async function loadResources(task, container) {
  if (!task) {
    container.innerHTML = '<p class="empty-state">Resource suggestions will appear after you add tasks.</p>';
    return;
  }

  container.innerHTML = '<p class="empty-state">Loading book suggestions...</p>';

  try {
    const response = await fetch(`/tools/resources?category=${encodeURIComponent(task.category)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Book suggestions could not be loaded.');
    }

    if (!data.books || data.books.length === 0) {
      container.innerHTML = `<p class="empty-state">No books were found for ${FocusFlowStorage.escapeHtml(task.category)}.</p>`;
      return;
    }

    const cards = data.books.map((book) => {
      return `
        <article class="resource-card">
          <p class="badge">${FocusFlowStorage.escapeHtml(task.category)}</p>
          <h3>${FocusFlowStorage.escapeHtml(book.title)}</h3>
          <p>${FocusFlowStorage.escapeHtml(book.author)}</p>
          <p>First published: ${FocusFlowStorage.escapeHtml(book.year)}</p>
          <a href="${book.link}" target="_blank" rel="noopener noreferrer">View on Open Library</a>
        </article>
      `;
    }).join('');

    container.innerHTML = `<div class="resource-grid">${cards}</div>`;
  } catch (error) {
    container.innerHTML = `<p class="empty-state">${FocusFlowStorage.escapeHtml(error.message)}</p>`;
  }
}
