use std::{
    collections::HashSet,
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
    fn execute(&self) {
        if let Ok(_) = delete_all(&self.files) {
            if let Ok(trash_items) = list() {
                let mut deleted_files = self.deleted_files.lock().unwrap();

                for trash_item in trash_items {
                    if self.files.contains(&trash_item.original_path()) {
                        deleted_files.push(trash_item);
                    }
                }
            }
        }
    }

    fn rollback(&self) -> Vec<String> {
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
                Err(_) => break,
                Ok(_) => break,
            }
        }

        return self
            .deleted_files
            .lock()
            .unwrap()
            .clone()
            .into_iter()
            .filter(|item| !errored_items.contains(&item.original_path()))
            .map(|item| item.original_path().to_str().unwrap().to_string())
            .collect();
    }
}
