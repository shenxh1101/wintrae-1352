export interface Room {
  id: string;
  name: string;
  type: string;
  floor: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  bedType: string;
  area: number;
}

export type OrderStatus = 'pending' | 'checked_in' | 'checked_out' | 'cancelled';

export interface Order {
  id: string;
  orderNo: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestIdNo: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  price: number;
  deposit: number;
  channel: string;
  status: OrderStatus;
  specialRequirements?: string;
  invoiceRemark?: string;
  createdAt: string;
  guestCount: number;
}

export type CleaningStatus = 'pending' | 'in_progress' | 'completed';

export interface CleaningTask {
  id: string;
  roomId: string;
  roomName: string;
  orderId: string;
  checkOutTime: string;
  assignedTo?: string;
  status: CleaningStatus;
  photos: string[];
  remark?: string;
  estimatedDuration: number;
  completedAt?: string;
  priority: 'normal' | 'urgent';
}

export interface Cleaner {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  taskCount: number;
  todayCompleted: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  useCount: number;
  variables: string[];
  createdAt: string;
}

export interface DailyStats {
  date: string;
  occupancyRate: number;
  avgPrice: number;
  revenue: number;
  orderCount: number;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export type RoomStatusType = 'pending' | 'occupied' | 'checkout' | 'available' | 'maintenance';

export interface CalendarCellData {
  roomId: string;
  date: string;
  status: RoomStatusType;
  orderId?: string;
  guestName?: string;
  nights?: number;
}
