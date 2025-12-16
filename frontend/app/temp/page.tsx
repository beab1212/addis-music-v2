// "use client"; // for Next.js 13+ app directory

// import { useEffect, useRef } from "react";
// import Hls from "hls.js";

// interface HlsPlayerProps {
//   url: string; // URL to your master.m3u8
// }

// const HlsPlayer: React.FC<HlsPlayerProps> = ({ url }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (!videoRef.current) return;

//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(url);
//       hls.attachMedia(videoRef.current);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         videoRef.current?.play();
//       });

//       // Cleanup on unmount
//       return () => {
//         hls.destroy();
//       };
//     } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//       // Safari fallback
//       videoRef.current.src = url;
//       videoRef.current.addEventListener("loadedmetadata", () => {
//         videoRef.current?.play();
//       });
//     }
//   }, [url]);

//   return <video ref={videoRef} controls width="640" height="360" />;
// };


// export default function Page() {
//   const hlsUrl = "http://localhost:5000/stream/a80bbca2-e7ae-444e-b692-ef21ee32dad1/master.m3u8";

//   return (
//     <div>
//       <h1>HLS Player</h1>
//       <HlsPlayer url={hlsUrl} />
//     </div>
//   );
// }



// 'use client';

// import { MiniPlayer } from "@/components/MiniPlayer";
// import { HLSPlayer } from "@/components/HLSPlayer";
// import { usePlayerStore } from "@/store/playerStore";


// export default function TempPage() {
//   const { setCurrentSong, setQueue } = usePlayerStore();


//   return (
//     <div className="container mx-auto px-4 py-8">
//       <HLSPlayer />
//       <h1 className="text-3xl font-bold mb-6">Temporary Page with Mini Player</h1>

//       <input type="range" name="" id="" min={0} max={100} />

//       <button
//         onClick={() => {
//           setCurrentSong({
//             id: 'song-1',
//             title: 'Neon Dreams',
//             artist: 'Nova Waves',
//             artistId: 'artist-1',
//             albumId: 'album-1',
//             album: 'Digital Horizons',
//             duration: 245,
//             coverUrl: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800',
//             audioUrl: '',
//             genre: 'Electronic',
//             releaseDate: '2024-03-15',
//             plays: 3500000,
//           });
//           setQueue([]);
//         }}
//         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//       >
//         Play Sample Song
//       </button>
//       <MiniPlayer />
//     </div>
//   );
// }









// 'use client';

// import React, { useState, useRef, useEffect } from "react";
// import { X } from "lucide-react";

// function SearchSelect({
//   label,
//   query,
//   setQuery,
//   options = [],                // ← default to empty array
//   onSelect,
//   selected,
//   fieldName,
//   placeholder = "Search...",
//   className = "",
// }: any) {
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Close when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Focus input when dropdown opens
//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   // Safely convert options to array + filter
//   const safeOptions = Array.isArray(options) ? options : [];
  
//   const filteredOptions = safeOptions.filter((opt) =>
//     opt[fieldName]?.toString().toLowerCase().includes(query.toLowerCase())
//   );

//   const handleSelect = (opt: any) => {
//     onSelect(opt);
//     setQuery(opt[fieldName]?.toString() || "");
//     setIsOpen(false);
//   };

//   const handleClear = () => {
//     onSelect(null);
//     setQuery("");
//     inputRef.current?.focus();
//   };

//   const displayValue = selected ? selected[fieldName] : query;

//   return (
//     <div className={`relative w-full ${className}`} ref={containerRef}>
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           {label}
//         </label>
//       )}

//       <div
//         className={`
//           relative flex items-center w-full px-3 py-2 
//           border rounded-lg shadow-sm bg-white dark:bg-gray-900
//           border-gray-300 dark:border-gray-700
//           focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
//           transition-all ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
//         `}
//         onClick={() => setIsOpen(true)}
//       >
//         <input
//           ref={inputRef}
//           type="text"
//           value={displayValue ?? ""}
//           onChange={(e) => setQuery(e.target.value)}
//           onFocus={() => setIsOpen(true)}
//           placeholder={selected ? "" : placeholder}
//           className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
//         />

