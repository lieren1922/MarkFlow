import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { nextTick } from 'vue';

export function useMarkdown() {
    const md = new MarkdownIt({
        html: false,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang }).value;
                } catch (_) { }
            }
            return '';
        }
    });

    const renderMarkdown = (content: string) => {
        const unsafeHtml = md.render(content);
        const cleanHtml = DOMPurify.sanitize(unsafeHtml, {
            ADD_ATTR: ['class'],
            FORBID_TAGS: ['style']
        });

        nextTick(() => {
            document.querySelectorAll('.preview-container pre code').forEach(block => {
                hljs.highlightElement(block as HTMLElement);
            });
        });

        return cleanHtml;
    };

    return { renderMarkdown };
}