export default {
  routes: [
    {
      method: 'GET',
      path: '/materials',
      handler: 'material.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/materials/:id',
      handler: 'material.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/materials',
      handler: 'material.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/materials/:id',
      handler: 'material.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/materials/:id',
      handler: 'material.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
