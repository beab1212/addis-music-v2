import pyloudnorm as pyln

async def measure_loudness(audio_data, sample_rate):
    """
    Measure the loudness of the given audio data using pyloudnorm.
    Args:
        audio_data (numpy.ndarray): The audio data to measure.
        sample_rate (int): The sample rate of the audio data.
    Returns:
        float: The measured loudness in LUFS.
    """
    meter = pyln.Meter(sample_rate)  # create BS.1770 meter
    loudness = meter.integrated_loudness(audio_data)
    return loudness

async def normalize_loudness(audio, sr, target_lufs=-14):
    """
    Normalize the loudness of the given audio data to the target LUFS.
    Args:
        audio (numpy.ndarray): The audio data to normalize.
        sr (int): The sample rate of the audio data.
        target_lufs (float): The target loudness in LUFS.
    Returns:
        numpy.ndarray: The normalized audio data.
    """
    meter = pyln.Meter(sr)
    loudness = meter.integrated_loudness(audio)
    print("Before:", loudness)

    normalized_audio = pyln.normalize.loudness(audio, loudness, target_lufs)
    print("After:", meter.integrated_loudness(normalized_audio))

    return normalized_audio
