import { create } from 'zustand';
import type { Manager } from './manager.types';
import * as managerService from '../api/managerService.ts';

interface ManagersState {
  managers: Manager[];
  loading: boolean;
  fetchManagers: () => Promise<void>;
  addManager: (data: Omit<Manager, 'id'>) => Promise<Manager>;
  editManager: (id: number, data: Partial<Omit<Manager, 'id'>>) => Promise<Manager>;
  removeManager: (id: number) => Promise<void>;
}

export const useManagersStore = create<ManagersState>()((set) => ({
  managers: [],
  loading: false,

  fetchManagers: async () => {
    set({ loading: true });
    const managers = await managerService.getManagers();
    set({ managers, loading: false });
  },

  addManager: async (data) => {
    const manager = await managerService.createManager(data);
    return manager;
  },

  editManager: async (id, data) => {
    const manager = await managerService.updateManager(id, data);
    return manager;
  },

  removeManager: async (id) => {
    await managerService.deleteManager(id);
  },
}));