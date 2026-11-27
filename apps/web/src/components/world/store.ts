import { create } from 'zustand';

export type Selection =
  | { kind: 'building'; id: string }
  | { kind: 'machine'; id: string }
  | { kind: 'lot'; id: string }
  | { kind: 'room'; id: string }
  | null;

interface WorldUi {
  selection: Selection;
  hovered: string | null;
  showLabels: boolean;
  select: (s: Selection) => void;
  hover: (id: string | null) => void;
  toggleLabels: () => void;
}

export const useWorldUi = create<WorldUi>((set) => ({
  selection: null,
  hovered: null,
  showLabels: true,
  select: (selection) => set({ selection }),
  hover: (hovered) => set({ hovered }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
}));
