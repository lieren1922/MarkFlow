use std::fs;

#[tauri::command(rename_all = "snake_case")]
pub fn save_file(file_path: String, content: String) -> Result<(), String> {
    fs::write(&file_path, &content).map_err(|e| format!("Error writing file: {}", e))
}
