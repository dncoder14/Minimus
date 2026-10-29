const { createListRouter } = require('./lists');

module.exports = createListRouter({
  model: 'favorite',
  label: 'favorites',
  listKey: 'favorites',
  checkKey: 'inFavorites',
  dateField: 'addedAt'
});
