export default {
  routes: [
    {
      method: 'GET',
      path: '/weapons',
      handler: 'weapon.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/weapons/:id',
      handler: 'weapon.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/weapons',
      handler: 'weapon.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/weapons/:id',
      handler: 'weapon.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/weapons/:id',
      handler: 'weapon.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
