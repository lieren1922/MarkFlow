import { ref } from "vue";

export const fileContent = ref<string>('');
export const errorMessage = ref<string>('');
export const filePath = ref<string>('');
export const isMarkdown = ref(false);