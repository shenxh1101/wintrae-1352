import { create } from 'zustand';
import { Order, CleaningTask, MessageTemplate, Room } from '@/types';
import { orders as initialOrders } from '@/data/orders';
import { cleaningTasks as initialTasks } from '@/data/cleaning';
import { messageTemplates as initialTemplates } from '@/data/messages';
import { rooms as initialRooms } from '@/data/rooms';
import { formatDate } from '@/utils/date';

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
  
  updateCleaningTask: (taskId: string, updates: Partial<CleaningTask>) => void;
  addCleaningPhoto: (taskId: string, photoUrl: string) => void;
  createCleaningTask: (roomId: string, orderId: string, checkOutTime: string) => void;
  
  useTemplate: (templateId: string) => void;
  addTemplate: (template: MessageTemplate) => void;
  updateTemplate: (template: MessageTemplate) => void;
  deleteTemplate: (templateId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: initialOrders,
  rooms: initialRooms,
  cleaningTasks: initialTasks,
  messageTemplates: loadTemplates(),
  
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
      
      const newTask: CleaningTask = {
        id: `task-${Date.now()}`,
        roomId: order.roomId,
        roomName,
        orderId: order.id,
        checkOutTime: order.checkInTime || '12:00',
        status: 'pending',
        photos: [],
        estimatedDuration: 60,
        priority: 'normal',
      };
      
      return {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'checked_out' as const } : o
        ),
        cleaningTasks: [...state.cleaningTasks, newTask],
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
