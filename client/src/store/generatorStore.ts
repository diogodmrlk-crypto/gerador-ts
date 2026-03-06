import { create } from 'zustand';

export interface GeneratedKey {
  id: string;
  key: string;
  type: string;
  expire: number;
  used: boolean;
  device: string;
  createdAt: number;
  activatedAt: number;
  expiresAt: number;
  _pkg?: string;
  _pkgId?: string;
}

export interface Package {
  id: string;
  name: string;
  url: string;
  desc: string;
  enabled: boolean;
  sent: number;
}

interface GeneratorState {
  // Keys
  generatedKeys: GeneratedKey[];
  apiKeys: GeneratedKey[];
  deletedIds: Set<string>;
  selectedIds: Set<string>;

  // Packages
  packages: Package[];

  // Limit
  limitCount: number;
  chartData: Record<string, number>;

  // Sessions
  clearedSessionDevices: Set<string>;
  currentLang: string;

  // Actions
  addGeneratedKey: (key: GeneratedKey) => void;
  deleteKey: (id: string) => void;
  toggleSelect: (id: string) => void;
  clearSelected: () => void;
  setApiKeys: (keys: GeneratedKey[]) => void;
  updateLimit: (added: number) => void;
  addPackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;
  togglePackage: (id: string) => void;
  setChartData: (data: Record<string, number>) => void;
  setLanguage: (lang: string) => void;
  init: () => void;
}

const STORAGE_KEYS = {
  keys: 'ferrao_keys',
  packages: 'ferrao_packages',
  limit: 'ferrao_limit',
  chartData: 'ferrao_chart',
  apiKeys: 'ferrao_api_keys',
  deleted: 'ferrao_deleted',
  lang: 'ferrao_lang',
};

const KEY_LIMIT = 5000;

export const useGeneratorStore = create<GeneratorState>((set) => ({
  generatedKeys: [],
  apiKeys: [],
  deletedIds: new Set(),
  selectedIds: new Set(),
  packages: [
    {
      id: 'default',
      name: 'API',
      url: 'https://teste-api-mcok.vercel.app/keys',
      desc: 'API principal FERRAO',
      enabled: true,
      sent: 0,
    },
  ],
  limitCount: 0,
  chartData: {},
  clearedSessionDevices: new Set(),
  currentLang: 'pt',

  addGeneratedKey: (key) => {
    set((state) => ({
      generatedKeys: [key, ...state.generatedKeys],
    }));
  },

  deleteKey: (id) => {
    set((state) => ({
      deletedIds: new Set([...state.deletedIds, id]),
      generatedKeys: state.generatedKeys.filter((k) => k.id !== id),
      apiKeys: state.apiKeys.filter((k) => k.id !== id),
    }));
  },

  toggleSelect: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    });
  },

  clearSelected: () => {
    set({ selectedIds: new Set() });
  },

  setApiKeys: (keys) => {
    set({ apiKeys: keys });
  },

  updateLimit: (added) => {
    set((state) => ({
      limitCount: Math.min(state.limitCount + added, KEY_LIMIT),
    }));
  },

  addPackage: (pkg) => {
    set((state) => ({
      packages: [...state.packages, pkg],
    }));
  },

  deletePackage: (id) => {
    set((state) => ({
      packages: state.packages.filter((p) => p.id !== id),
    }));
  },

  togglePackage: (id) => {
    set((state) => ({
      packages: state.packages.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  },

  setChartData: (data) => {
    set({ chartData: data });
  },

  setLanguage: (lang) => {
    set({ currentLang: lang });
  },

  init: () => {
    // Load from localStorage
    try {
      const keys = localStorage.getItem(STORAGE_KEYS.keys);
      const packages = localStorage.getItem(STORAGE_KEYS.packages);
      const limit = localStorage.getItem(STORAGE_KEYS.limit);
      const chart = localStorage.getItem(STORAGE_KEYS.chartData);
      const apiKeys = localStorage.getItem(STORAGE_KEYS.apiKeys);
      const deleted = localStorage.getItem(STORAGE_KEYS.deleted);
      const lang = localStorage.getItem(STORAGE_KEYS.lang);

      set({
        generatedKeys: keys ? JSON.parse(keys) : [],
        packages: packages
          ? JSON.parse(packages)
          : [
              {
                id: 'default',
                name: 'API',
                url: 'https://teste-api-mcok.vercel.app/keys',
                desc: 'API principal FERRAO',
                enabled: true,
                sent: 0,
              },
            ],
        limitCount: limit ? JSON.parse(limit) : 0,
        chartData: chart ? JSON.parse(chart) : {},
        apiKeys: apiKeys ? JSON.parse(apiKeys) : [],
        deletedIds: new Set(deleted ? JSON.parse(deleted) : []),
        currentLang: lang ? JSON.parse(lang) : 'pt',
      });

      // Save to localStorage after loading
      const state = useGeneratorStore.getState();
      localStorage.setItem(STORAGE_KEYS.keys, JSON.stringify(state.generatedKeys));
      localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(state.packages));
      localStorage.setItem(STORAGE_KEYS.limit, JSON.stringify(state.limitCount));
      localStorage.setItem(STORAGE_KEYS.chartData, JSON.stringify(state.chartData));
      localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(state.apiKeys));
      localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(Array.from(state.deletedIds)));
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(state.currentLang));
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  },
}));

// Subscribe to store changes and persist to localStorage
useGeneratorStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.keys, JSON.stringify(state.generatedKeys));
    localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(state.packages));
    localStorage.setItem(STORAGE_KEYS.limit, JSON.stringify(state.limitCount));
    localStorage.setItem(STORAGE_KEYS.chartData, JSON.stringify(state.chartData));
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(state.apiKeys));
    const deletedArray = Array.from(state.deletedIds);
    localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(deletedArray));
    localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(state.currentLang));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
});
