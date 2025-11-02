use std::{
    collections::HashSet,
    io,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use trash::{
    delete_all,
    os_limited::{list, restore_all},
    Error, TrashItem,
};

use crate::commands::command::Command;

pub struct DeleteFiles {
    deleted_files: Mutex<Vec<TrashItem>>, // (source, destination)
    files: Vec<PathBuf>,
}

impl DeleteFiles {
    pub fn new(files: Vec<PathBuf>) -> Arc<Self> {
        Arc::new(Self {
            deleted_files: Mutex::new(Vec::new()),
            files,
        })
    }
}

impl Command for DeleteFiles {
    fn execute(&self) -> Result<(), io::Error> {
        if let Err(_) = delete_all(&self.files) {
            return Err(io::Error::new(io::ErrorKind::Other, "Error deleting files"));
        }

        let trash_items = match list() {
            Ok(x) => x,
            Err(_) => return Err(io::Error::new(io::ErrorKind::Other, "Error deleting files")),
        };

        let mut deleted_files = self.deleted_files.lock().unwrap();

        for trash_item in trash_items {
            if self.files.contains(&trash_item.original_path()) {
                deleted_files.push(trash_item);
            }
        }

        Ok(())
    }

    fn rollback(&self) -> Result<Vec<String>, io::Error> {
        let mut trash_items = self.deleted_files.lock().unwrap().clone();
        let mut errored_items = HashSet::new();

        while !trash_items.is_empty() {
            match restore_all(trash_items) {
                Err(Error::RestoreCollision {
                    path,
                    mut remaining_items,
                }) => {
                    remaining_items.retain(|e| e.original_path() != path);
                    trash_items = remaining_items;
                    errored_items.insert(path);
                }
                Err(_) => {
                    return Err(io::Error::new(
                        io::ErrorKind::Other,
                        "Error restoring files",
                    ))
                }
                Ok(_) => break,
            }
        }

        return Ok(self
            .deleted_files
            .lock()
            .unwrap()
            .clone()
            .into_iter()
            .filter(|item| !errored_items.contains(&item.original_path()))
            .map(|item| item.original_path().to_string_lossy().to_string())
            .collect());
    }
}
