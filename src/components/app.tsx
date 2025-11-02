import classes from "./app.module.css";
import { Folders } from "./folders/folders";
import { ImageView } from "./imageView/imageView";

export const App = () => {
  return (
    <main className={classes.container}>
      <ImageView />
      <Folders />
    </main>
  );
};
