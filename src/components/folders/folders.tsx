import { useState } from "react";
import { useImageSorter } from "../../contexts/imageSorterContext";
import { PathSelector } from "../pathSelector/pathSelector";
import classes from "./folders.module.css";
import { FolderTree } from "./folderTree/folderTree";
import { Target } from "../../contexts/imageSorterReducer";

const fuzzyMatch = (query: string, targets: Target[]) => {
  query = query.toLowerCase();

  return targets
    .map((target) => {
      const path = target.path.toLowerCase();
      const name = target.name.toLowerCase();
      let index = 0;
      let score = name.includes(query) ? 200 : 0;

      for (let i = 0; i < path.length && index < query.length; i++) {
        if (path[i] === query[index]) {
          score += 2;
          index++;
        } else if (query.includes(path[i])) {
          score += 0.5;
        }
      }

      return { target, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.target);
};

export const Folders = () => {
  const { targets, targetFolderPath, setTargetFolderPath } = useImageSorter();
  const [query, setQuery] = useState("");

  return (
    <div className={classes.container}>
      <input
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        type="search"
        placeholder="Search folder..."
        id="folder-search"
        className={classes.search}
      />

      <FolderTree targets={fuzzyMatch(query, targets)} />

      <PathSelector
        title="Select a target folder"
        folderPath={targetFolderPath}
        setFolderPath={setTargetFolderPath}
      />
    </div>
  );
};
