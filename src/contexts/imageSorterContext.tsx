import {
  createContext,
  PropsWithChildren,
  use,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { PathSelector } from "../components/pathSelector/pathSelector";
import { useImageSorterState } from "./imageSorterReducer";

interface AppConfig {
  image_folder: string | null;
  target_folder: string | null;
}

const config = await invoke<AppConfig>("load_config");

interface ImageSorterValues {
  index: number;
  selected: Set<number>;
  total: number;
  imagePath: string;
  folderPath: string;
  setFolderPath: (path: string) => void;
}

const ImageSorterContext = createContext<ImageSorterValues | null>(null);

export const useImageSorter = () =>
  use(ImageSorterContext) as ImageSorterValues;

export const ImageSorterProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useImageSorterState();
  const [folderPath, setFolderPath] = useState<string>(
    config.image_folder ?? ""
  );

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (document.activeElement?.id === "folder-search") return;

    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    switch (e.key) {
      case "ArrowLeft":
        dispatch({ type: "prev" });
        break;
      case "ArrowRight":
        dispatch({ type: "next" });
        break;
      case " ":
        dispatch({ type: "toggleSelect" });
        break;
    }
  });

  useEffect(() => {
    dispatch({ type: "reset" });

    invoke<string[]>("read_images_from_folder", {
      folder: folderPath,
    }).then((payload) => {
      dispatch({ type: "setPaths", payload });
    });

    invoke("save_config", {
      config: { image_folder: folderPath, target_folder: config.target_folder }, // TODO replace with actual target state
    });

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [folderPath]);

  if (!state.initialized) return "Loading";

  return (
    <ImageSorterContext
      value={{
        ...state,
        folderPath,
        setFolderPath,
        total: state.paths.length,
        imagePath: state.paths[state.index],
      }}
    >
      {!state.paths.length ? <PathSelector /> : children}
    </ImageSorterContext>
  );
};
