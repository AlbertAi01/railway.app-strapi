export default {
  routes: [
    {
      method: 'GET',
      path: '/banners',
      handler: 'banner.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/banners/:id',
      handler: 'banner.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/banners',
      handler: 'banner.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/banners/:id',
      handler: 'banner.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/banners/:id',
      handler: 'banner.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
