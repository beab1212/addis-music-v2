import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../libs/cloudinary';
import config from '../config/config';
import { CustomErrors } from '../errors';


const IMAGE_MAX_SIZE = 5 * 1024 * 1024;   // 5MB
const AUDIO_MAX_SIZE = 30 * 1024 * 1024;  // 30MB


// create uploads directories if they don't exist
const audioDir = path.join(config.tempPath, 'audio');
const imageDir = path.join(config.tempPath, 'images');

if (!fs.existsSync(audioDir)){
    fs.mkdirSync(audioDir, { recursive: true });
}

if (!fs.existsSync(imageDir)){
    fs.mkdirSync(imageDir, { recursive: true });
}

interface CloudinaryStorageParams {
  folder?: string;
  allowed_formats?: string[];
}

// Cloudinary storage for images — no local temp files
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'addis-music/images', // optional folder name
    size_limit: 5 * 1024 * 1024, // 5MB size limit
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as CloudinaryStorageParams,
});


// Local audio storage with file type validation
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${config.tempPath}/audio/`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});


// Separate Multer instances
export const uploadImage = multer({ storage: cloudinaryStorage });
export const uploadAudio = multer({ storage: audioStorage });


export const bothUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, `${config.tempPath}/images/`);
      } else if (file.mimetype.startsWith('audio/')) {
        cb(null, `${config.tempPath}/audio/`);
      } else {
        cb(new CustomErrors.BadRequestError(`Invalid file type for ${file.fieldname}`), '');
      }
    },

    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + uuidv4();
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),

  limits: {
    fileSize: AUDIO_MAX_SIZE, // Set max size for audio files
  },

  fileFilter: (req, file, cb) => {
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const isImage = allowedImageTypes.includes(file.mimetype);
    const isAudio = allowedAudioTypes.includes(file.mimetype);

    if (!isImage && !isAudio) {
      return cb(new CustomErrors.BadRequestError(`Invalid file type for ${file.fieldname}`));
    }

    // Enforce dynamic per-file limits
    if (isImage && file.size > IMAGE_MAX_SIZE) {
      return cb(new CustomErrors.BadRequestError(`Image size exceeds ${IMAGE_MAX_SIZE / 1024 / 1024} MB`));
    }

    if (isAudio && file.size > AUDIO_MAX_SIZE) {
      return cb(new CustomErrors.BadRequestError(`Audio size exceeds ${AUDIO_MAX_SIZE / 1024 / 1024} MB`));
    }

    cb(null, true);    
  }
});
