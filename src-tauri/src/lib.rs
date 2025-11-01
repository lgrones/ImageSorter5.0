use std::sync::{Arc, Mutex};

mod commands;
mod config;
mod folders;
mod operations;

use commands::history::History;

pub fn run() {
    let history = Arc::new(Mutex::new(History::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(history)
        .invoke_handler(tauri::generate_handler![
            folders::read_images_from_folder,
            folders::read_targets_from_folder,
            config::save_config,
            config::load_config,
            operations::undo,
            operations::move_files,
            operations::delete_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
