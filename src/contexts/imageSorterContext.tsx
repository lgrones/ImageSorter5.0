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
import { Target, useImageSorterState } from "./imageSorterReducer";

interface AppConfig {
  image_folder: string | null;
  target_folder: string | null;
}

const config = await invoke<AppConfig>("load_config");

interface ImageSorterValues {
  index: number;
  selected: Set<number>;
  prev: () => void;
  next: () => void;
  toggleSelect: () => void;
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

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault();

      const folders = document.getElementById("folders") as HTMLDivElement;

      let activeItem: HTMLButtonElement | null = null;

      if (folders.contains(document.activeElement)) {
        activeItem = document.activeElement as HTMLButtonElement;
      }

      switch (e.key) {
        case "ArrowDown":
          (
            (activeItem?.nextElementSibling as HTMLButtonElement | null) ??
            (folders.firstElementChild as HTMLButtonElement | null)
          )?.focus();
          break;
        case "ArrowUp":
          (
            (activeItem?.previousElementSibling as HTMLButtonElement | null) ??
            (folders.lastElementChild as HTMLButtonElement | null)
          )?.focus();
          break;
        case "ArrowUp":
          activeItem?.click();
          break;
      }

      return;
    }

    const searchInput = document.getElementById(
      "folder-search"
    ) as HTMLInputElement;

    if (document.activeElement?.id !== "folder-search") {
      switch (e.key) {
        case "ArrowLeft":
          dispatch({ type: "prev" });
          return;
        case "ArrowRight":
          dispatch({ type: "next" });
          return;
        case " ":
          e.preventDefault();
          dispatch({ type: "toggleSelect" });
          return;
      }

      searchInput?.focus();
      searchInput.select();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      searchInput?.blur();
    }
  });

  useEffect(() => {
    loadImages(imageFolderPath);
    loadTargets(targetFolderPath);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveConfig = (imageFolderPath: string, targetFolderPath: string) =>
    invoke("save_config", {
      config: {
        image_folder: imageFolderPath,
        target_folder: targetFolderPath,
      },
    });

  const loadImages = async (imageFolderPath: string) => {
    if (!imageFolderPath) return;

    setImageFolderPath(imageFolderPath);

    dispatch({ type: "reset" });

    const payload = await invoke<string[]>("read_images_from_folder", {
      folder: imageFolderPath,
    });

    dispatch({ type: "setPaths", payload });

    saveConfig(imageFolderPath, targetFolderPath);
  };

  const loadTargets = async (targetFolderPath: string) => {
    if (!targetFolderPath) return;

    setTargetFolderPath(targetFolderPath);

    const payload = await invoke<Target[]>("read_targets_from_folder", {
      folder: targetFolderPath,
    });

    dispatch({ type: "setTargets", payload });

    saveConfig(imageFolderPath, targetFolderPath);
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
