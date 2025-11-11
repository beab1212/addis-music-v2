export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


export function getLowResCloudinaryUrl(url: string, options?: { width?: number; height?: number; blur?: number; quality?: number }) {
  if (!url.includes('/upload/')) {
    console.warn('Not a valid Cloudinary URL.');
    return url;
  }

  const width = options?.width || 100;
  const height = options?.height;
  const blur = options?.blur || 0;
  const quality = options?.quality !== undefined ? options.quality : 20;

  // Build transformation string
  const transformations = [
    `w_${width}`,
    height ? `h_${height}` : '',
    'f_auto',
    `q_${typeof quality === 'number' ? quality : 'auto'}`,
    blur > 0 ? `e_blur:${blur}` : '',
  ]
    .filter(Boolean)
    .join(',');

  // Inject transformation string into the URL
  return url.replace('/upload/', `/upload/${transformations}/`);
}


export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getColorFromImage = (imageUrl: string): string => {
  const colors = [
    'from-orange-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-teal-500',
    'from-red-500 to-orange-500',
    'from-yellow-500 to-orange-500',
  ];
  const hash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
