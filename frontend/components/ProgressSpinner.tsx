import { div } from "framer-motion/client";

interface ProgressSpinnerProps {
  value?: number;
  text?: string;
  size?: number;
  stroke?: number;
}

export default function ProgressSpinner({
  value = 0,
  text = "Uploading...",
  size = 140,
  stroke = 10,
}: ProgressSpinnerProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`absolute inset-0 bg-black/50 border-2 flex items-center justify-center ${value >= 100 || value <= 0 ? 'hidden' : ''}`}>
      <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="fill-none stroke-indigo-500 transition-all duration-300 ease-out stroke-linecap-round"
        />
      </svg>

      <div className="absolute text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {text}
        </div>
      </div>
    </div>
    </div>
  );
}
