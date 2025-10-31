import { open } from "@tauri-apps/plugin-dialog";
import { useImageSorter } from "../../contexts/imageSorterContext";

export const PathSelector = () => {
  const { folderPath, setFolderPath } = useImageSorter();

  const pickFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select an image folder",
    });

    if (typeof selected !== "string") return;

    setFolderPath(selected);
  };

  return (
    <button onClick={pickFolder}>
      {folderPath || "Select an image folder"}
    </button>
  );
};
