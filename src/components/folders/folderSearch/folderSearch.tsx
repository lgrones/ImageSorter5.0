import { useEffect, useEffectEvent, useRef } from "react";
import classes from "./folderSearch.module.css";

export const FolderSearch = () => {
  const ref = useRef<HTMLInputElement>(null);

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.shiftKey) return;

    if (!e.ctrlKey && e.key === "Escape") {
      ref.current?.blur();
      return;
    }

    if (e.key === "k") {
      ref.current?.focus();
      ref.current?.select();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={classes.container}>
      <input
        ref={ref}
        type="search"
        placeholder="Search folder..."
        id="folder-search"
      />
      <kbd>CTRL + K</kbd>
    </div>
  );
};
