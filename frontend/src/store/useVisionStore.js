import { create } from 'zustand';

const useVisionStore = create((set, get) => ({
  currentStep: 1,
  selections: [],
  intentions: ['', '', ''],
  userName: '',
  userEmail: '',
  activeFilters: {
    mood: null,
    setting: null,
    style: null,
  },
  isSubmitting: false,
  submitError: null,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 7) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  toggleImage: (image) => set((state) => {
    const exists = state.selections.find(s => s.imageId === image.id);
    if (exists) {
      return { selections: state.selections.filter(s => s.imageId !== image.id) };
    }
    if (state.selections.length >= 8) return state;
    return {
      selections: [
        ...state.selections,
        {
          imageId: image.id,
          filename: image.filename,
          imageUrl: image.imageUrl,
          annotation: '',
          mood: image.mood,
          setting: image.setting,
          style: image.style,
        }
      ]
    };
  }),

  isSelected: (imageId) => get().selections.some(s => s.imageId === imageId),

  removeImage: (imageId) => set((state) => ({
    selections: state.selections.filter(s => s.imageId !== imageId)
  })),

  setAnnotation: (imageId, annotation) => set((state) => ({
    selections: state.selections.map(s =>
      s.imageId === imageId ? { ...s, annotation } : s
    )
  })),

  getAnnotation: (imageId) => {
    const sel = get().selections.find(s => s.imageId === imageId);
    return sel ? sel.annotation : '';
  },

  setIntention: (index, text) => set((state) => {
    const intentions = [...state.intentions];
    intentions[index] = text;
    return { intentions };
  }),

  setFilter: (type, value) => set((state) => ({
    activeFilters: {
      ...state.activeFilters,
      [type]: state.activeFilters[type] === value ? null : value,
    }
  })),

  clearFilters: () => set({
    activeFilters: { mood: null, setting: null, style: null }
  }),

  setUserName: (name) => set({ userName: name }),
  setUserEmail: (email) => set({ userEmail: email }),
  setSubmitting: (val) => set({ isSubmitting: val }),
  setSubmitError: (err) => set({ submitError: err }),

  getSessionBrief: () => {
    const { selections } = get();
    const moodCounts = {};
    const settingCounts = {};

    selections.forEach(s => {
      moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
      settingCounts[s.setting] = (settingCounts[s.setting] || 0) + 1;
    });

    const topMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([m]) => m.toLowerCase());

    const topSettings = Object.entries(settingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([s]) => s.toLowerCase());

    const hasCandid = selections.some(s => s.style.toLowerCase().includes('candid'));
    const hasPosed = selections.some(s => s.style.toLowerCase().includes('posed'));

    let styleDesc = '';
    if (hasCandid && hasPosed) styleDesc = 'candid and posed';
    else if (hasCandid) styleDesc = 'candid';
    else if (hasPosed) styleDesc = 'posed';
    else styleDesc = 'artistic';

    return { moods: topMoods, settings: topSettings, styleDesc };
  },
}));

export default useVisionStore;
