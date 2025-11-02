import {
  createContext,
  PropsWithChildren,
  use,
  useEffect,
  useEffectEvent,
} from "react";
import { PathSelector } from "../components/pathSelector/pathSelector";
import {
  moveFiles,
  readImagePaths,
  readTargetPaths,
  saveConfig,
} from "../operations/operations";
import { Target, useImageSorterState } from "./imageSorterReducer";
import {
  handleControlKeys,
  handleGlobalKeys,
  handleSearchKeys,
} from "./keyHandlers";

interface ImageSorterValues {
  prev: () => void;
  next: () => void;
  toggleSelect: () => void;
  moveImages: (destination: string) => void;
  currentIndex: number;
  selectedImagePaths: Set<string>;
  totalImages: number;
  currentImagePath?: string;
  isVideo: boolean;
  targetFolders: Target[];
  imageFolderPath: string;
  targetFolderPath: string;
  setImageFolderPath: (path: string) => void;
  setTargetFolderPath: (path: string) => void;
}

interface ImageSorterProviderProps {
  imageFolderPath: string;
  targetFolderPath: string;
  imagePaths: string[];
  targetFolders: Target[];
}

export const ImageSorterProvider = ({
  children,
  ...props
}: PropsWithChildren<ImageSorterProviderProps>) => {
  const [state, dispatch] = useImageSorterState(props);

  const currentImagePath: string | undefined =
    state.imagePaths[state.currentIndex];
  const currentImageType = currentImagePath?.substring(
    currentImagePath?.lastIndexOf(".") + 1
  );

  const selectedImages = state.selectedImagePaths.size
    ? state.imagePaths.filter((x) => state.selectedImagePaths.has(x))
    : [currentImagePath];

  const handleKeyDown = useEffectEvent(async (e: KeyboardEvent) => {
    if (handleGlobalKeys(e)) return;

    if (await handleControlKeys(e, dispatch, selectedImages)) return;

    handleSearchKeys(e);
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadImages = async (imageFolderPath: string) => {
    const imagePaths = await readImagePaths(imageFolderPath);

    dispatch({
      type: "setImagePaths",
      payload: { imageFolderPath, imagePaths },
    });

    await saveConfig(imageFolderPath, state.targetFolderPath);
  };

  const loadTargets = async (targetFolderPath: string) => {
    const targetFolders = await readTargetPaths(targetFolderPath);

    dispatch({
      type: "setTargetFolders",
      payload: { targetFolderPath, targetFolders },
    });

    await saveConfig(state.imageFolderPath, targetFolderPath);
  };

  const moveImages = async (targetFolderPath: string) => {
    await moveFiles(selectedImages, targetFolderPath);

    dispatch({ type: "removeImages", payload: selectedImages });
  };

  return (
    <ImageSorterContext
      value={{
        ...state,
        setImageFolderPath: loadImages,
        setTargetFolderPath: loadTargets,
        totalImages: state.imagePaths.length,
        currentImagePath,
        moveImages,
        isVideo: ["mp4", "webm"].includes(currentImageType),
        prev: () => dispatch({ type: "prevImage" }),
        next: () => dispatch({ type: "nextImage" }),
        toggleSelect: () => dispatch({ type: "toggleImageSelect" }),
      }}
    >
      {!state.imageFolderPath || !state.targetFolderPath ? (
        <div className="centered">
          <PathSelector
            title="Select an image folder"
            folderPath={state.imageFolderPath}
            setFolderPath={loadImages}
          />
          <PathSelector
            title="Select a target folder"
            folderPath={state.targetFolderPath}
            setFolderPath={loadTargets}
          />
        </div>
      ) : (
        children
      )}
    </ImageSorterContext>
  );
};

const ImageSorterContext = createContext<ImageSorterValues | null>(null);

export const useImageSorter = () =>
  use(ImageSorterContext) as ImageSorterValues;
