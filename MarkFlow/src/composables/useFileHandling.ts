import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { nextTick } from 'vue';
import { fileContent, errorMessage, filePath, isMarkdown } from './state';
import { useCodeEditor } from "./useEditor";
import { emit } from "@tauri-apps/api/event";

export function useFileHandling(editor: ReturnType<typeof useCodeEditor>) {
    const openFile = async () => {
        const selectedFile = await open({ multiple: false, directory: false });
        if (!selectedFile) return;

        filePath.value = selectedFile as string;
        const cleanPath = filePath.value.split('?')[0];
        isMarkdown.value = cleanPath.toLowerCase().endsWith('.md');

        try {
            const rawData = await invoke<Uint8Array>('open_file', { file_path: selectedFile });
            fileContent.value = new TextDecoder('utf-8').decode(rawData);
            errorMessage.value = '';

            if (isMarkdown.value) {
                await nextTick();
                editor.destroyEditor();
                editor.initEditor();
            }
        } catch (err: unknown) {
            handleError(err, '读取失败');
        }
    };

    const saveFile = async () => {
        try {
            await invoke('save_file', {
                file_path: filePath.value,
                content: fileContent.value
            });
            errorMessage.value = '';
        } catch (err: unknown) {
            handleError(err, '保存失败');
        }
    };

    const closeApp = async () => {
        if (filePath.value) await saveFile();
        await emit('ready_to_close');
    };

    const handleError = (err: unknown, prefix: string) => {
        errorMessage.value = `${prefix}: ${err instanceof Error ? err.message : String(err)}`;
        fileContent.value = '';
    };

    return { openFile, saveFile, closeApp };
}