//         {selected && (
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleClear();
//             }}
//             className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         )}

//         <div className="ml-2 text-gray-400 pointer-events-none">
//           <svg
//             className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>
//       </div>

//       {/* Dropdown */}
//       {isOpen && (
//         <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
//           {filteredOptions.length === 0 ? (
//             <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
//               {query ? "No results found" : "Start typing to search"}
//             </div>
//           ) : (
//             <ul>
//               {filteredOptions.map((opt) => (
//                 <li
//                   key={opt.id}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleSelect(opt);
//                   }}
//                   className={`
//                     px-4 py-2 cursor-pointer text-sm
//                     hover:bg-gray-100 dark:hover:bg-gray-700
//                     ${selected?.id === opt.id 
//                       ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
//                       : "text-gray-900 dark:text-gray-100"}
//                   `}
//                 >
//                   {opt[fieldName]}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }





// import { useCallback } from "react";
// import { api } from "@/lib/api";


// const App = () => {
//   const [query, setQuery] = useState("");
//   const [selected, setSelected] = useState<any>(null);
//   const [options, setOptions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Debounced fetch using useRef + useEffect (no lodash!)
//   const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const fetchTracks = useCallback(async (searchQuery: string) => {
//     if (!searchQuery.trim()) {
//       setOptions([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await api.get(`/tracks?q=${encodeURIComponent(searchQuery)}`);
//       // Adjust based on your actual API response
//       const tracks = response.data?.data?.tracks || response.data || [];
//       console.log("New Data: ", tracks);
      
//       setOptions(tracks);
//     } catch (err: any) {
//       console.error("Failed to fetch tracks:", err);
//       setError(err.message || "Failed to load tracks");
//       setOptions([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Debounced search
//   useEffect(() => {
//     // Clear previous timeout
//     if (debounceTimeoutRef.current) {
//       clearTimeout(debounceTimeoutRef.current);
//     }

//     // Set new timeout
//     debounceTimeoutRef.current = setTimeout(() => {
//       fetchTracks(query);
//     }, 300);

//     // Cleanup on unmount or query change
//     return () => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//     };
//   }, [query, fetchTracks]);

//   const handleSelect = (option: any | null) => {
//     setSelected(option);
//     if (option) {
//       setQuery(option.name); // Keep the selected name visible
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
//           Search Tracks
//         </h1>

//         <SearchSelect
//           label="Find a track"
//           query={query}
//           setQuery={setQuery}
//           options={options}
//           onSelect={handleSelect}
//           selected={selected}
//           fieldName="title"
//           placeholder={loading ? "Searching tracks..." : "Type to search..."}
//         />

//         {/* Optional: Show loading/error below input */}
//         {loading && (
//           <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
//             Searching...
//           </p>
//         )}
//         {error && (
//           <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
//         )}

//         {/* Selected Track Preview */}
//         {selected && (
//           <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
//             <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//               Selected Track
//             </h2>
//             <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
//               {selected.name}
//             </p>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//               ID: {selected.id}
//             </p>
//             <button
//               onClick={() => {
//                 setSelected(null);
//                 setQuery("");
//               }}
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//             >
//               Clear Selection
//             </button>
//           </div>
//         )}

//         {/* Empty state when nothing searched yet */}
//         {!selected && !loading && query === "" && (
//           <div className="mt-10 text-center text-gray-500 dark:text-gray-400">
//             <p>Start typing to search for tracks</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;
















'use client';
import { api } from "@/lib/api";
import { use, useEffect, useState } from "react";

export default function TempPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/personalization/for-you');
        setData(response.data);
        console.log("Fetched data:", response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Temporary Page</h1>
      <p>This is a temporary page for testing and development purposes.</p>
    </div>
  );
}