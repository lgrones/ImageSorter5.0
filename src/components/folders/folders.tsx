import classes from "./folders.module.css";
import { FolderSearch } from "./folderSearch/folderSearch";
import { FolderTree } from "./folderTree/folderTree";

export const Folders = () => {
  return (
    <div className={classes.container}>
      <FolderSearch />
      <FolderTree />
    </div>
  );
};
