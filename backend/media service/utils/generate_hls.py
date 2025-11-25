import subprocess
import os
from libs.s3_client import client
import datetime
import tempfile
from config.config import settings
import shutil

HLS_BUCKET_NAME = settings.s3_storage.hls_bucket_name or "hls-playlist"
SOURCE_BUCKET = settings.s3_storage.s3_bucket_name


def generate_hls(audio_id: str, is_add: bool = False):
    """
    Generate HLS for the given audio file from the MinIO source bucket and upload to the target bucket.
    Args:
        audio_id (str): The ID of the audio file (used to form the file names and directories).
    Returns:
        dict: Status message.
    """

    # Create a temporary file to store the downloaded audio
    with tempfile.NamedTemporaryFile(delete=False) as temp_audio_file:
        input_file = temp_audio_file.name

        try:
            object_key = f"{'add' if is_add else 'music'}/{audio_id}"

            # Open the temp file for writing
            with open(input_file, "wb") as f:
                client.download_fileobj(SOURCE_BUCKET, object_key, f)

            print(f"Downloaded {object_key} from MinIO to {input_file}")

        except Exception as e:
            print(f"Error downloading audio file from MinIO: {e}")
            return {"status": "error", "message": f"Failed to download audio file: {e}"}

    output_dir = f"/tmp/hls/{audio_id}"
    os.makedirs(output_dir, exist_ok=True)

    # Generate HLS with FFmpeg
    cmd = [
        "ffmpeg",
        "-i", input_file,
        "-vn",
        "-c:a", "aac", "-b:a", "128k",
        "-f", "hls",
        "-hls_time", "10",  # Use smaller segment size for testing
        "-hls_flags", "independent_segments",
        "-hls_list_size", "0",
        "-hls_segment_filename", f"{output_dir}/segment_%03d.ts",
        f"{output_dir}/master.m3u8"
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"HLS segments for {audio_id} generated successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error generating HLS: {e}")
        return {"status": "error", "message": f"Failed to generate HLS: {e}"}
    finally:
        # Clean up the temporary audio file
        os.remove(input_file)

    # Upload segments and playlist to MinIO
    try:
        for file in os.listdir(output_dir):
            file_path = os.path.join(output_dir, file)
            object_name = f"{'add' if is_add else 'music'}/{audio_id}/{file}"

            client.upload_file(
                Filename=file_path,
                Bucket=HLS_BUCKET_NAME,
                Key=object_name,
                ExtraArgs={
                    "Metadata": {
                        "last-access": datetime.datetime.utcnow().isoformat()
                    }
                }
            )
            print(f"Uploaded {file} to {HLS_BUCKET_NAME}/{object_name}")
    except Exception as e:
        print(f"Error uploading HLS segments to MinIO: {e}")
        return {"status": "error", "message": f"Failed to upload HLS segments: {e}"}
    finally:
        # delete output_dir directory and its contents
        try:
            shutil.rmtree(output_dir, ignore_errors=True)
            print(f"Removed temporary HLS directory {output_dir}")
        except Exception as e:
            print(f"Error removing output directory {output_dir}: {e}")
        


    return {"status": "success", "message": "HLS segments uploaded"}
