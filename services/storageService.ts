import { STORAGE_KEYS } from '../constants';
import { AppItem, SyncQueueItem, SheetName } from '../types';

export const getLocalCollection = <T extends AppItem>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading local data for ${key}`, e);
    return [];
  }
};

export const saveLocalCollection = (key: string, data: AppItem[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving local data for ${key}`, e);
  }
};

export const updateLocalItem = <T extends AppItem>(key: string, updatedItem: T) => {
  const collection = getLocalCollection<T>(key);
  const index = collection.findIndex(i => i.id === updatedItem.id);
  
  if (index !== -1) {
    collection[index] = updatedItem;
    saveLocalCollection(key, collection);
    return collection;
  }
  return collection;
};

export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const queue = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    return [];
  }
};

export const addToSyncQueue = (item: SyncQueueItem) => {
  const queue = getSyncQueue();
  // If updating, remove previous pending actions for this ID to avoid redundancy
  const filteredQueue = queue.filter(q => q.id !== item.id);
  filteredQueue.push(item);
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filteredQueue));
};

export const clearSyncQueue = () => {
  localStorage.removeItem(STORAGE_KEYS.QUEUE);
};

export const removeFromQueue = (id: string) => {
    const queue = getSyncQueue();
    const newQueue = queue.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(newQueue));
}