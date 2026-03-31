function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanBookData(book) {
  return {
    title: book.title || 'Untitled book',
    author: book.author_name ? book.author_name[0] : 'Unknown author',
    year: book.first_publish_year || 'N/A',
    link: book.key ? `https://openlibrary.org${book.key}` : 'https://openlibrary.org'
  };
}

async function getBooksByCategory(category) {
  // A simple text search keeps the project beginner-friendly.
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(category)}&limit=6`;
  const response = await fetch(url);

  if (!response.ok) {
    throw createError('Open Library is not responding right now.', 502);
  }

  const data = await response.json();
  const books = Array.isArray(data.docs) ? data.docs.slice(0, 6) : [];

  return books.map(cleanBookData);
}

module.exports = {
  getBooksByCategory
};
