export default {
  routes: [
    {
      method: 'GET',
      path: '/recipes',
      handler: 'recipe.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/recipes/:id',
      handler: 'recipe.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/recipes',
      handler: 'recipe.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/recipes/:id',
      handler: 'recipe.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/recipes/:id',
      handler: 'recipe.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
