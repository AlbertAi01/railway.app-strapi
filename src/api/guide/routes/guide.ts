export default {
  routes: [
    {
      method: 'GET',
      path: '/guides',
      handler: 'guide.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/guides/:id',
      handler: 'guide.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/guides',
      handler: 'guide.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/guides/:id',
      handler: 'guide.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/guides/:id',
      handler: 'guide.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
