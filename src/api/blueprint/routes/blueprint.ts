export default {
  routes: [
    {
      method: 'GET',
      path: '/blueprints',
      handler: 'blueprint.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/blueprints/:id',
      handler: 'blueprint.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/blueprints',
      handler: 'blueprint.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/blueprints/:id',
      handler: 'blueprint.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/blueprints/:id',
      handler: 'blueprint.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
