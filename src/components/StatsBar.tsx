import { MapPin, CheckCircle, Star, ThumbsUp } from 'lucide-react';
import type { Restaurant } from '../lib/types';

interface StatsBarProps {
  restaurants: Restaurant[];
}

export default function StatsBar({ restaurants }: StatsBarProps) {
  const totalLocations = restaurants.length;
  const workingLocations = restaurants.filter(r => r.toilet_status === 'working').length;
  const freeLocations = restaurants.filter(r => r.amenities?.free).length;
  const verifiedLocations = restaurants.filter(r => r.verified).length;

  const stats = [
    { icon: <MapPin className="w-3.5 h-3.5" />, value: totalLocations, label: 'Total', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: <CheckCircle className="w-3.5 h-3.5" />, value: workingLocations, label: 'Open', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: <Star className="w-3.5 h-3.5" />, value: freeLocations, label: 'Free', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { icon: <ThumbsUp className="w-3.5 h-3.5" />, value: verifiedLocations, label: 'Verified', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-2.5 py-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map((stat, index) => (
          <div key={index} className={`flex flex-col items-center p-1.5 rounded-lg ${stat.bgColor}`}>
            <div className={`${stat.color} mb-0.5`}>{stat.icon}</div>
            <span className={`font-bold text-sm ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
