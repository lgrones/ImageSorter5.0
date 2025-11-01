import { useReducer } from "react";

export interface Target {
  name: string;
  path: string;
}

interface State {
  initialized: boolean;
  index: number;
  selected: Set<number>;
  paths: string[];
  targets: Target[];
}

export type Action =
  | { type: "reset" }
  | { type: "setPaths"; payload: string[] }
  | { type: "setTargets"; payload: Target[] }
  | { type: "toggleSelect" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "remove"; payload: string[] }
  | { type: "add"; payload: string[] };

export const initialState: State = {
  initialized: false,
  index: 0,
  selected: new Set(),
  paths: [],
  targets: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset":
      return { ...state, initialized: false, index: 0, selected: new Set() };

    case "setPaths":
      return {
        ...state,
        paths: action.payload,
        initialized: true,
      };

    case "setTargets":
      return {
        ...state,
        targets: action.payload,
        initialized: true,
      };

    case "remove":
      return {
        ...state,
        paths: state.paths.filter((x) => !action.payload.includes(x)),
        index: 0,
        selected: new Set(),
      };

    case "add":
      return {
        ...state,
        paths: [...state.paths, ...action.payload],
        index: 0,
        selected: new Set(),
      };

    case "toggleSelect": {
      const newSet = new Set(state.selected);

      newSet.has(state.index)
        ? newSet.delete(state.index)
        : newSet.add(state.index);

      return { ...state, selected: newSet };
    }

    case "next":
      return {
        ...state,
        index:
          state.paths.length === 0 ? 0 : (state.index + 1) % state.paths.length,
      };

    case "prev":
      return {
        ...state,
        index:
          state.paths.length === 0
            ? 0
            : (state.index - 1 + state.paths.length) % state.paths.length,
      };

    default:
      return state;
  }
};

export const useImageSorterState = () => useReducer(reducer, initialState);
