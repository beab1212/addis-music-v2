import { S3Client } from "@aws-sdk/client-s3";
import config from "../config/config";

export const s3Client = new S3Client({
    region: config.s3Storage.region,
    endpoint: config.s3Storage.endpoint,        // MinIO endpoint
    credentials: {
        accessKeyId: config.s3Storage.accessKeyId,
        secretAccessKey: config.s3Storage.secretAccesskey,
    },
    forcePathStyle: true,       // IMPORTANT for MinIO compatibility
});
