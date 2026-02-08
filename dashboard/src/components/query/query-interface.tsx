'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    data?: any[];
}

export function QueryInterface() {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const examples = [
        "What was my best performing week?",
        "Which LLM model recommends me most?",
        "Compare my visibility vs competitors",
        "What topics am I missing?"
    ];

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Failed to query data');

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.answer,
                data: result.data
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[700px] flex flex-col border-gray-800 bg-black/40 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Ask Your Data</CardTitle>
                        <CardDescription>Get instant answers about your brand visibility</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                {/* Message Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
                            <Sparkles className="h-12 w-12 text-emerald-500/50" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Speak to your dashboard</h3>
                                <p className="text-sm text-gray-400">
                                    I can analyze your Share of Voice, Sentiment, and visibility across all models.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 w-full">
                                {examples.map(ex => (
                                    <button
                                        key={ex}
                                        onClick={() => handleSend(ex)}
                                        className="text-left p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-sm group"
                                    >
                                        <span className="text-gray-300 group-hover:text-emerald-400">"{ex}"</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-900 border border-gray-800'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {msg.data && msg.data.length > 0 && (
                                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-800">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-gray-800/50 text-gray-400 uppercase">
                                                <tr>
                                                    {Object.keys(msg.data[0]).map(k => (
                                                        <th key={k} className="px-3 py-2 font-medium">{k}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {msg.data.map((row, i) => (
                                                    <tr key={i}>
                                                        {Object.values(row).map((v: any, j) => (
                                                            <td key={j} className="px-3 py-2 text-gray-300">
                                                                {typeof v === 'number' ? v.toFixed(2) : String(v)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                <span className="text-sm text-gray-400">Analyzing data...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-xs">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative flex items-center gap-2"
                    >
                        <Input
                            placeholder="Ask a question about your data..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="pr-12 bg-black border-gray-800 focus:ring-emerald-500 h-12 rounded-xl"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-1.5 h-9 w-9 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                    <p className="mt-2 text-[10px] text-gray-500 text-center">
                        Powered by CLOVER Intelligence. Results derived from your collection history.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
