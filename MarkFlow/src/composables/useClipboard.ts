import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';

export function useClipboard() {
    let selection = '';

    const writeToClipboard = async () => {
        // 获取选中的文本
        const sel = window.getSelection();
        selection = sel?.toString() || '';
        // 将内容写到剪贴板
        await writeText(selection);
    };

    const readClipboardAndWrite = async () => {
        // 从剪贴板读取内容
        const content = await readText();
        console.log(content);
    };

    return {
        writeToClipboard,
        readClipboardAndWrite
    };
}