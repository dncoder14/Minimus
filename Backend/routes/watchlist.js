const { createListRouter } = require('./lists');

module.exports = createListRouter({
  model: 'watchlist',
  label: 'watchlist',
  listKey: 'watchlist',
  checkKey: 'inWatchlist',
  dateField: 'addedAt'
});
