const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'FocusFlow | Dashboard',
    currentPage: 'home'
  });
});

router.get('/tasks', (req, res) => {
  res.render('tasks', {
    pageTitle: 'FocusFlow | Tasks',
    currentPage: 'tasks'
  });
});

router.get('/focus', (req, res) => {
  res.render('focus', {
    pageTitle: 'FocusFlow | Focus Timer',
    currentPage: 'focus'
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'FocusFlow | About',
    currentPage: 'about'
  });
});

module.exports = router;
