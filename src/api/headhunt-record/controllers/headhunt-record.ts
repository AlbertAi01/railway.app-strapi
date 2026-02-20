'use strict';

/**
 * Headhunt Record controller
 *
 * Custom endpoints:
 *  POST /api/headhunt-records/submit       — Submit/update pull data for a banner (auth required)
 *  GET  /api/headhunt-records/global-stats  — Aggregated global pull stats (public)
 *  GET  /api/headhunt-records/leaderboard   — Top pullers / luckiest (public)
 *  GET  /api/headhunt-records/my-history    — Authenticated user's pull history
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::headhunt-record.headhunt-record',
  ({ strapi }) => ({
    // ────────── Submit / Update Pull Data ──────────
    async submit(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in to submit pull data');

      const { banner, bannerType, pulls, region, importSource } = ctx.request.body;

      if (!banner || !bannerType || !Array.isArray(pulls)) {
        return ctx.badRequest('Missing required fields: banner, bannerType, pulls[]');
      }

      // Validate banner type
      if (!['operator', 'weapon', 'standard'].includes(bannerType)) {
        return ctx.badRequest('bannerType must be operator, weapon, or standard');
      }

      // Count rarities from the pulls array
      // Each pull: { name: string, rarity: number, date?: string, itemType?: 'operator'|'weapon' }
      let sixStarCount = 0;
      let fiveStarCount = 0;
      let fourStarCount = 0;
      let threeStarCount = 0;
      const sixStarNames: string[] = [];
      const fiveStarNames: string[] = [];

      for (const pull of pulls) {
        if (!pull || typeof pull.rarity !== 'number') continue;
        switch (pull.rarity) {
          case 6:
            sixStarCount++;
            if (pull.name) sixStarNames.push(pull.name);
            break;
          case 5:
            fiveStarCount++;
            if (pull.name) fiveStarNames.push(pull.name);
            break;
          case 4:
            fourStarCount++;
            break;
          default:
            threeStarCount++;
            break;
        }
      }

      // Check if user already has a record for this banner
      const existing = await strapi.db
        .query('api::headhunt-record.headhunt-record')
        .findOne({
          where: { owner: user.id, Banner: banner },
        });

      const data = {
        Banner: banner,
        BannerType: bannerType,
        Pulls: pulls,
        TotalPulls: pulls.length,
        SixStarCount: sixStarCount,
        FiveStarCount: fiveStarCount,
        FourStarCount: fourStarCount,
        ThreeStarCount: threeStarCount,
        SixStarNames: sixStarNames,
        FiveStarNames: fiveStarNames,
        ImportSource: importSource || 'manual',
        Region: region || null,
        LastImportedAt: new Date().toISOString(),
      };

      let record;
      if (existing) {
        record = await strapi.db
          .query('api::headhunt-record.headhunt-record')
          .update({
            where: { id: existing.id },
            data,
          });
      } else {
        record = await strapi.db
          .query('api::headhunt-record.headhunt-record')
          .create({
            data: { ...data, owner: user.id },
          });
      }

      ctx.body = {
        data: {
          id: record.id,
          banner,
          totalPulls: pulls.length,
          sixStarCount,
          fiveStarCount,
        },
        message: existing ? 'Pull data updated' : 'Pull data submitted',
      };
    },

    // ────────── Global Stats (Public) ──────────
    async globalStats(ctx: any) {
      const { banner } = ctx.query; // Optional filter

      const where: any = {};
      if (banner && banner !== 'all') {
        where.Banner = banner;
      }

      const records = await strapi.db
        .query('api::headhunt-record.headhunt-record')
        .findMany({ where });

      // Aggregate
      let totalPulls = 0;
      let totalSixStar = 0;
      let totalFiveStar = 0;
      let totalFourStar = 0;
      let totalThreeStar = 0;
      const contributors = new Set<number>();
      const sixStarCounts: Record<string, number> = {};
      const fiveStarCounts: Record<string, number> = {};
      const bannerStats: Record<string, {
        pulls: number;
        sixStar: number;
        fiveStar: number;
        users: Set<number>;
      }> = {};

      for (const rec of records) {
        totalPulls += rec.TotalPulls || 0;
        totalSixStar += rec.SixStarCount || 0;
        totalFiveStar += rec.FiveStarCount || 0;
        totalFourStar += rec.FourStarCount || 0;
        totalThreeStar += rec.ThreeStarCount || 0;
        if (rec.owner) contributors.add(rec.owner);

        // Count individual 6-star and 5-star pulls by name
        if (Array.isArray(rec.SixStarNames)) {
          for (const name of rec.SixStarNames) {
            sixStarCounts[name] = (sixStarCounts[name] || 0) + 1;
          }
        }
        if (Array.isArray(rec.FiveStarNames)) {
          for (const name of rec.FiveStarNames) {
            fiveStarCounts[name] = (fiveStarCounts[name] || 0) + 1;
          }
        }

        // Per-banner breakdown
        const b = rec.Banner || 'Unknown';
        if (!bannerStats[b]) {
          bannerStats[b] = { pulls: 0, sixStar: 0, fiveStar: 0, users: new Set() };
        }
        bannerStats[b].pulls += rec.TotalPulls || 0;
        bannerStats[b].sixStar += rec.SixStarCount || 0;
        bannerStats[b].fiveStar += rec.FiveStarCount || 0;
        if (rec.owner) bannerStats[b].users.add(rec.owner);
      }

      // Sort most-pulled characters
      const mostPulledSixStar = Object.entries(sixStarCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }));

      const mostPulledFiveStar = Object.entries(fiveStarCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }));

      // Format banner stats (convert Sets to counts)
      const bannerBreakdown = Object.entries(bannerStats).map(([name, stats]) => ({
        banner: name,
        totalPulls: stats.pulls,
        sixStarRate: stats.pulls > 0 ? Number(((stats.sixStar / stats.pulls) * 100).toFixed(2)) : 0,
        fiveStarRate: stats.pulls > 0 ? Number(((stats.fiveStar / stats.pulls) * 100).toFixed(2)) : 0,
        userCount: stats.users.size,
      }));

      ctx.body = {
        data: {
          totalPulls,
          contributors: contributors.size,
          sixStarRate: totalPulls > 0 ? Number(((totalSixStar / totalPulls) * 100).toFixed(2)) : 0,
          fiveStarRate: totalPulls > 0 ? Number(((totalFiveStar / totalPulls) * 100).toFixed(2)) : 0,
          fourStarRate: totalPulls > 0 ? Number(((totalFourStar / totalPulls) * 100).toFixed(2)) : 0,
          totalSixStar,
          totalFiveStar,
          mostPulledSixStar,
          mostPulledFiveStar,
          bannerBreakdown,
        },
      };
    },

    // ────────── Leaderboard (Public) ──────────
    async leaderboard(ctx: any) {
      const { sort = 'pulls', banner, limit = 50 } = ctx.query;

      const where: any = {};
      if (banner && banner !== 'all') {
        where.Banner = banner;
      }

      const records = await strapi.db
        .query('api::headhunt-record.headhunt-record')
        .findMany({
          where,
          populate: ['owner'],
        });

      // Aggregate per-user stats across all their banner records
      const userMap: Record<number, {
        userId: number;
        username: string;
        totalPulls: number;
        sixStarCount: number;
        fiveStarCount: number;
        bannerCount: number;
      }> = {};

      for (const rec of records) {
        const ownerId = rec.owner?.id || rec.owner;
        if (!ownerId) continue;

        if (!userMap[ownerId]) {
          userMap[ownerId] = {
            userId: ownerId,
            username: rec.owner?.username || `User ${ownerId}`,
            totalPulls: 0,
            sixStarCount: 0,
            fiveStarCount: 0,
            bannerCount: 0,
          };
        }
        userMap[ownerId].totalPulls += rec.TotalPulls || 0;
        userMap[ownerId].sixStarCount += rec.SixStarCount || 0;
        userMap[ownerId].fiveStarCount += rec.FiveStarCount || 0;
        userMap[ownerId].bannerCount += 1;
      }

      let entries = Object.values(userMap);

      // Sort
      if (sort === 'lucky') {
        // Luckiest = highest 6-star rate (minimum 10 pulls to qualify)
        entries = entries
          .filter((e) => e.totalPulls >= 10)
          .sort((a, b) => {
            const rateA = a.totalPulls > 0 ? a.sixStarCount / a.totalPulls : 0;
            const rateB = b.totalPulls > 0 ? b.sixStarCount / b.totalPulls : 0;
            return rateB - rateA;
          });
      } else {
        // Most pulls
        entries.sort((a, b) => b.totalPulls - a.totalPulls);
      }

      const lim = Math.min(Number(limit) || 50, 100);

      ctx.body = {
        data: {
          sort,
          totalPlayers: Object.keys(userMap).length,
          totalPulls: entries.reduce((s, e) => s + e.totalPulls, 0),
          overallSixStarRate:
            entries.reduce((s, e) => s + e.totalPulls, 0) > 0
              ? Number(
                  (
                    (entries.reduce((s, e) => s + e.sixStarCount, 0) /
                      entries.reduce((s, e) => s + e.totalPulls, 0)) *
                    100
                  ).toFixed(2)
                )
              : 0,
          entries: entries.slice(0, lim).map((e, i) => ({
            rank: i + 1,
            username: e.username,
            totalPulls: e.totalPulls,
            sixStarCount: e.sixStarCount,
            fiveStarCount: e.fiveStarCount,
            sixStarRate:
              e.totalPulls > 0
                ? Number(((e.sixStarCount / e.totalPulls) * 100).toFixed(2))
                : 0,
            bannerCount: e.bannerCount,
          })),
        },
      };
    },

    // ────────── My History (Authenticated) ──────────
    async myHistory(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in');

      const records = await strapi.db
        .query('api::headhunt-record.headhunt-record')
        .findMany({
          where: { owner: user.id },
          orderBy: { LastImportedAt: 'desc' },
        });

      // Compute pity counters per banner
      const history = records.map((rec: any) => {
        const pulls = Array.isArray(rec.Pulls) ? rec.Pulls : [];
        // Calculate pulls since last 6-star (pity)
        let pity = 0;
        for (let i = pulls.length - 1; i >= 0; i--) {
          pity++;
          if (pulls[i]?.rarity === 6) break;
        }
        // If no 6-star found, pity = total pulls
        const hasSixStar = pulls.some((p: any) => p?.rarity === 6);
        if (!hasSixStar) pity = pulls.length;

        return {
          id: rec.id,
          banner: rec.Banner,
          bannerType: rec.BannerType,
          totalPulls: rec.TotalPulls,
          sixStarCount: rec.SixStarCount,
          fiveStarCount: rec.FiveStarCount,
          fourStarCount: rec.FourStarCount,
          threeStarCount: rec.ThreeStarCount,
          sixStarNames: rec.SixStarNames,
          fiveStarNames: rec.FiveStarNames,
          currentPity: pity,
          importSource: rec.ImportSource,
          region: rec.Region,
          lastImportedAt: rec.LastImportedAt,
          pulls,
        };
      });

      // Summary across all banners
      const totalPulls = history.reduce((s: number, h: any) => s + h.totalPulls, 0);
      const totalSixStar = history.reduce((s: number, h: any) => s + h.sixStarCount, 0);
      const totalFiveStar = history.reduce((s: number, h: any) => s + h.fiveStarCount, 0);

      ctx.body = {
        data: {
          summary: {
            totalPulls,
            totalSixStar,
            totalFiveStar,
            sixStarRate: totalPulls > 0 ? Number(((totalSixStar / totalPulls) * 100).toFixed(2)) : 0,
            fiveStarRate: totalPulls > 0 ? Number(((totalFiveStar / totalPulls) * 100).toFixed(2)) : 0,
            bannersTracked: history.length,
          },
          banners: history,
        },
      };
    },
  })
);
