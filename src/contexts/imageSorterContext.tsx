import {
  createContext,
  PropsWithChildren,
  use,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { PathSelector } from "../components/pathSelector/pathSelector";
import { Target, useImageSorterState } from "./imageSorterReducer";
import {
  loadConfig,
  moveFiles,
  readImages,
  readTargets,
  saveConfig,
} from "./operations";
import {
  handleControlKeys,
  handleGlobalKeys,
  handleSearchKeys,
} from "./keyHandlers";

const config = await loadConfig();

interface ImageSorterValues {
  index: number;
  selected: Set<number>;
  prev: () => void;
  next: () => void;
  toggleSelect: () => void;
  move: (path: string) => void;
  total: number;
  imagePath: string;
  targets: Target[];
  imageFolderPath: string;
  setImageFolderPath: (path: string) => void;
  targetFolderPath: string;
  setTargetFolderPath: (path: string) => void;
}

const ImageSorterContext = createContext<ImageSorterValues | null>(null);

export const useImageSorter = () =>
  use(ImageSorterContext) as ImageSorterValues;

export const ImageSorterProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useImageSorterState();
  const [imageFolderPath, setImageFolderPath] = useState(
    config.image_folder ?? ""
  );
  const [targetFolderPath, setTargetFolderPath] = useState(
    config.target_folder ?? ""
  );

  const paths = state.selected.size
    ? state.paths.filter((_, i) => state.selected.has(i))
    : [state.paths[state.index]];

  const handleKeyDown = useEffectEvent(async (e: KeyboardEvent) => {
    if (handleGlobalKeys(e)) return;

    if (await handleControlKeys(e, dispatch, paths)) return;

    handleSearchKeys(e);
  });

  useEffect(() => {
    loadImages(imageFolderPath);
    loadTargets(targetFolderPath);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadImages = async (imageFolderPath: string) => {
    if (!imageFolderPath) return;

    setImageFolderPath(imageFolderPath);
    dispatch({ type: "reset" });

    const payload = await readImages(imageFolderPath);

    dispatch({ type: "setPaths", payload });
    saveConfig(imageFolderPath, targetFolderPath);
  };

  const loadTargets = async (targetFolderPath: string) => {
    if (!targetFolderPath) return;

    setTargetFolderPath(targetFolderPath);

    const payload = await readTargets(targetFolderPath);

    dispatch({ type: "setTargets", payload });
    saveConfig(imageFolderPath, targetFolderPath);
  };

  const move = async (targetFolderPath: string) => {
    if (!targetFolderPath) return;

    await moveFiles(paths, targetFolderPath);

    dispatch({ type: "remove", payload: paths });
  };

  if (!state.initialized) return "Loading";

  return (
    <ImageSorterContext
      value={{
        ...state,
        imageFolderPath,
        setImageFolderPath: loadImages,
        targetFolderPath,
        setTargetFolderPath: loadTargets,
        total: state.paths.length,
        imagePath: state.paths[state.index],
        move,
        prev: () => dispatch({ type: "prev" }),
        next: () => dispatch({ type: "next" }),
        toggleSelect: () => dispatch({ type: "toggleSelect" }),
      }}
    >
      {!imageFolderPath || !targetFolderPath ? (
        <>
          <PathSelector
            title="Select an image folder"
            folderPath={imageFolderPath}
            setFolderPath={loadImages}
          />
          <PathSelector
            title="Select a target folder"
            folderPath={targetFolderPath}
            setFolderPath={loadTargets}
          />
        </>
      ) : (
        children
      )}
    </ImageSorterContext>
  );
};
