# FocusFlow

FocusFlow is a simple productivity dashboard for students and busy users. It uses Node.js, Express, Pug, CSS, and vanilla JavaScript to help users organize tasks, check the weather, discover learning resources, and run a focus timer.

## Project Description

This project is designed to feel smart without using real AI. It ranks unfinished tasks with a simple scoring system, shows current weather for a chosen city, recommends books based on the top task category, and suggests a focus session length.

## Features

- Add, edit, delete, and complete tasks
- Save tasks in `localStorage`
- Rank tasks with a clear scoring system
- Show the top priority task and top 3 ranked tasks
- Get weather by city using Geoapify and Open-Meteo
- Recommend books using Open Library
- Run a simple Pomodoro-style focus timer
- Responsive layout for desktop and mobile

## APIs Used

- Geoapify Geocoding API
- Open-Meteo Weather API
- Open Library API

## How to Run the Project

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and copy the values from `.env.example`.

3. Add your Geoapify API key to `.env`:

```env
PORT=3000
GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

4. Start the server:

```bash
npm start
```

5. Open the app in your browser:

```text
http://localhost:3000
```

## Setup Notes

- Use Node.js version 18 or newer because this project uses the built-in `fetch` function.
- Weather will only work after the Geoapify API key is added.
- Tasks are saved in the browser, so they will not be shared between different browsers or devices.

## Folder Structure

- `app.js` - main server file
- `routes/` - Express routes for pages and helper endpoints
- `services/` - API helper functions
- `views/` - Pug templates
- `public/css/` - stylesheet
- `public/js/` - frontend JavaScript

## Future Improvements

- Add drag-and-drop task ordering
- Add a break timer after the focus session
- Add charts for completed tasks
- Save task data in a database
- Add more filters and sorting options
