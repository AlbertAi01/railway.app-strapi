export default {
  routes: [
    {
      method: 'GET',
      path: '/map-markers',
      handler: 'map-marker.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/map-markers/:id',
      handler: 'map-marker.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/map-markers',
      handler: 'map-marker.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/map-markers/:id',
      handler: 'map-marker.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/map-markers/:id',
      handler: 'map-marker.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
