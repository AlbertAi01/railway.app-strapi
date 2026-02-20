// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Helper to ensure a permission exists for a role
    async function ensurePermission(roleId: number, action: string) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: roleId } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: roleId } });
        return true;
      }
      return false;
    }

    // Get roles
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    const authenticatedRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!publicRole || !authenticatedRole) {
      strapi.log.warn('Could not find public/authenticated roles for permission bootstrap');
      return;
    }

    let created = 0;

    // Content types that should be publicly readable
    const publicReadTypes = [
      'api::character.character',
      'api::weapon.weapon',
      'api::blueprint.blueprint',
      'api::equipment-set.equipment-set',
      'api::guide.guide',
      'api::recipe.recipe',
      'api::achievement.achievement',
      'api::map-marker.map-marker',
      'api::banner.banner',
      'api::operator-guide.operator-guide',
      'api::tier-list.tier-list',
      'api::gear-piece.gear-piece',
      'api::weapon-essence.weapon-essence',
      'api::farming-zone.farming-zone',
      'api::game-constant.game-constant',
      'api::build.build',
      'api::skill.skill',
      'api::material.material',
    ];

    // Grant find + findOne to public and authenticated roles
    for (const contentType of publicReadTypes) {
      for (const action of ['find', 'findOne']) {
        const fullAction = `${contentType}.${action}`;
        if (await ensurePermission(publicRole.id, fullAction)) created++;
        if (await ensurePermission(authenticatedRole.id, fullAction)) created++;
      }
    }

    // Headhunt record: public read access to global-stats, leaderboard, find, findOne
    const headhuntPublicActions = [
      'api::headhunt-record.headhunt-record.find',
      'api::headhunt-record.headhunt-record.findOne',
      'api::headhunt-record.headhunt-record.globalStats',
      'api::headhunt-record.headhunt-record.leaderboard',
    ];
    for (const action of headhuntPublicActions) {
      if (await ensurePermission(publicRole.id, action)) created++;
      if (await ensurePermission(authenticatedRole.id, action)) created++;
    }

    // Authenticated-only write permissions
    const authWritePermissions = [
      'api::blueprint.blueprint.create',
      'api::build.build.create',
      'api::build.build.update',
      'api::user-datum.user-datum.find',
      'api::user-datum.user-datum.findOne',
      'api::user-datum.user-datum.create',
      'api::user-datum.user-datum.update',
      'api::user-datum.user-datum.delete',
      'api::headhunt-record.headhunt-record.submit',
      'api::headhunt-record.headhunt-record.myHistory',
      'plugin::users-permissions.user.update',
    ];

    for (const action of authWritePermissions) {
      if (await ensurePermission(authenticatedRole.id, action)) created++;
    }

    if (created > 0) {
      strapi.log.info(`Bootstrapped: created ${created} API permissions`);
    }
  },
};
