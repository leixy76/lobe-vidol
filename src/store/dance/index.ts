import { StateCreator } from 'zustand';
import { PersistOptions, createJSONStorage, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import storage from '@/utils/storage';

import { DanceListStore, createDanceStore } from './slices/dancelist';
import { PlayListStore, createPlayListStore } from './slices/playlist';

export type DanceStore = DanceListStore & PlayListStore;

export const DANCE_STORAGE_KEY = 'vidol-chat-dance-storage';

const createStore: StateCreator<DanceStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...createDanceStore(...parameters),
  ...createPlayListStore(...parameters),
});

const persistOptions: PersistOptions<DanceStore> = {
  name: DANCE_STORAGE_KEY, // name of the item in the storage (must be unique)
  storage: createJSONStorage(() => storage),
  version: 0,
};

export const useDanceStore = createWithEqualityFn<DanceStore>()(
  persist(
    devtools(createStore, {
      name: 'VIDOL_DANCE_STORE',
    }),
    persistOptions,
  ),
  shallow,
);

export { danceListSelectors } from './selectors/dancelist';
