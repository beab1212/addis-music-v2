import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import config from "../config/config";
import  { v4 as uuidv4 } from "uuid";

export const s3Client = new S3Client({
    region: config.s3Storage.region,
    endpoint: config.s3Storage.endpoint,        // MinIO endpoint
    credentials: {
        accessKeyId: config.s3Storage.accessKeyId,
        secretAccessKey: config.s3Storage.secretAccesskey,
    },
    forcePathStyle: true,       // IMPORTANT for MinIO compatibility
});

export const uploadAudioToS3 = async (filePath: string, audioId: string, mimeType: string, isAdd: boolean = false) => {
    const fileStream = fs.createReadStream(filePath);

    const path = isAdd ? 'add' : 'music';

    const uploadParams = {
        Bucket: config.s3Storage.bucketName,
        // Key: `${path}/${filePath.split('/').pop()}`, // use multer generated file name
        Key: `${path}/${audioId}`, // use audioId as file name
        Body: fileStream,
        ContentType: mimeType,
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        // delete the file locally after upload if needed
        fs.unlinkSync(filePath);
        return `${config.s3Storage.bucketName}/${uploadParams.Key}`;
    } catch (err) {
        console.error("Error uploading audio to S3:", err);
        throw err;
    }
}

export const generatePresignedUrl = (key: string, expiresIn: number = 3600) => {
    const url = `${config.s3Storage.endpoint}/${config.s3Storage.bucketName}/${key}?expires_in=${expiresIn}&token=${uuidv4()}`;
    return url;
}

export const deleteAudioFromS3 = async (key: string) => {
    const deleteParams = {
        Bucket: config.s3Storage.bucketName,
        Key: key,
    };

    // Delete HLS segments folder if exists
    const folderPrefix = key
    const listParams = {
        Bucket: 'hls-playlist',
        Prefix: folderPrefix,
    };

    try {
        // Delete the single audio object
        await s3Client.send(new DeleteObjectCommand(deleteParams));

        // Delete HLS segments folder if exists
        const listed = await s3Client.send(new ListObjectsV2Command(listParams));
        if (listed.Contents && listed.Contents.length > 0) {
            const objects = listed.Contents.map(obj => ({ Key: obj.Key! }));
            await s3Client.send(new DeleteObjectsCommand({
                Bucket: listParams.Bucket,
                Delete: {
                    Objects: objects,
                    Quiet: false,
                },
            }));
        }
    } catch (err) {
        console.error("Error deleting audio from S3:", err);
        throw err;
    }
}

