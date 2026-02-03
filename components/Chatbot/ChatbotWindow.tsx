"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/chatbot/types";
import { SCENARIO } from "@/lib/chatbot/scenario";
import { cn } from "@/lib/utils";
import { X, Send, ImagePlus, User } from "lucide-react";

export function ChatbotWindow() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: 'init',
        role: 'bot',
        text: "안녕하세요! 하루인플란트의 귀염둥이 상담실장 '하루'예요! 😘 궁금한 점이 있으시면 편하게 말씀해주세요! (예: 임플란트 가격, 아프지 않은 치과 등)"
    }]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasSwitchedToAI, setHasSwitchedToAI] = useState(false);

    // Additional state for lead collection
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    // Handle Scenario Step (Rule-based)
    const handleScenarioStep = (stepId: string) => {
        // Special Trigger for External Modals
        if (stepId === 'consultation_form_trigger') {
            const event = new CustomEvent("openChatbot", { detail: { mode: 'consultation_form' } });
            window.dispatchEvent(event);
            return;
        }

        const scenario = SCENARIO[stepId];
        if (!scenario) return;

        // setCurrentStep(stepId); // We might not need state for this if mixed with AI, but good for tracking

        // Resolve dynamic text if function
        let resolvedText = scenario.text;
        // @ts-ignore
        if (typeof scenario.text === 'function') {
            // @ts-ignore
            resolvedText = scenario.text(leadData['name'] || '고객');
        }

        const newMsg: ChatMessage = { ...scenario, text: resolvedText as string };
        setMessages(prev => [...prev, newMsg]);

        // If it's the final lead step, submit to backend
        if (stepId === 'lead_final') {
            submitLead();
        }

        // If vision analyzing, simulate delay then jump
        if (stepId === 'vision_analyzing') {
            setTimeout(() => {
                handleScenarioStep(scenario.nextStep || 'vision_result_ment');
            }, 2500);
        }
    };

    const submitLead = async () => {
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadData.name || "Unknown",
                    phone: leadData.phone || "000-0000-0000",
                    treatment_type: "Consultation Call",
                    email: ""
                })
            });
        } catch (error) {
            console.error("Failed to submit lead:", error);
        }
    };

    // Handle Quick Options (Rule-based to AI transition)
    const handleOptionClick = (option: { label: string; value: string; nextStep?: string }) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: option.label };
        setMessages(prev => [...prev, userMsg]);

        // Special checking for triggers
        if (option.value === 'consult_form') {
            triggerConsultationModal();
            // Add a bot message saying "Opening..."
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "상담 신청서를 열어드렸어요! 예쁘게 작성해주세요~ 😘" }]);
            }, 500);
            return;
        }

        // If it's the first interaction, we might want to transition to AI or stick to scenario for one step
        // For simplicity and "AI persona" requirement, let's switch to AI immediately for most things
        // OR follow the scenario until it runs out. 
        // Given the request for "Free conversation AI", let's switch to AI unless it's a specific functional flow like Vision.

        if (option.nextStep) {
            handleScenarioStep(option.nextStep);
        } else if (option.value === 'vision') {
            handleAIResponse(option.label);
        } else if (option.value === 'start_consultation') {
            handleScenarioStep('lead_name');
        } else {
            handleAIResponse(option.label);
        }
    };

    const triggerConsultationModal = () => {
        const event = new CustomEvent("openChatbot", { detail: { mode: 'consultation_form' } });
        window.dispatchEvent(event);
    };

    const triggerVisionModal = () => {
        // Since we don't have a separate vision modal, we simulate it in chat or alert user
        // For now, let's just ask for upload in chat (simulated) or say it's opening
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'bot',
            text: "치아 사진을 올려주시면 제가 봐드릴게요! (업로드 버튼을 눌러주세요 📸)",
            type: 'image_upload'
        }]);
    };

    const handleInputSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const lastMsg = messages[messages.length - 1];
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // If the last message was an input requirement from scenario
        if (lastMsg?.type === 'input' && lastMsg.inputKey) {
            const newLeadData = { ...leadData, [lastMsg.inputKey]: inputValue };
            setLeadData(newLeadData);

            if (lastMsg.options?.[0]?.nextStep) {
                handleScenarioStep(lastMsg.options[0].nextStep);
            }
        } else {
            handleAIResponse(inputValue);
        }
    };

    const handleAIResponse = async (userText: string) => {
        setIsTyping(true);
        setHasSwitchedToAI(true);

        try {
            // Filter messages for history (remove complex objects, keep text)
            const history = messages
                .filter(m => typeof m.text === 'string')
                .map(m => ({ role: m.role, text: m.text as string }));

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history })
            });

            const data = await res.json();

            if (data.action === 'open_consultation') {
                triggerConsultationModal();
            } else if (data.action === 'open_vision') {
                triggerVisionModal();
            }

            const botMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'bot',
                text: data.text,
                options: data.action === 'open_consultation' ? [
                    { label: "📝 빠른 상담 신청하기", value: "start_consultation" }
                ] : undefined
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "앗, 잠시 통신이 불안정해요! 다시 말해줄래요? 😵" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: "📸 사진을 보낼게요! 진단 부탁드려요."
        };
        setMessages(prev => [...prev, userMsg]);

        // Reset input
        if (e.target) e.target.value = "";

        // Call AI with context or use scenario
        handleScenarioStep('vision_analyzing');
    };

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            // Unified entry: No mode-specific logic, no resets. 
            // The chatbot will simply open with its current state or initial greeting.
        };
        window.addEventListener('openChatbot', handleOpen);
        return () => window.removeEventListener('openChatbot', handleOpen);
    }, []);


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
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex w-full mb-4 justify-start">
                            <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-white mr-2 shrink-0">
                                <span className="text-xs font-bold">Bot</span>
                            </div>
                            <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 p-3 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show Quick Options ONLY if it's the very last message AND it has options AND we haven't switched to full AI mode yet (or pure option flow) */}
                    {messages.length > 0 && !isTyping && messages[messages.length - 1].options && (
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
                    <form onSubmit={handleInputSubmit} className="flex gap-2 items-center relative">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-primary transition-colors active:scale-95"
                            title="사진 업로드"
                        >
                            <ImagePlus className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
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
