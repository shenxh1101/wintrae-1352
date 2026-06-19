import { DailyStats, ChannelData } from '@/types';
import { formatDate, addDays } from '@/utils/date';

const today = new Date();

export const generateDailyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);
    const baseOccupancy = 0.65 + Math.sin(i / 5) * 0.15;
    const weekendFactor = (date.getDay() === 0 || date.getDay() === 6) ? 0.15 : 0;
    const occupancyRate = Math.min(0.95, Math.max(0.3, baseOccupancy + weekendFactor + (Math.random() - 0.5) * 0.1));
    
    const basePrice = 450;
    const priceVariation = (Math.random() - 0.3) * 80;
    const avgPrice = basePrice + priceVariation + weekendFactor * 100;
    
    const roomCount = 8;
    const orderCount = Math.round(roomCount * occupancyRate);
    const revenue = orderCount * avgPrice;
    
    stats.push({
      date: formatDate(date),
      occupancyRate: Math.round(occupancyRate * 1000) / 1000,
      avgPrice: Math.round(avgPrice),
      revenue: Math.round(revenue),
      orderCount,
    });
  }
  
  return stats;
};

export const channelData: ChannelData[] = [
  { name: '携程', value: 35, color: '#7CB342' },
  { name: '美团', value: 28, color: '#FF8A65' },
  { name: '飞猪', value: 18, color: '#C9A961' },
  { name: 'Booking', value: 12, color: '#8B6914' },
  { name: '其他', value: 7, color: '#B0BEC5' },
];

export const monthlyData = [
  { month: '1月', revenue: 85200, occupancyRate: 0.58, avgPrice: 420 },
  { month: '2月', revenue: 102400, occupancyRate: 0.72, avgPrice: 460 },
  { month: '3月', revenue: 95600, occupancyRate: 0.65, avgPrice: 445 },
  { month: '4月', revenue: 108900, occupancyRate: 0.74, avgPrice: 470 },
  { month: '5月', revenue: 125600, occupancyRate: 0.82, avgPrice: 495 },
  { month: '6月', revenue: 118700, occupancyRate: 0.78, avgPrice: 485 },
];

export const summaryStats = {
  todayOccupancy: 0.75,
  todayRevenue: 3280,
  todayOrders: 6,
  avgPrice: 437,
  monthRevenue: 118700,
  monthOrders: 248,
  monthOccupancy: 0.78,
  revenueTrend: 0.12,
  occupancyTrend: 0.05,
};
