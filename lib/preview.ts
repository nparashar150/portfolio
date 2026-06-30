export type PreviewKind = "image" | "map";

export type PreviewState = {
  kind: PreviewKind | null;
  src?: string;
  label?: string;
  x: number;
  y: number;
};

let state: PreviewState = { kind: null, x: 0, y: 0 };
const subs = new Set<() => void>();
const emit = () => subs.forEach((cb) => cb());

export const preview = {
  get: (): PreviewState => state,
  show: (p: {
    kind: PreviewKind;
    src?: string;
    label?: string;
    x: number;
    y: number;
  }) => {
    state = { ...p };
    emit();
  },
  move: (x: number, y: number) => {
    if (state.kind === null) return;
    state = { ...state, x, y };
    emit();
  },
  hide: () => {
    if (state.kind === null) return;
    state = { kind: null, x: state.x, y: state.y };
    emit();
  },
  subscribe: (cb: () => void) => {
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },
};
