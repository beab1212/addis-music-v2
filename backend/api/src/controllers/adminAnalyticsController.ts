import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';

export const adminAnalyticsController = {
    // total user with average growth with in month in percentage
    getTotalUsersWithAverageGrowth: async (req: Request, res: Response) => {
        const totalUsers = await prisma.user.count();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const usersOneMonthAgo = await prisma.user.count({
            where: {
                createdAt: {
                    lt: oneMonthAgo,
                },
            },
        });

        const newUsersLastMonth = totalUsers - usersOneMonthAgo;
        const averageGrowth = usersOneMonthAgo === 0 ? 100 : (newUsersLastMonth / usersOneMonthAgo) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                averageGrowth: parseFloat(averageGrowth.toFixed(2)),
            },
        });
    },

    // total track with average growth with in month in percentage
    getTotalTracksWithAverageGrowth: async (req: Request, res: Response) => {
        const totalTracks = await prisma.track.count();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const tracksOneMonthAgo = await prisma.track.count({
            where: {
                createdAt: {
                    lt: oneMonthAgo,
                },
            },
        });

        const newTracksLastMonth = totalTracks - tracksOneMonthAgo;
        const averageGrowth = tracksOneMonthAgo === 0 ? 100 : (newTracksLastMonth / tracksOneMonthAgo) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalTracks,
                averageGrowth: parseFloat(averageGrowth.toFixed(2)),
            },
        });
    },

    // total albums with average growth with in month in percentage
    getTotalAlbumsWithAverageGrowth: async (req: Request, res: Response) => {
        const totalAlbums = await prisma.album.count();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const albumsOneMonthAgo = await prisma.album.count({
            where: {
                createdAt: {
                    lt: oneMonthAgo,
                },
            },
        });

        const newAlbumsLastMonth = totalAlbums - albumsOneMonthAgo;
        const averageGrowth = albumsOneMonthAgo === 0 ? 100 : (newAlbumsLastMonth / albumsOneMonthAgo) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalAlbums,
                averageGrowth: parseFloat(averageGrowth.toFixed(2)),
            },
        });
    },

    // total plays with average growth with in month in percentage
    getTotalPlaysWithAverageGrowth: async (req: Request, res: Response) => {
        const totalPlays = await prisma.playHistory.count();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const playsOneMonthAgo = await prisma.playHistory.count({
            where: {
                playedAt: {
                    lt: oneMonthAgo,
                },
            },
        });

        const newPlaysLastMonth = totalPlays - playsOneMonthAgo;
        const averageGrowth = playsOneMonthAgo === 0 ? 100 : (newPlaysLastMonth / playsOneMonthAgo) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalPlays,
                averageGrowth: parseFloat(averageGrowth.toFixed(2)),
            },
        });
    },

    // total revenue with average growth with in month in percentage
    getTotalRevenueWithAverageGrowth: async (req: Request, res: Response) => {
        const totalRevenueResult = await prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
        });
        const totalRevenue = totalRevenueResult._sum.amount
            ? (typeof totalRevenueResult._sum.amount === 'number'
                ? totalRevenueResult._sum.amount
                : totalRevenueResult._sum.amount.toNumber())
            : 0;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const revenueOneMonthAgoResult = await prisma.payment.aggregate({
            where: {
                createdAt: {
                    lt: oneMonthAgo,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const revenueOneMonthAgo = revenueOneMonthAgoResult._sum.amount
            ? (typeof revenueOneMonthAgoResult._sum.amount === 'number'
                ? revenueOneMonthAgoResult._sum.amount
                : revenueOneMonthAgoResult._sum.amount.toNumber())
            : 0;

        const newRevenueLastMonth = totalRevenue - revenueOneMonthAgo;
        const averageGrowth = revenueOneMonthAgo === 0 ? 100 : (newRevenueLastMonth / revenueOneMonthAgo) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                averageGrowth: parseFloat(averageGrowth.toFixed(2)),
            },
        });
    },

    // Genre Distribution in percentage
    getGenreDistribution: async (req: Request, res: Response) => {
        // top 8 genres and rest as others
        const genreCounts = await prisma.track.groupBy({
            by: ['genreId'],
            _count: {
                genreId: true,
            },
        });

        const totalTracks = genreCounts.reduce((acc, curr) => acc + curr._count.genreId, 0);

        const sortedGenres = genreCounts.sort((a, b) => b._count.genreId - a._count.genreId);

        const topGenres = sortedGenres.slice(0, 8);
        const otherGenres = sortedGenres.slice(8);

        // fetch genre names for the grouped genreIds
        const genreIds = [...new Set(genreCounts.map(g => g.genreId as string | null).filter((id): id is string => id !== null && id !== undefined))];
        const genres = genreIds.length > 0
            ? await prisma.genre.findMany({ where: { id: { in: genreIds } } })
            : [];
        const genreMap = new Map(genres.map(g => [g.id, g.name]));

        const distribution: { genre: string; percentage: number }[] = topGenres.map((g) => {
            const name = g.genreId != null ? (genreMap.get(g.genreId) ?? 'Unknown') : 'Unknown';
            return {
                genre: name,
                percentage: parseFloat(((g._count.genreId / totalTracks) * 100).toFixed(2)),
            };
        });

        const otherCount = otherGenres.reduce((acc, curr) => acc + curr._count.genreId, 0);
        if (otherCount > 0) {
            distribution.push({
                genre: 'Others',
                percentage: parseFloat(((otherCount / totalTracks) * 100).toFixed(2)),
            });
        }

        res.status(200).json({
            success: true,
            data: distribution,
        });
    },

}