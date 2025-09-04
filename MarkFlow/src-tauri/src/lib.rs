// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Listener;

mod menu;
mod open_file;
mod save_file;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let menu = menu::create_main_menu(app)?;
            app.set_menu(menu)?;
            menu::setup_menu_events(app);

            app.listen("ready_to_close", |_| {
                std::process::exit(0);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_file::open_file,
            save_file::save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
