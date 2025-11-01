import { open } from "@tauri-apps/plugin-dialog";

interface PathSelectorProps {
  title: string;
  folderPath: string;
  setFolderPath: (folderPath: string) => void;
}

export const PathSelector = ({
  title,
  folderPath,
  setFolderPath,
}: PathSelectorProps) => {
  const pickFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title,
    });

    if (typeof selected !== "string") return;

    setFolderPath(selected);
  };

  return <button onClick={pickFolder}>{folderPath || title}</button>;
};
