export default {
  routes: [
    {
      method: 'GET',
      path: '/equipment-sets',
      handler: 'equipment-set.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/equipment-sets/:id',
      handler: 'equipment-set.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/equipment-sets',
      handler: 'equipment-set.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/equipment-sets/:id',
      handler: 'equipment-set.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/equipment-sets/:id',
      handler: 'equipment-set.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
