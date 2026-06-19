import { create } from 'zustand';
import { Order, CleaningTask, MessageTemplate, Room } from '@/types';
import { orders as initialOrders } from '@/data/orders';
import { cleaningTasks as initialTasks } from '@/data/cleaning';
import { messageTemplates as initialTemplates } from '@/data/messages';
import { rooms as initialRooms } from '@/data/rooms';
import { formatDate, isSameDay, parseDate } from '@/utils/date';

const STORAGE_KEY = 'bnb-management-templates';

const loadTemplates = (): MessageTemplate[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage:', e);
  }
  return initialTemplates;
};

const saveTemplates = (templates: MessageTemplate[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
};

const DEFAULT_CHECK_OUT_TIME = '12:00';

const getCheckOutTimeFromOrder = (order: Order): string => {
  return DEFAULT_CHECK_OUT_TIME;
};

interface AppState {
  orders: Order[];
  rooms: Room[];
  cleaningTasks: CleaningTask[];
  messageTemplates: MessageTemplate[];

  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  checkInOrder: (orderId: string) => void;
  checkOutOrder: (orderId: string) => void;
  saveOrderEdit: (orderId: string, updates: Partial<Order>) => { success: boolean; error?: string };
  checkRoomConflict: (
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
    excludeOrderId?: string
  ) => boolean;

  updateCleaningTask: (taskId: string, updates: Partial<CleaningTask>) => void;
  addCleaningPhoto: (taskId: string, photoUrl: string) => void;
  createCleaningTask: (roomId: string, orderId: string, checkOutTime: string) => void;
  getTasksByCleaner: (cleanerId: string | undefined) => CleaningTask[];
  getCleanerStats: () => Record<string, { total: number; completed: number; inProgress: number; pending: number }>;

  useTemplate: (templateId: string) => void;
  addTemplate: (template: MessageTemplate) => void;
  updateTemplate: (template: MessageTemplate) => void;
  deleteTemplate: (templateId: string) => void;

  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByRoomAndDate: (roomId: string, date: string) => Order[];
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: initialOrders,
  rooms: initialRooms,
  cleaningTasks: initialTasks,
  messageTemplates: loadTemplates(),

  getOrderById: (orderId) => {
    return get().orders.find((o) => o.id === orderId);
  },

  getOrdersByRoomAndDate: (roomId, date) => {
    const targetDate = parseDate(date);
    return get().orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      if (o.roomId !== roomId) return false;
      const checkIn = parseDate(o.checkInDate);
      const checkOut = parseDate(o.checkOutDate);
      return targetDate >= checkIn && targetDate <= checkOut;
    });
  },

  checkRoomConflict: (roomId, checkInDate, checkOutDate, excludeOrderId) => {
    const { orders } = get();
    const newCheckIn = parseDate(checkInDate);
    const newCheckOut = parseDate(checkOutDate);

    return orders.some((o) => {
      if (excludeOrderId && o.id === excludeOrderId) return false;
      if (o.status === 'cancelled') return false;
      if (o.roomId !== roomId) return false;

      const existCheckIn = parseDate(o.checkInDate);
      const existCheckOut = parseDate(o.checkOutDate);

      const overlaps =
        (newCheckIn >= existCheckIn && newCheckIn < existCheckOut) ||
        (newCheckOut > existCheckIn && newCheckOut <= existCheckOut) ||
        (newCheckIn <= existCheckIn && newCheckOut >= existCheckOut);

      return overlaps;
    });
  },

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),

  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id ? order : o
      ),
    })),

  saveOrderEdit: (orderId, updates) => {
    const { orders, checkRoomConflict, cleaningTasks, rooms } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: '订单不存在' };

    const newRoomId = updates.roomId ?? order.roomId;
    const newCheckIn = updates.checkInDate ?? order.checkInDate;
    const newCheckOut = updates.checkOutDate ?? order.checkOutDate;

    if (checkRoomConflict(newRoomId, newCheckIn, newCheckOut, orderId)) {
      return { success: false, error: '该房间在所选日期已有预订，请更换房间或日期' };
    }

    const updatedOrder = { ...order, ...updates };

    const newCleaningTasks = cleaningTasks.map((t) => {
      if (t.orderId !== orderId) return t;
      const room = rooms.find((r) => r.id === newRoomId);
      const roomName = room ? `${room.name} ${room.type}` : t.roomName;
      return {
        ...t,
        roomId: newRoomId,
        roomName,
        checkOutTime: getCheckOutTimeFromOrder(updatedOrder),
      };
    });

    set({
      orders: orders.map((o) => (o.id === orderId ? updatedOrder : o)),
      cleaningTasks: newCleaningTasks,
    });

    return { success: true };
  },

  checkInOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'checked_in' as const } : o
      ),
    })),

  checkOutOrder: (orderId) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const room = state.rooms.find((r) => r.id === order.roomId);
      const roomName = room ? `${room.name} ${room.type}` : '未知房间';
      const checkOutTime = getCheckOutTimeFromOrder(order);

      const existingTask = state.cleaningTasks.find((t) => t.orderId === orderId);

      let newCleaningTasks = state.cleaningTasks;
      if (existingTask) {
        newCleaningTasks = state.cleaningTasks.map((t) =>
          t.id === existingTask.id
            ? { ...t, status: 'pending' as const, checkOutTime, photos: [] }
            : t
        );
      } else {
        const newTask: CleaningTask = {
          id: `task-${Date.now()}`,
          roomId: order.roomId,
          roomName,
          orderId: order.id,
          checkOutTime,
          status: 'pending',
          photos: [],
          estimatedDuration: 60,
          priority: 'normal',
        };
        newCleaningTasks = [...state.cleaningTasks, newTask];
      }

      return {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'checked_out' as const } : o
        ),
        cleaningTasks: newCleaningTasks,
      };
    }),

  updateCleaningTask: (taskId, updates) =>
    set((state) => ({
      cleaningTasks: state.cleaningTasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  addCleaningPhoto: (taskId, photoUrl) =>
    set((state) => ({
      cleaningTasks: state.cleaningTasks.map((t) =>
        t.id === taskId ? { ...t, photos: [...t.photos, photoUrl] } : t
      ),
    })),

  createCleaningTask: (roomId, orderId, checkOutTime) =>
    set((state) => {
      const room = state.rooms.find((r) => r.id === roomId);
      const roomName = room ? `${room.name} ${room.type}` : '未知房间';

      const newTask: CleaningTask = {
        id: `task-${Date.now()}`,
        roomId,
        roomName,
        orderId,
        checkOutTime,
        status: 'pending',
        photos: [],
        estimatedDuration: 60,
        priority: 'normal',
      };

      return {
        cleaningTasks: [...state.cleaningTasks, newTask],
      };
    }),

  getTasksByCleaner: (cleanerId) => {
    const { cleaningTasks } = get();
    return cleaningTasks.filter((t) => t.assignedTo === cleanerId);
  },

  getCleanerStats: () => {
    const { cleaningTasks } = get();
    const stats: Record<string, { total: number; completed: number; inProgress: number; pending: number }> = {};

    cleaningTasks.forEach((t) => {
      const id = t.assignedTo || 'unassigned';
      if (!stats[id]) {
        stats[id] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
      }
      stats[id].total++;
      if (t.status === 'completed') stats[id].completed++;
      else if (t.status === 'in_progress') stats[id].inProgress++;
      else stats[id].pending++;
    });

    return stats;
  },

  useTemplate: (templateId) =>
    set((state) => {
      const newTemplates = state.messageTemplates.map((t) =>
        t.id === templateId ? { ...t, useCount: t.useCount + 1 } : t
      );
      saveTemplates(newTemplates);
      return { messageTemplates: newTemplates };
    }),

  addTemplate: (template) =>
    set((state) => {
      const newTemplates = [...state.messageTemplates, template];
      saveTemplates(newTemplates);
      return { messageTemplates: newTemplates };
    }),

  updateTemplate: (template) =>
    set((state) => {
      const newTemplates = state.messageTemplates.map((t) =>
        t.id === template.id ? template : t
      );
      saveTemplates(newTemplates);
      return { messageTemplates: newTemplates };
    }),

  deleteTemplate: (templateId) =>
    set((state) => {
      const newTemplates = state.messageTemplates.filter((t) => t.id !== templateId);
      saveTemplates(newTemplates);
      return { messageTemplates: newTemplates };
    }),
}));
