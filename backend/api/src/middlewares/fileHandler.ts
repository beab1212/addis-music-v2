import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import config from '../config/config.js';

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

// Local storage for audio files
const audioStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/audio'); // folder for audio files
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});


// Separate Multer instances
export const uploadImage = multer({ storage: cloudinaryStorage });
export const uploadAudio = multer({ storage: audioStorage });