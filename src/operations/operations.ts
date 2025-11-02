import { invoke } from "@tauri-apps/api/core";
import { Target } from "../contexts/imageSorterReducer";

interface AppConfig {
  imageFolderPath: string | null;
  targetFolderPath: string | null;
}

export const saveConfig = async (
  imageFolderPath: string,
  targetFolderPath: string
) =>
  await invoke("save_config", {
    config: {
      image_folder: imageFolderPath,
      target_folder: targetFolderPath,
    },
  });

export const loadConfig = async (): Promise<AppConfig> => {
  const config = await invoke<{
    image_folder: string | null;
    target_folder: string | null;
  }>("load_config");

  return {
    imageFolderPath: config.image_folder,
    targetFolderPath: config.target_folder,
  };
};

export const readImagePaths = async (imageFolderPath: string) =>
  await invoke<string[]>("read_images_from_folder", {
    folder: imageFolderPath,
  });

export const readTargetPaths = async (targetFolderPath: string) =>
  await invoke<Target[]>("read_targets_from_folder", {
    folder: targetFolderPath,
  });

export const undo = async () => await invoke<string[]>("undo");

export const deleteFiles = async (files: string[]) =>
  await invoke("delete_files", { files });

export const moveFiles = async (files: string[], target: string) =>
  await invoke("move_files", { files, target });
