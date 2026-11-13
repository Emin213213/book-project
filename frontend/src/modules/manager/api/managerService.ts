import type { Manager } from '../model/manager.types';
import initialManagers from './managers.json';

let managers: Manager[] = [...initialManagers] as Manager[];
let nextId = Math.max(...managers.map(m => m.id)) + 1;

export async function getManagers(): Promise<Manager[]> {
  return [...managers];
}

export async function getManagerById(id: number): Promise<Manager | undefined> {
  return managers.find(m => m.id === id);
}

export async function createManager(data: Omit<Manager, 'id'>): Promise<Manager> {
  const manager: Manager = { ...data, id: nextId++ };
  managers.push(manager);
  return manager;
}

export async function updateManager(id: number, data: Partial<Omit<Manager, 'id'>>): Promise<Manager> {
  const idx = managers.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Manager not found');
  managers[idx] = { ...managers[idx], ...data };
  return managers[idx];
}

export async function deleteManager(id: number): Promise<void> {
  managers = managers.filter(m => m.id !== id);
}