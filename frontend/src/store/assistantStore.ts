import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AssistantState {
    messages: Message[];
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>()(
    persist(
        (set) => ({
            messages: [],
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: 'assistant-storage',
        }
    )
);
