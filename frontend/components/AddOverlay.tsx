'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { formatNumber, getLowResCloudinaryUrl, capitalizeFirst } from '@/utils/helpers';
import { api } from '@/lib/api';


function AddOverlay() {
    const { isAdvertisementPlaying, advertisementData } = usePlayerStore();

    if (!isAdvertisementPlaying || !advertisementData) {
        return null;
    }

    const ad = advertisementData.advertisement;

    const recordClick = async () => {
        try {
            if (ad.id) {
                await api.post(`/ads/click/${ad.id}`);
            }
        } catch (error) {
            console.error("Failed to record ad click:", error);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="
            fixed z-50


            top-4 left-0 right-0
            w-full
            rounded-t-2xl

            sm:top-14 sm:right-8 sm:bottom-auto sm:left-auto
            sm:w-[420px]
            sm:rounded-2xl

            overflow-hidden
            bg-black/85 backdrop-blur-xl
            border border-white/10
            shadow-2xl
        "
            >
                {/* Image */}
                <div className="
            relative w-full overflow-hidden
            h-40 sm:h-56
        ">
                    <img
                        src={getLowResCloudinaryUrl(
                            ad.imageUrl ||
                            "https://res.cloudinary.com/dxcbu8zsz/image/upload/v1764662955/Music-album-cover-artwork-for-sale-2_z0nxok.jpg",
                            { width: 420, height: 224 }
                        )}
                        alt={ad.title || "Advertisement"}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                        {capitalizeFirst(ad.title || "Sponsored Advertisement")}
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-300">
                        Sponsored by{" "}
                        <span className="font-medium text-white">
                            {capitalizeFirst(ad?.advertiser)}
                        </span>
                    </p>

                    {/* CTA */}
                    <a
                        href={ad?.targetUrl}
                        onClick={recordClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                    inline-flex items-center justify-center
                    w-full
                    rounded-xl
                    bg-linear-to-r from-green-500 to-emerald-400
                    px-4 py-3
                    text-sm sm:text-base font-semibold text-black
                    transition
                    active:scale-[0.97]
                    sm:hover:scale-[1.02]
                    sm:hover:shadow-lg
                "
                    >
                        Visit Website
                    </a>
                </div>
            </motion.div>
        </AnimatePresence>

    );
}

export default AddOverlay;
