import { RoomStatusType } from '@/types';

interface StatusBadgeProps {
  status: RoomStatusType | OrderStatus | string;
  size?: 'sm' | 'md';
  type?: 'room' | 'order' | 'cleaning';
}

type OrderStatus = 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
type CleaningStatus = 'pending' | 'in_progress' | 'completed';

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  occupied: { bg: 'bg-sage-400/10', text: 'text-sage-500', dot: 'bg-sage-400', label: '已入住' },
  checkout: { bg: 'bg-coral-400/10', text: 'text-coral-500', dot: 'bg-coral-400', label: '今日退房' },
  available: { bg: 'bg-mist-400/10', text: 'text-mist-500', dot: 'bg-mist-400', label: '空房' },
  maintenance: { bg: 'bg-brick-400/10', text: 'text-brick-500', dot: 'bg-brick-400', label: '维修中' },
  
  pending: { bg: 'bg-bronze-400/10', text: 'text-bronze-600', dot: 'bg-bronze-400', label: '待入住' },
  checked_in: { bg: 'bg-sage-400/10', text: 'text-sage-500', dot: 'bg-sage-400', label: '已入住' },
  checked_out: { bg: 'bg-mist-400/10', text: 'text-mist-500', dot: 'bg-mist-400', label: '已退房' },
  cancelled: { bg: 'bg-brick-400/10', text: 'text-brick-500', dot: 'bg-brick-400', label: '已取消' },
  
  in_progress: { bg: 'bg-coral-400/10', text: 'text-coral-500', dot: 'bg-coral-400', label: '进行中' },
  completed: { bg: 'bg-sage-400/10', text: 'text-sage-500', dot: 'bg-sage-400', label: '已完成' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.available;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.text} font-medium ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
