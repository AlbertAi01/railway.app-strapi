export default {
  routes: [
    {
      method: 'GET',
      path: '/achievements',
      handler: 'achievement.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/achievements/:id',
      handler: 'achievement.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/achievements',
      handler: 'achievement.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/achievements/:id',
      handler: 'achievement.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/achievements/:id',
      handler: 'achievement.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
