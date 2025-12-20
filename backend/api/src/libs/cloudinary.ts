import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config';
import fs from 'fs';


cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});


export const uploadImageToCloudinary = async (src: string) => {
    const result = await cloudinary.uploader.upload(src, {
        folder: 'addis-music/images',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    });

    // remove the file locally after upload if needed
    fs.unlinkSync(src);
    return result.secure_url;
}

export const deleteImageFromCloudinary = async (publicId: string) => {
    if (!publicId) return false;
    if (publicId.startsWith('http')) {
        const parts = publicId.split('/');
        publicId = parts.slice(parts.indexOf('images')).join('/').split('.').slice(0, -1).join('.');
    }
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return false;
    }
    return true;
}


export default cloudinary;
