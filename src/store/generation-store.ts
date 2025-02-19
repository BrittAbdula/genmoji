import { create } from 'zustand';

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  prompt: string;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  setPrompt: (prompt: string) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  isGenerating: false,
  progress: 0,
  prompt: '',
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set((state) => ({ 
    progress: typeof progress === 'function' ? progress(state.progress) : progress 
  })),
  setPrompt: (prompt) => set({ prompt }),
  reset: () => set({ isGenerating: false, progress: 0, prompt: '' }),
})); 