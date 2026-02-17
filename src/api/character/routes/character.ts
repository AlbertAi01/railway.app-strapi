export default {
  routes: [
    {
      method: 'GET',
      path: '/characters',
      handler: 'character.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/characters/:id',
      handler: 'character.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/characters',
      handler: 'character.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/characters/:id',
      handler: 'character.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/characters/:id',
      handler: 'character.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
