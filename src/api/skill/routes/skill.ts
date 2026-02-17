export default {
  routes: [
    {
      method: 'GET',
      path: '/skills',
      handler: 'skill.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/skills/:id',
      handler: 'skill.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/skills',
      handler: 'skill.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/skills/:id',
      handler: 'skill.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/skills/:id',
      handler: 'skill.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
