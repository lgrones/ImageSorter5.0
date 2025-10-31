import { useReducer } from "react";

interface State {
  initialized: boolean;
  index: number;
  selected: Set<number>;
  paths: string[];
}

type Action =
  | { type: "reset" }
  | { type: "setPaths"; payload: string[] }
  | { type: "toggleSelect" }
  | { type: "next" }
  | { type: "prev" };

export const initialState: State = {
  initialized: false,
  index: 0,
  selected: new Set(),
  paths: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset":
      return initialState;

    case "setPaths":
      return {
        ...state,
        paths: action.payload,
        initialized: true,
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
