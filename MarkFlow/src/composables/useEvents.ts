import { listen, UnlistenFn } from '@tauri-apps/api/event';

export function useEventHandling(handlers: {
    openFile: () => Promise<void>;
    saveFile: () => Promise<void>;
    closeApp: () => Promise<void>;
}) {
    let unlisteners: UnlistenFn[] = [];

    const setupListeners = async () => {
        const [open, save, close] = await Promise.all([
            listen('open_file', handlers.openFile),
            listen('save_file', handlers.saveFile),
            listen('save_and_close', handlers.closeApp),
        ]);
        unlisteners = [open, save, close];
    };

    const cleanupListeners = () => {
        unlisteners.forEach(fn => fn());
    };

    return { setupListeners, cleanupListeners };
}