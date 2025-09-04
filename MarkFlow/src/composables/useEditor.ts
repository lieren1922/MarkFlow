import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { indentUnit, indentOnInput } from "@codemirror/language";
import { fileContent } from './state';
import { Ref } from 'vue';
import { EditorState } from '@codemirror/state';

export function useCodeEditor(editorRef: Ref<HTMLElement | undefined>) {
    let editorInstance: EditorView | null = null;

    const initEditor = () => {
        if (!editorRef.value) return;

        editorInstance = new EditorView({
            state: EditorState.create({
                doc: fileContent.value,
                extensions: [
                    markdown(),
                    EditorView.lineWrapping,
                    indentUnit.of("    "),
                    indentOnInput(),
                    EditorView.theme({
                        "&.cm-focused": { outline: "none" }
                    }),
                    EditorView.domEventHandlers({
                        keydown: (e, view) => {
                            if (e.key === "Tab") {
                                e.preventDefault();
                                view.dispatch({
                                    changes: { from: view.state.selection.main.from, insert: "    " },
                                    selection: { anchor: view.state.selection.main.from + 4 }
                                });
                                return true;
                            }
                            return false;
                        }
                    }),
                    EditorView.updateListener.of(update => {
                        if (update.docChanged) {
                            fileContent.value = update.state.doc.toString();
                        }
                    })
                ]
            }),
            parent: editorRef.value
        });
    };

    const destroyEditor = () => {
        editorInstance?.destroy();
        editorInstance = null;
    };

    return { initEditor, destroyEditor };
}