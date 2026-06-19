import { create } from 'zustand';
import { Order, CleaningTask, MessageTemplate, Room } from '@/types';
import { orders as initialOrders } from '@/data/orders';
import { cleaningTasks as initialTasks } from '@/data/cleaning';
import { messageTemplates as initialTemplates } from '@/data/messages';
import { rooms as initialRooms } from '@/data/rooms';
import { formatDate, isSameDay, parseDate } from '@/utils/date';

const STORAGE_KEY_TEMPLATES = 'bnb-management-templates';
const STORAGE_KEY_ORDERS = 'bnb-management-orders';
const STORAGE_KEY_TASKS = 'bnb-management-tasks';

const loadTemplates = (): MessageTemplate[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
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
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
};

const loadOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage:', e);
  }
  return initialOrders;
};

const saveOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage:', e);
  }
};

const loadTasks = (): CleaningTask[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
  }
  return initialTasks;
};

const saveTasks = (tasks: CleaningTask[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
};

const DEFAULT_CHECK_OUT_TIME = '12:00';

const isValidDateRange = (checkInDate: string, checkOutDate: string): boolean => {
  return parseDate(checkOutDate) > parseDate(checkInDate);
};

const getCheckOutTimeFromOrder = (order: Order): string => {
  return DEFAULT_CHECK_OUT_TIME;
};

const estimateDurationByRoom = (room?: Room): number => {
  if (!room) return 60;
  const area = room.area || 25;
  if (area >= 50) return 120;
  if (area >= 40) return 90;
  if (area >= 30) return 75;
  return 60;
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
  orders: loadOrders(),
  rooms: initialRooms,
  cleaningTasks: loadTasks(),
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
    set((state) => {
      const newOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      saveOrders(newOrders);
      return { orders: newOrders };
    }),

  addOrder: (order) =>
    set((state) => {
      const newOrders = [...state.orders, order];
      saveOrders(newOrders);
      return { orders: newOrders };
    }),

  updateOrder: (order) =>
    set((state) => {
      const newOrders = state.orders.map((o) =>
        o.id === order.id ? order : o
      );
      saveOrders(newOrders);
      return { orders: newOrders };
    }),

  saveOrderEdit: (orderId, updates) => {
    const { orders, checkRoomConflict, cleaningTasks, rooms } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: '订单不存在' };

    const newRoomId = updates.roomId ?? order.roomId;
    const newCheckIn = updates.checkInDate ?? order.checkInDate;
    const newCheckOut = updates.checkOutDate ?? order.checkOutDate;

    if (!isValidDateRange(newCheckIn, newCheckOut)) {
      return { success: false, error: '退房日期必须晚于入住日期' };
    }

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
        guestName: updatedOrder.guestName,
        checkOutDate: updatedOrder.checkOutDate,
        checkOutTime: getCheckOutTimeFromOrder(updatedOrder),
        estimatedDuration: estimateDurationByRoom(room),
      };
    });

    const newOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    saveOrders(newOrders);
    saveTasks(newCleaningTasks);

    set({
      orders: newOrders,
      cleaningTasks: newCleaningTasks,
    });

    return { success: true };
  },

  checkInOrder: (orderId) =>
    set((state) => {
      const newOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'checked_in' as const } : o
      );
      saveOrders(newOrders);
      return { orders: newOrders };
    }),

  checkOutOrder: (orderId) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const room = state.rooms.find((r) => r.id === order.roomId);
      const roomName = room ? `${room.name} ${room.type}` : '未知房间';
      const checkOutTime = getCheckOutTimeFromOrder(order);
      const estimatedDuration = estimateDurationByRoom(room);

      const existingTask = state.cleaningTasks.find((t) => t.orderId === orderId);

      let newCleaningTasks = state.cleaningTasks;
      if (existingTask) {
        newCleaningTasks = state.cleaningTasks.map((t) =>
          t.id === existingTask.id
            ? {
                ...t,
                status: 'pending' as const,
                roomId: order.roomId,
                roomName,
                guestName: order.guestName,
                checkOutDate: order.checkOutDate,
                checkOutTime,
                estimatedDuration,
                photos: [],
              }
            : t
        );
      } else {
        const newTask: CleaningTask = {
          id: `task-${Date.now()}`,
          roomId: order.roomId,
          roomName,
          orderId: order.id,
          guestName: order.guestName,
          checkOutDate: order.checkOutDate,
          checkOutTime,
          status: 'pending',
          photos: [],
          estimatedDuration,
          priority: 'normal',
        };
        newCleaningTasks = [...state.cleaningTasks, newTask];
      }

      const newOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'checked_out' as const } : o
      );
      saveOrders(newOrders);
      saveTasks(newCleaningTasks);

      return {
        orders: newOrders,
        cleaningTasks: newCleaningTasks,
      };
    }),

  updateCleaningTask: (taskId, updates) =>
    set((state) => {
      const newTasks = state.cleaningTasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      saveTasks(newTasks);
      return { cleaningTasks: newTasks };
    }),

  addCleaningPhoto: (taskId, photoUrl) =>
    set((state) => {
      const newTasks = state.cleaningTasks.map((t) =>
        t.id === taskId ? { ...t, photos: [...t.photos, photoUrl] } : t
      );
      saveTasks(newTasks);
      return { cleaningTasks: newTasks };
    }),

  createCleaningTask: (roomId, orderId, checkOutTime) =>
    set((state) => {
      const room = state.rooms.find((r) => r.id === roomId);
      const roomName = room ? `${room.name} ${room.type}` : '未知房间';
      const order = state.orders.find((o) => o.id === orderId);

      const newTask: CleaningTask = {
        id: `task-${Date.now()}`,
        roomId,
        roomName,
        orderId,
        guestName: order?.guestName,
        checkOutDate: order?.checkOutDate || formatDate(new Date()),
        checkOutTime,
        status: 'pending',
        photos: [],
        estimatedDuration: estimateDurationByRoom(room),
        priority: 'normal',
      };

      const newTasks = [...state.cleaningTasks, newTask];
      saveTasks(newTasks);
      return {
        cleaningTasks: newTasks,
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
