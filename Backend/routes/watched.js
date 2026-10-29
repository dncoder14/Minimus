const { createListRouter } = require('./lists');

module.exports = createListRouter({
  model: 'watched',
  label: 'watched',
  listKey: 'watched',
  checkKey: 'isWatched',
  dateField: 'watchedAt'
});
