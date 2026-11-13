import type { Supplier } from '../model/supplier.types';
import initialSuppliers from './suppliers.json';

let suppliers: Supplier[] = [...initialSuppliers];
let nextId = Math.max(...suppliers.map(s => s.id)) + 1;

export async function getSuppliers(): Promise<Supplier[]> {
  return [...suppliers];
}

export async function getSupplierById(id: number): Promise<Supplier | undefined> {
  return suppliers.find(s => s.id === id);
}

export async function createSupplier(data: Omit<Supplier, 'id'>): Promise<Supplier> {
  const supplier: Supplier = { ...data, id: nextId++ };
  suppliers.push(supplier);
  return supplier;
}

export async function updateSupplier(id: number, data: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
  const idx = suppliers.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Not found');
  suppliers[idx] = { ...suppliers[idx], ...data };
  return suppliers[idx];
}

export async function deleteSupplier(id: number): Promise<void> {
  suppliers = suppliers.filter(s => s.id !== id);
}