"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, INITIAL_GREETING } from "@/lib/chatbot/types";
import { SCENARIO } from "@/lib/chatbot/scenario";
import { cn } from "@/lib/utils";
import { X, Send, ImagePlus, User } from "lucide-react";

export function ChatbotWindow() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentStep, setCurrentStep] = useState<string>('root');
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Listen for custom events to open chatbot from other components (e.g. StickyBottomBar)
        const handleOpen = (e: CustomEvent) => {
            setIsOpen(true);
            if (e.detail?.mode === 'quote') {
                // Jump to quote if needed, or just open. For now, open root.
                handleScenarioStep('quote_start');
            } else if (e.detail?.mode === 'vision') {
                handleScenarioStep('vision_start');
            } else {
                if (messages.length === 0) {
                    handleScenarioStep('root');
                }
            }
        };
        window.addEventListener('openChatbot', handleOpen as EventListener);
        return () => window.removeEventListener('openChatbot', handleOpen as EventListener);
    }, [messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleScenarioStep = (stepId: string) => {
        // Special Trigger for External Modals
        if (stepId === 'consultation_form_trigger') {
            const event = new CustomEvent("openChatbot", { detail: { mode: 'consultation_form' } });
            window.dispatchEvent(event);
            return; // Don't add a message
        }

        const scenario = SCENARIO[stepId];
        if (!scenario) return;

        setCurrentStep(stepId);

        // Resolve dynamic text if function
        let resolvedText = scenario.text;
        if (typeof scenario.text === 'function') {
            resolvedText = scenario.text(leadData['name'] || '고객');
        }

        const newMsg: ChatMessage = { ...scenario, text: resolvedText };
        setMessages(prev => [...prev, newMsg]);

        // If vision analyzing, simulate delay then jump
        if (stepId === 'vision_analyzing') {
            setTimeout(() => {
                handleScenarioStep(scenario.nextStep || 'vision_result_ment');
            }, 2500);
        }
    };

    const handleOptionClick = (option: { label: string; value: string; nextStep?: string }) => {
        // Add user message
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: option.label };
        setMessages(prev => [...prev, userMsg]);

        // Proceed to next step
        const nextStep = option.nextStep;
        if (nextStep) {
            setTimeout(() => handleScenarioStep(nextStep), 500);
        }
    };

    const handleInputSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        // Save data based on current step key
        const currentScenario = SCENARIO[currentStep];
        if (currentScenario?.inputKey) {
            setLeadData(prev => ({ ...prev, [currentScenario.inputKey!]: inputValue }));
        }

        // User message
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // Find next step from options (usually only one for input)
        if (currentScenario?.options && currentScenario.options.length > 0) {
            const nextStep = currentScenario.options[0].nextStep;
            if (nextStep) {
                setTimeout(() => handleScenarioStep(nextStep), 500);
            }
        }
    };

    // Submit final data if reached final step
    useEffect(() => {
        if (currentStep === 'lead_final') {
            // TODO: Send to API
            console.log("Submitting Lead:", leadData);
            fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            }).catch(err => console.error(err));
        }
    }, [currentStep, leadData]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/50 sm:bg-transparent pointer-events-auto">
            <div className="w-full sm:w-[380px] h-[100dvh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">하루 실장님이 상담중...</h3>
                            <span className="text-xs text-blue-200 flex items-center gap-1">
                                <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                실시간 답변 대기중
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex w-full mb-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'bot' && (
                                <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-white mr-2 shrink-0">
                                    <span className="text-xs font-bold">Bot</span>
                                </div>
                            )}
                            <div className={cn(
                                "max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                                msg.role === 'user'
                                    ? "bg-primary text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                            )}>
                                {typeof msg.text === 'string' ? msg.text : ''}

                                {/* Vision Simulation Mock */}
                                {msg.type === 'vision_result' && (
                                    <div className="mt-2 w-full h-32 bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 border-2 border-green-400 opacity-50 animate-pulse">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-[scan_2s_infinite]"></div>
                                        </div>
                                        <span className="text-green-400 font-mono text-xs">AI ANALYSIS COMPLETE...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Current Options */}
                    {messages.length > 0 && messages[messages.length - 1].role === 'bot' && messages[messages.length - 1].options && messages[messages.length - 1].type === 'options' && (
                        <div className="flex flex-col gap-2 mt-2 pl-10">
                            {messages[messages.length - 1].options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOptionClick(opt)}
                                    className="bg-white border border-primary/20 text-primary text-sm font-medium py-2 px-4 rounded-xl hover:bg-primary/5 transition-colors text-left shadow-sm"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                    {/* Image Upload for Vision Step */}
                    {messages.length > 0 && messages[messages.length - 1].type === 'image_upload' && (
                        <div className="flex justify-center p-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition-colors">
                                <ImagePlus className="w-8 h-8 text-primary mb-2" />
                                <span className="text-sm text-primary font-medium">사진 업로드하기</span>
                                <input type="file" className="hidden" accept="image/*" onChange={() => handleScenarioStep('vision_analyzing')} />
                            </label>
                        </div>
                    )}

                    <form onSubmit={handleInputSubmit} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                            disabled={messages[messages.length - 1]?.type !== 'input'}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="active:scale-95 transition-transform bg-primary text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
