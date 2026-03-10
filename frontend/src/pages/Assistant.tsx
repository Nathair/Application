import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, BrainCircuit } from 'lucide-react';
import api from '../api/axios';
import { useAssistantStore } from '../store/assistantStore';

export default function Assistant() {
    const { messages, addMessage, clearMessages } = useAssistantStore();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        setInput('');
        addMessage({ role: 'user', content: question });
        setLoading(true);

        try {
            const res = await api.post('/assistant', { question });
            addMessage({ role: 'assistant', content: res.data.response });
        } catch (err: any) {
            addMessage({
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to my AI brain right now. Please check if GROQ_API_KEY is set in the backend .env or try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <BrainCircuit size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            AI Event Assistant
                            <span className="bg-blue-100 text-blue-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">Mistral AI</span>
                        </h1>
                        <p className="text-gray-500 text-sm">Ask anything about your events, participants, or dates.</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearMessages}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 size={16} /> Clear Chat
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 bg-opacity-50 rounded-3xl p-6 mb-4 border border-gray-100 backdrop-blur-sm custom-scrollbar">
                <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Sparkles size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Hello! I'm your Event Guide.</h2>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                You can ask me things like:
                                <br />
                                <span className="text-blue-600 font-medium italic">"When is my next event?"</span>
                                <br />
                                <span className="text-blue-600 font-medium italic">"Who's attending the tech meetup?"</span>
                                <br />
                                <span className="text-blue-600 font-medium italic">"Show tech events this weekend."</span>
                            </p>
                        </div>
                    )}

                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-blue-600 border border-gray-100'
                                    }`}>
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-blue-600 border border-gray-100 flex items-center justify-center mt-1 shadow-sm">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg mb-6">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center min-w-[52px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
