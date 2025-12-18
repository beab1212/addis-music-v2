import { Request, Response } from "express";
import  { v4 as uuidv4 } from "uuid";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uploadImageToCloudinary } from '../libs/cloudinary';
import { uploadAudioToS3 } from '../libs/s3Client';
import { createAdvertisementSchema } from "../validators/advertisementValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';


export const advertisementController = {
    createAdvertisement: async (req: Request, res: Response) => {
        const { title, linkUrl, videoUrl, startDate, endDate, advertiser, isActive } = createAdvertisementSchema.parse(req.body);

        // start and end date validation must be in the future
        const now = new Date();
        if (new Date(startDate) <= now) {
            throw new CustomErrors.BadRequestError("Start date must be in the future");
        }

        if (new Date(endDate) <= new Date(startDate)) {
            throw new CustomErrors.BadRequestError("End date must be after start date");
        }

        let audioPath: string | null = null;
        let coverPath: string | null = null;

        // check if audio file is present
        if (!req.files || !(req.files as any).audio) {
            throw new CustomErrors.BadRequestError('Audio file is required');
        }

        const audioId = uuidv4();
        
        audioPath = (req.files as any).audio[0].path;

        // upload to s3 bucket
        audioPath = await uploadAudioToS3(audioPath as string, audioId, (req.files as any).audio[0].mimetype, true);


        // check if cover image exists
        if ((req.files as any).cover) {
            coverPath = (req.files as any).cover[0].path;
            coverPath = await uploadImageToCloudinary(coverPath as string);
        }

        const newAd = await prisma.advertisement.create({
            data: {
                title,
                targetUrl: linkUrl,
                imageUrl: coverPath || undefined,
                videoUrl,
                startDate,
                endDate,
                advertiser,
                budget: 0, // default budget
                active: isActive !== null && isActive !== undefined ? isActive : true, // default active status
            },
        });

        const addTrack = await prisma.adTrack.create({
            data: {
                id: audioId,
                adId: newAd.id,
                audioUrl: audioPath,
            }
        });

        res.status(201).json({
            success: true,
            message: "Advertisement created successfully",
            data: { advertisement: newAd, adTrack: addTrack },
        });
    },

    updateAdvertisement: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const { title, linkUrl, videoUrl, startDate, endDate, advertiser, isActive } = createAdvertisementSchema.parse(req.body);

        const ad = await prisma.advertisement.findUnique({ where: { id } });

        if (!ad) {
            throw new CustomErrors.NotFoundError("Advertisement not found");
        }

        const updatedAd = await prisma.advertisement.update({
            where: { id },
            data: {
                title,
                targetUrl: linkUrl,
                videoUrl,
                startDate,
                endDate,
                advertiser,
                active: isActive !== null && isActive !== undefined ? isActive : true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Advertisement updated successfully",
            data: { advertisement: updatedAd },
        });
    },

    updateAddTrack: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);

        const adTrack = await prisma.adTrack.findUnique({ where: { id } });

        if (!adTrack) {
            throw new CustomErrors.NotFoundError("Advertisement track not found");
        }

        let audioPath: string | null = null;

        // check if audio file is present
        if (!req.files || !(req.files as any).audio) {
            throw new CustomErrors.BadRequestError('Audio file is required');
        }

        const audioId = uuidv4();
        
        audioPath = (req.files as any).audio[0].path;

        // upload to s3 bucket
        audioPath = await uploadAudioToS3(audioPath as string, audioId, (req.files as any).audio[0].mimetype, true);

        const updatedAdTrack = await prisma.adTrack.update({
            where: { id },
            data: {
                audioUrl: audioPath,
            }

        });

        // TODO: Delete old audio from S3

        res.status(200).json({
            success: true,
            message: "Advertisement track updated successfully",
            data: { adTrack: updatedAdTrack },
        });
    },
    
    updateAddCover: async (req: Request, res: Response) => {
        const { id } = req.params;

        const ad = await prisma.advertisement.findUnique({ where: { id } });

        if (!ad) {
            throw new CustomErrors.NotFoundError("Advertisement not found");
        }

        let coverPath: string | null = null;

        // check if cover image exists
        if (!req.files || !(req.files as any).cover) {
            throw new CustomErrors.BadRequestError('Cover image is required');
        }

        coverPath = (req.files as any).cover[0].path;
        coverPath = await uploadImageToCloudinary(coverPath as string);

        const updatedAd = await prisma.advertisement.update({
            where: { id },
            data: {
                imageUrl: coverPath,
            }
        });

        // TODO: Delete old cover image from Cloudinary

        res.status(200).json({
            success: true,
            message: "Advertisement cover image updated successfully",
            data: { advertisement: updatedAd },
        });
    },

    deleteAdvertisement: async (req: Request, res: Response) => {
        const { id } = req.params;

        const ad = await prisma.advertisement.findUnique({ where: { id } });

        if (!ad) {
            throw new CustomErrors.NotFoundError("Advertisement not found");
        }

        await prisma.adTrack.deleteMany({ where: { adId: ad.id } });

        await prisma.advertisement.delete({ where: { id } });
        // TODO: Delete associated files from S3 and Cloudinary

        res.status(200).json({
            success: true,
            message: "Advertisement deleted successfully",
        });
    },

    toggleAddStatus: async (req: Request, res: Response) => {
        const { id } = req.params;

        const ad = await prisma.advertisement.findUnique({ where: { id } });

        if (!ad) {
            throw new CustomErrors.NotFoundError("Advertisement not found");
        }

        const updatedAd = await prisma.advertisement.update({
            where: { id },
            data: {
                active: !ad.active,
            }
        });
        res.status(200).json({
            success: true,
            message: `Advertisement ${updatedAd.active ? 'activated' : 'deactivated'} successfully`,
            data: { advertisement: updatedAd },
        });
    },

    searchAdvertisements: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.merge(paginationSchema).parse(req.query);
        const offset = (page - 1) * limit;

        const [ads, total] = await Promise.all([
            prisma.advertisement.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { advertiser: { contains: q, mode: 'insensitive' } },
                    ],
                },
                skip: offset,
                take: limit,
            }),
            prisma.advertisement.count({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { advertiser: { contains: q, mode: 'insensitive' } },
                    ],
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { advertisements: ads },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    getAdvertisementById: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);

        const ad = await prisma.advertisement.findUnique({ where: { id } });

        if (!ad) {
            throw new CustomErrors.NotFoundError("Advertisement not found");
        }

        res.status(200).json({
            success: true,
            data: { advertisement: ad },
        });
    },

    getAllAdvertisements: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const [ads, total] = await Promise.all([
            prisma.advertisement.findMany({
                skip: offset,
                take: limit,
            }),
            prisma.advertisement.count(),
        ]);

        res.status(200).json({
            success: true,
            data: { advertisements: ads },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

}