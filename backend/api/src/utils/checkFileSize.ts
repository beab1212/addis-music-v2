/**
 * Middleware to check uploaded file sizes dynamically based on their type.
 * Images are limited to 5 MB and audio files to 50 MB.
 * If any file exceeds its limit, a BadRequestError is thrown.
 */
import { Request, Response, NextFunction } from 'express';
import { CustomErrors } from '../errors';
import fs from 'fs';

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;  // 5 MB
const AUDIO_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

// Middleware to check file size dynamically
export const checkFileSize = (req: Request, res: Response, next: NextFunction) => {
  // If using single file:
  const files = req.files 
    ? Array.isArray(req.files) 
      ? req.files 
      : Object.values(req.files).flat()
    : req.file 
      ? [req.file] 
      : [];

  if (!files.length) return next(); // No files uploaded

  for (const file of files) {
    if (!file.mimetype) {
      return next(new CustomErrors.BadRequestError(`Missing mimetype for file ${file.originalname}`));
    }

    if (file.mimetype.startsWith('image/')) {
      if (file.size > IMAGE_MAX_SIZE) {
        return next(
          new CustomErrors.BadRequestError(`Image "${file.originalname}" exceeds ${IMAGE_MAX_SIZE / 1024 / 1024} MB`)
        );
      }
    } else if (file.mimetype.startsWith('audio/')) {
      if (file.size > AUDIO_MAX_SIZE) {
        return next(
          new CustomErrors.BadRequestError(`Audio "${file.originalname}" exceeds ${AUDIO_MAX_SIZE / 1024 / 1024} MB`)
        );
      }
    } else {
      return next(new CustomErrors.BadRequestError(`Invalid file type for "${file.originalname}"`));
    }
  }

  next();
};
