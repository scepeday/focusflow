const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const pageRoutes = require('./routes/pageRoutes');
const helperRoutes = require('./routes/helperRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Tell Express where the Pug files live and which template engine to use.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRoutes);
app.use('/tools', helperRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    currentPage: ''
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).render('error', {
    pageTitle: 'Something Went Wrong',
    currentPage: '',
    errorMessage: 'The app had trouble loading this page. Please try again.'
  });
});

app.listen(PORT, () => {
  console.log(`FocusFlow is running at http://localhost:${PORT}`);
});
