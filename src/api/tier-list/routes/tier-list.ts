export default {
  routes: [
    {
      method: 'GET',
      path: '/tier-lists',
      handler: 'tier-list.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tier-lists/:id',
      handler: 'tier-list.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/tier-lists',
      handler: 'tier-list.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tier-lists/:id',
      handler: 'tier-list.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/tier-lists/:id',
      handler: 'tier-list.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
