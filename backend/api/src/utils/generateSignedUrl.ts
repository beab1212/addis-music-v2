import { mediaServer } from "../libs/axios";


export const generateSignedUrl = async (audioId: string, isAdd: boolean = false, expiresInSeconds?: number) => {
    
    // Generate the presigned URL
    try {
        const response = await mediaServer.get('/signed_url', { params: { 
            audio_id: audioId, 
            is_add: isAdd, 
            expiration: expiresInSeconds } });
        return response.data;
    } catch(e) {
        console.error('Error generating signed URL', e);
        throw new Error('Error generating signed URL');
    }
}
