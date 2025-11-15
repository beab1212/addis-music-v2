import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from '../config/config';

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

interface CloudinaryStorageParams {
  folder?: string;
  allowed_formats?: string[];
}

// Cloudinary storage for images — no local temp files
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'addis-music', // optional folder name
    size_limit: 5 * 1024 * 1024, // 5MB size limit
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as CloudinaryStorageParams,
});


const audioFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3']; // MIME types for mp3, wav, and other audio formats

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only MP3 and WAV audio files are allowed.'));
  }
  cb(null, true); // File is valid
};

const audioStorageMemory = multer.memoryStorage(); // Store audio files in memory for further processing


// Separate Multer instances
export const uploadImage = multer({ storage: cloudinaryStorage });
export const audioStorage = multer({
    storage: audioStorageMemory,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: audioFileFilter, // Apply the file filter
});
