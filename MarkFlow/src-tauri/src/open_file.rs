use tauri::ipc::Response;

#[tauri::command(rename_all = "snake_case")]
pub async fn open_file(file_path: String) -> Response {
    tauri::ipc::Response::new(std::fs::read(file_path).unwrap())
}
