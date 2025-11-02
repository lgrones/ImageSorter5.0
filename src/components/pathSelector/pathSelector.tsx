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
      defaultPath: folderPath,
      title,
    });

    if (typeof selected !== "string" || !selected) return;

    setFolderPath(selected);
  };

  return <button onClick={pickFolder}>{folderPath || title}</button>;
};
