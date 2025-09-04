<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useCodeEditor } from './composables/useEditor';
import { useMarkdown } from './composables/useMarkdown';
import { useFileHandling } from './composables/useFileHandling';
import { useEventHandling } from './composables/useEvents';
import { useClipboard } from './composables/useClipboard';
import { fileContent, errorMessage, isMarkdown } from './composables/state';
import { register } from '@tauri-apps/plugin-global-shortcut';

import 'highlight.js/styles/github.css'

const editorRef = ref<HTMLElement>();
const editor = useCodeEditor(editorRef);
const { renderMarkdown } = useMarkdown();
const fileHandler = useFileHandling(editor);
const clipboardHandler = useClipboard();
const { setupListeners, cleanupListeners } = useEventHandling({
  openFile: fileHandler.openFile,
  saveFile: fileHandler.saveFile,
  closeApp: fileHandler.closeApp,
});

async function registerShortcuts() {
  await register('CommandOrControl+Shift+O', async (event) => {
    if (event.state === 'Pressed') {
      console.log("cmd + o enter");
      await fileHandler.openFile()
    }
  })
  await register('CommandOrControl+S', async (event) => {
    if (event.state === 'Pressed') {
      console.log("cmd + s enter");
      await fileHandler.saveFile()
    }
  })
  await register('CommandOrControl+W', async (event) => {
    if (event.state === 'Pressed') {
      console.log("cmd + w enter");
      await fileHandler.closeApp()
    }
  })
  await register('CommandOrControl+c', async (event) => {
    if (event.state === 'Pressed') {
      console.log("cmd + c enter");
      await clipboardHandler.writeToClipboard()
    }
  })
  await register('CommandOrControl+v', async (event) => {
    if (event.state === 'Pressed') {
      console.log("cmd + v enter");
      await clipboardHandler.readClipboardAndWrite()
    }
  })
}

onMounted(async () => {
  await registerShortcuts();
  await setupListeners();
});

onUnmounted(async () => {
  cleanupListeners();
  editor.destroyEditor();
});
</script>

<template>
  <main class="main-container">
    <div class="content-container">
      <div class="error" v-if="errorMessage">{{ errorMessage }}</div>

      <div v-if="isMarkdown" class="split-container">
        <div class="preview-wrapper">
          <div class="preview-container" v-html="renderMarkdown(fileContent)"></div>
        </div>
        <div class="ultra-smooth-line"></div>
        <div class="editor-wrapper">
          <div class="editor-container" ref="editorRef"></div>
        </div>
      </div>

      <textarea v-else v-model="fileContent"></textarea>
    </div>
  </main>
</template>

<style>
.main-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
}

.split-container {
  flex: 1;
  display: flex;
  gap: 0px;
}

.editor-wrapper,
.preview-wrapper {
  flex: 1;
  height: calc(100vh);
  overflow-y: auto;
  scrollbar-width: none;
}

.cm-editor * {
  font-family: 'FiraCode Nerd Font' !important;
}

.editor-container {
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  line-height: 3.2;
  padding-left: 15px;
  padding-right: 15px;
}

.preview-container {
  font-family: 'FiraCode Nerd Font';
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  line-height: 1.6;
  padding-left: 15px;
  padding-right: 15px;
}

.preview-container pre {
  border: 1px solid black;
  padding: 1px;
  margin: 2px 0;
  background-color: hsl(0, 0%, 100%);
  border-radius: 4px;
  overflow-x: auto;
}

.preview-container pre code.hljs {
  font-family: 'FiraCode Nerd Font';
  display: block;
  overflow-x: auto;
  padding: 5px;
}

textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 80vh;
  resize: none;
}

.ultra-smooth-line {
  height: 100%;
  /* 稍短于视窗 */
  width: 1.5px;
  /* 更细的线 */
  background: linear-gradient(180deg,
      hsla(0, 0%, 0%, 0) 0%,
      /* 完全透明 - 起点 */
      hsla(0, 0%, 0%, 0.5) 15%,
      /* 新增：极淡过渡 */
      hsla(0, 0%, 0%, 0.82) 25%,
      /* 淡入开始 */
      hsla(0, 0%, 0%, 0.92) 35%,
      /* 新增：中等透明度 */
      hsla(0, 0%, 0%, 1) 42%,
      /* 新增：快速加深 */
      hsla(0, 0%, 0%, 1) 48%,
      /* 接近纯黑 */
      black 50%,
      /* 纯黑 - 中心点 */
      hsla(0, 0%, 0%, 1) 52%,
      /* 对称反向 */
      hsla(0, 0%, 0%, 1) 58%,
      hsla(0, 0%, 0%, 0.92) 65%,
      hsla(0, 0%, 0%, 0.82) 75%,
      hsla(0, 0%, 0%, 0.5) 85%,
      hsla(0, 0%, 0%, 0) 100%
      /* 完全透明 - 终点 */
    );

  filter: blur(0.35px);
  animation: fadeIn 1.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
