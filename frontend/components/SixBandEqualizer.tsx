'use client';
import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";

type Band = {
    name: string;
    frequency: number;
    type: BiquadFilterType;
    displayFreq: string;
};

const bands: Band[] = [
    { name: "Bass", frequency: 60, type: "lowshelf", displayFreq: "60Hz" },
    { name: "Low-Mid", frequency: 250, type: "peaking", displayFreq: "250Hz" },
    { name: "Mid", frequency: 500, type: "peaking", displayFreq: "500Hz" },
    { name: "High-Mid", frequency: 2000, type: "peaking", displayFreq: "2kHz" },
    { name: "Presence", frequency: 4000, type: "peaking", displayFreq: "4kHz" },
    { name: "Treble", frequency: 8000, type: "highshelf", displayFreq: "8kHz" },
];

export default function ModernEqualizer() {
    const audioElement = usePlayerStore((state) => state.audioRef);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filterRefs = useRef<BiquadFilterNode[]>([]);
    const [gains, setGains] = useState<number[]>(new Array(bands.length).fill(0));

    useEffect(() => {
        if (!audioElement) return;

        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaElementSource(audioElement);
        sourceRef.current = source;

        const filters = bands.map((band) => {
            const f = audioCtx.createBiquadFilter();
            f.type = band.type;
            f.frequency.value = band.frequency;
            f.Q.value = 1; // Reasonable default Q for peaking filters
            f.gain.value = 0;
            return f;
        });

        filterRefs.current = filters;

        // Connect: source -> filter0 -> filter1 -> ... -> destination
        source.connect(filters[0]);
        for (let i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i + 1]);
        }
        filters[filters.length - 1].connect(audioCtx.destination);

        // Cleanup on unmount
        return () => {
            filters.forEach((f) => f.disconnect());
            source.disconnect();
            audioCtx.close().catch(() => {});
        };
    }, [audioElement]);

    const handleGainChange = (idx: number, value: number) => {
        setGains((prev) => {
            const newGains = [...prev];
            newGains[idx] = value;
            return newGains;
        });

        if (filterRefs.current[idx]) {
            filterRefs.current[idx].gain.value = value;
        }
    };

    const getBarHeight = (gain: number) => (Math.abs(gain) / 15) * 100;

    const getBarColor = (gain: number) => {
        if (gain > 8) return "from-emerald-400 to-cyan-400";
        if (gain > 3) return "from-blue-400 to-indigo-400";
        if (gain > 0) return "from-purple-400 to-pink-400";
        if (gain < -8) return "from-red-500 to-orange-500";
        if (gain < -3) return "from-amber-500 to-yellow-400";
        return "from-gray-500 to-gray-400";
    };

    return (
        <div className="relative min-h-fit bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-8 overflow-hidden">
            {/* Background glow orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            </div>

            <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 w-full max-w-7xl">
                <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    Equalizer
                </h2>

                {/* Equalizer bands */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 items-end">
                    {bands.map((band, idx) => {
                        const gain = gains[idx];
                        const heightPercent = getBarHeight(gain);

                        return (
                            <div key={band.name} className="flex flex-col items-center space-y-4">
                                <span className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">
                                    {band.displayFreq}
                                </span>

                                <div className="relative h-32 sm:h-40 md:h-48 w-10 sm:w-12 md:w-14 rounded-full overflow-hidden bg-gray-800/60 border border-white/10">
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out rounded-full bg-gradient-to-t ${getBarColor(
                                            gain
                                        )} shadow-xl`}
                                        style={{
                                            height: `${heightPercent}%`,
                                            boxShadow: gain !== 0 ? "0 0 20px rgba(255,255,255,0.3)" : "none",
                                        }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-xs font-extrabold text-white/90 drop-shadow-md bg-black/20 px-2 py-1 rounded">
                                            {gain > 0 ? "+" : ""}{gain.toFixed(1)}
                                        </span>
                                    </div>

                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/30" />
                                </div>

                                {/* Vertical Slider (rotated) */}
                                <input
                                    type="range"
                                    min="-15"
                                    max="15"
                                    step="0.5"
                                    value={gain}
                                    onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                                    className="sm:mb-32 mb-20 w-40 sm:w-48 md:w-56 h-2 rotate-[-90deg] origin-center translate-y-8 cursor-grab active:cursor-grabbing appearance-none rounded-full bg-gray-700/60 backdrop-blur-sm shadow-inner"
                                    style={{
                                        background: `linear-gradient(to right, 
                                            #f87171 0%, 
                                            #fb923c ${Math.max(0, ((gain + 15) / 30 * 100) - 10)}%, 
                                            #fbbf24  ${((gain + 15) / 30 * 100)}%, 
                                            #a78bfa ${((gain + 15) / 30 * 100)}%, 
                                            #22d3ee 100%)`,
                                    }}
                                />

                                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-8">{band.name}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Reset button */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => {
                            setGains(new Array(bands.length).fill(0));
                            filterRefs.current.forEach((f) => (f.gain.value = 0));
                        }}
                        className="px-6 py-3 rounded-full bg-white/5 backdrop-blur border border-white/10 text-sm font-medium dark:text-gray-300 hover:bg-white/10 transition-all duration-300"
                    >
                        Reset All
                    </button>
                </div>
            </div>
        </div>
    );
}