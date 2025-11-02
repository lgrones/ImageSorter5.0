import { useReducer } from "react";

export interface Target {
  name: string;
  path: string;
}

interface State {
  currentIndex: number;
  selectedImagePaths: Set<string>;
  imagePaths: string[];
  targetFolders: Target[];
  imageFolderPath: string;
  targetFolderPath: string;
}

export type Action =
  | {
      type: "setImagePaths";
      payload: { imagePaths: string[]; imageFolderPath: string };
    }
  | {
      type: "setTargetFolders";
      payload: { targetFolders: Target[]; targetFolderPath: string };
    }
  | { type: "removeImages"; payload: string[] }
  | { type: "addImages"; payload: string[] }
  | { type: "toggleImageSelect" }
  | { type: "nextImage" }
  | { type: "prevImage" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setImagePaths":
      return {
        ...state,
        ...action.payload,
        currentIndex: 0,
        selectedImagePaths: new Set(),
      };

    case "setTargetFolders":
      return {
        ...state,
        ...action.payload,
        currentIndex: 0,
        selectedImagePaths: new Set(),
      };

    case "removeImages":
      return {
        ...state,
        imagePaths: state.imagePaths.filter((x) => !action.payload.includes(x)),
        currentIndex: 0,
        selectedImagePaths: new Set(),
      };

    case "addImages":
      return {
        ...state,
        imagePaths: [...state.imagePaths, ...action.payload],
        currentIndex: 0,
        selectedImagePaths: new Set(),
      };

    case "toggleImageSelect": {
      const newSet = new Set(state.selectedImagePaths);

      const currentImagePath = state.imagePaths[state.currentIndex];

      newSet.has(currentImagePath)
        ? newSet.delete(currentImagePath)
        : newSet.add(currentImagePath);

      return { ...state, selectedImagePaths: newSet };
    }

    case "nextImage":
      return {
        ...state,
        currentIndex:
          state.imagePaths.length === 0
            ? 0
            : (state.currentIndex + 1) % state.imagePaths.length,
      };

    case "prevImage":
      return {
        ...state,
        currentIndex:
          state.imagePaths.length === 0
            ? 0
            : (state.currentIndex - 1 + state.imagePaths.length) %
              state.imagePaths.length,
      };

    default:
      return state;
  }
};

export const useImageSorterState = (defaults: {
  imageFolderPath: string;
  targetFolderPath: string;
  imagePaths: string[];
  targetFolders: Target[];
}) =>
  useReducer(reducer, {
    currentIndex: 0,
    selectedImagePaths: new Set<string>(),
    imagePaths: defaults.imagePaths,
    targetFolders: defaults.targetFolders,
    imageFolderPath: defaults.imageFolderPath,
    targetFolderPath: defaults.targetFolderPath,
  });
