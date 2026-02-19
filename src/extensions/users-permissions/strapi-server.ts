module.exports = (plugin: any) => {
  // Override the user update controller to allow self-updates only
  const originalUpdate = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx: any) => {
    const { id } = ctx.params;
    const authenticatedUserId = ctx.state.user?.id;

    // Only allow users to update their own profile
    if (!authenticatedUserId || Number(id) !== Number(authenticatedUserId)) {
      return ctx.forbidden('You can only update your own profile');
    }

    // Only allow updating safe fields (username)
    const allowedFields = ['username'];
    const body = ctx.request.body;
    const sanitized: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitized[field] = body[field];
      }
    }

    // Replace request body with sanitized version
    ctx.request.body = sanitized;

    return originalUpdate(ctx);
  };

  return plugin;
};
