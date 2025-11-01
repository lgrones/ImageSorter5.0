use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

use crate::commands::{delete::DeleteFiles, history::History, r#move::MoveFiles};

#[tauri::command]
pub fn undo(history: tauri::State<Arc<Mutex<History>>>) -> Vec<String> {
    return history.lock().unwrap().rollback();
}

#[tauri::command]
pub fn delete_files(history: tauri::State<Arc<Mutex<History>>>, files: Vec<String>) {
    let command = DeleteFiles::new(files.iter().map(|f| PathBuf::from(f)).collect());

    if let Ok(_) = trash::os_limited::trash_folders() {
        history.lock().unwrap().execute(command);
    }
}

#[tauri::command]
pub fn move_files(history: tauri::State<Arc<Mutex<History>>>, files: Vec<String>, target: String) {
    let command = MoveFiles::new(
        files.iter().map(|f| PathBuf::from(f)).collect(),
        PathBuf::from(target),
    );

    history.lock().unwrap().execute(command);
}
