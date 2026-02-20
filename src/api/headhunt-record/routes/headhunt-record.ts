export default {
  routes: [
    // Custom endpoints (must come before core CRUD routes)
    {
      method: 'POST',
      path: '/headhunt-records/submit',
      handler: 'headhunt-record.submit',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/headhunt-records/global-stats',
      handler: 'headhunt-record.globalStats',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/headhunt-records/leaderboard',
      handler: 'headhunt-record.leaderboard',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/headhunt-records/my-history',
      handler: 'headhunt-record.myHistory',
      config: {
        policies: [],
      },
    },
    // Standard CRUD (find, findOne, create, update, delete)
    {
      method: 'GET',
      path: '/headhunt-records',
      handler: 'headhunt-record.find',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/headhunt-records/:id',
      handler: 'headhunt-record.findOne',
      config: { policies: [] },
    },
  ],
};
