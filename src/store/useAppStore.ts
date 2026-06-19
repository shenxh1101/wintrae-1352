import { create } from 'zustand';
import { Order, CleaningTask, MessageTemplate, Room } from '@/types';
import { orders as initialOrders } from '@/data/orders';
import { cleaningTasks as initialTasks } from '@/data/cleaning';
import { messageTemplates as initialTemplates } from '@/data/messages';
import { rooms as initialRooms } from '@/data/rooms';

interface AppState {
  orders: Order[];
  rooms: Room[];
  cleaningTasks: CleaningTask[];
  messageTemplates: MessageTemplate[];
  
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  
  updateCleaningTask: (taskId: string, updates: Partial<CleaningTask>) => void;
  addCleaningPhoto: (taskId: string, photoUrl: string) => void;
  
  useTemplate: (templateId: string) => void;
  addTemplate: (template: MessageTemplate) => void;
  updateTemplate: (template: MessageTemplate) => void;
  deleteTemplate: (templateId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  orders: initialOrders,
  rooms: initialRooms,
  cleaningTasks: initialTasks,
  messageTemplates: initialTemplates,
  
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
  
  useTemplate: (templateId) =>
    set((state) => ({
      messageTemplates: state.messageTemplates.map((t) =>
        t.id === templateId ? { ...t, useCount: t.useCount + 1 } : t
      ),
    })),
  
  addTemplate: (template) =>
    set((state) => ({
      messageTemplates: [...state.messageTemplates, template],
    })),
  
  updateTemplate: (template) =>
    set((state) => ({
      messageTemplates: state.messageTemplates.map((t) =>
        t.id === template.id ? template : t
      ),
    })),
  
  deleteTemplate: (templateId) =>
    set((state) => ({
      messageTemplates: state.messageTemplates.filter((t) => t.id !== templateId),
    })),
}));
