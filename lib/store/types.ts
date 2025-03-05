import { Profile } from './models/profile';
import { Task } from './models/task';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error?: string | null;
}

export interface CacheState {
  tasks: CacheEntry<Task[]>;
  profile: CacheEntry<Profile | null>;
}

export interface StoreState extends CacheState {
  loading: {
    tasks: boolean;
    profile: boolean;
  };
  error: {
    tasks: string | null;
    profile: string | null;
  };
}

export type StoreAction =
  | { type: 'SET_LOADING'; resource: keyof CacheState; value: boolean }
  | { type: 'SET_ERROR'; resource: keyof CacheState; error: string | null }
  | { type: 'SET_DATA'; resource: keyof CacheState; data: any }
  | { type: 'CLEAR_CACHE' };

export interface StoreContextType extends StoreState {
  dispatch: React.Dispatch<StoreAction>;
  invalidateCache: (resource: keyof CacheState) => void;
  refreshData: (resource: keyof CacheState) => Promise<void>;
}
