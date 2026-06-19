import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'wood' | 'sage' | 'coral' | 'bronze' | 'mist';
  suffix?: string;
}

const colorClasses = {
  wood: 'from-wood-400 to-wood-600',
  sage: 'from-sage-400 to-sage-600',
  coral: 'from-coral-400 to-coral-600',
  bronze: 'from-bronze-400 to-bronze-600',
  mist: 'from-mist-400 to-mist-600',
};

export default function DataCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'wood',
  suffix,
}: DataCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="card p-5 card-hover relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm text-wood-500 font-medium">{title}</p>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white shadow-md`}>
              {icon}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-3xl font-serif font-bold text-wood-800 tracking-tight">
            {value}
            {suffix && <span className="text-base font-normal text-wood-400 ml-1">{suffix}</span>}
          </p>
        </div>

        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-sage-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-brick-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-sage-500' : 'text-brick-500'}`}>
              {isPositive ? '+' : ''}{(trend * 100).toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-wood-400">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
