"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/lib/chatbot/types";
import { SCENARIO } from "@/lib/chatbot/scenario";
import { cn } from "@/lib/utils";
import { X, Send, ImagePlus, User, MessageCircle, ChevronDown } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { QuickBookingModal } from "@/components/QuickBookingModal";

// Initial greeting without emojis
const INITIAL_MESSAGE: ChatMessage = {
    id: 'init',
    role: 'bot',
    text: "안녕하세요! 하루임플란트치과 상담실장 '하루'입니다. 궁금한 점이 있으시면 편하게 말씀해주세요. (임플란트, 비용, 진단 등)"
};

export function ChatbotWindow() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasSwitchedToAI, setHasSwitchedToAI] = useState(false);

    // Visitor and registration state
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Additional state for lead collection
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState("");
    // messagesEndRef removed

    // Initialize visitor on mount
    useEffect(() => {
        const initVisitor = async () => {
            try {
                // Create or get visitor
                const res = await fetch('/api/visitors', { method: 'POST' });
                const data = await res.json();
                if (data.success && data.visitorId) {
                    setVisitorId(data.visitorId);

                    // Check registration status
                    const leadRes = await fetch(`/api/leads?visitorId=${data.visitorId}`);
                    const leadData = await leadRes.json();
                    if (leadData.isRegistered && leadData.lead) {
                        setIsRegistered(true);
                        setUserName(leadData.lead.name);
                    }
                }
            } catch (error) {
                console.error("Failed to initialize visitor:", error);
            }
        };
        initVisitor();
    }, []);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            chatContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping, showRegistrationForm]);

    // Handle Scenario Step (Rule-based)
    const handleScenarioStep = useCallback((stepId: string) => {
        // Special Trigger for External Modals
        if (stepId === 'consultation_form_trigger') {
            if (isRegistered) {
                setShowBookingModal(true);
            } else {
                setShowRegistrationForm(true);
            }
            return;
        }

        const scenario = SCENARIO[stepId];
        if (!scenario) return;

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
    }, [isRegistered, leadData]);

    const submitLead = async () => {
        if (!visitorId) return;

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadData.name || "Unknown",
                    phone: leadData.phone || "000-0000-0000",
                    privacyAgreed: true,
                    visitorId
                })
            });
            setIsRegistered(true);
            setUserName(leadData.name || '고객');
        } catch (error) {
            console.error("Failed to submit lead:", error);
        }
    };

    // Handle Quick Options (Rule-based to AI transition)
    const handleOptionClick = (option: { label: string; value: string; nextStep?: string }) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: option.label };
        setMessages(prev => [...prev, userMsg]);

        // Special checking for triggers
        if (option.value === 'consult_form' || option.value === 'start_consultation') {
            if (isRegistered) {
                setShowBookingModal(true);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'bot',
                        text: "상담 예약 창을 열어드렸습니다."
                    }]);
                }, 500);
            } else {
                setShowRegistrationForm(true);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'bot',
                        text: "상담을 위해 먼저 간단한 정보를 입력해주세요."
                    }]);
                }, 500);
            }
            return;
        }

        if (option.nextStep) {
            handleScenarioStep(option.nextStep);
        } else if (option.value === 'vision') {
            handleAIResponse(option.label);
        } else {
            handleAIResponse(option.label);
        }
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

            const botMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'bot',
                text: data.text,
                options: data.action === 'open_consultation' ? [
                    { label: "빠른 상담 신청하기", value: "start_consultation" }
                ] : undefined
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "잠시 통신이 불안정합니다. 다시 말씀해주세요." }]);
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
            text: "사진을 보내드립니다. 진단 부탁드려요."
        };
        setMessages(prev => [...prev, userMsg]);

        // Reset input
        if (e.target) e.target.value = "";

        // Call AI with context or use scenario
        handleScenarioStep('vision_analyzing');
    };

    // Handle registration success
    const handleRegistrationSuccess = (name: string, phone: string) => {
        setIsRegistered(true);
        setUserName(name);
        setShowRegistrationForm(false);

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'bot',
            text: `${name}님, 등록이 완료되었습니다. 상담 예약을 진행하시겠습니까?`,
            options: [
                { label: "예, 상담 예약합니다", value: "start_consultation" }
            ]
        }]);
    };

    // Handle booking success
    const handleBookingSuccess = () => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'bot',
            text: `${userName}님, 상담 예약이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다. 좋은 하루 보내세요.`
        }]);
    };

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };
        window.addEventListener('openChatbot', handleOpen);
        return () => window.removeEventListener('openChatbot', handleOpen);
    }, []);

    // Bottom fixed chat panel - collapsed state (floating button)
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[90] size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                aria-label="채팅 열기"
            >
                <MessageCircle className="w-7 h-7" />
            </button>
        );
    }

    // Minimized state
    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 z-[100]">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="w-full sm:w-[380px] bg-primary text-white p-4 sm:rounded-2xl shadow-lg flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm">하루 실장님이 대화중</p>
                            <p className="text-xs text-blue-200">클릭하여 대화창 열기</p>
                        </div>
                    </div>
                    <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
            </div>
        );
    }

    // Full chat panel - bottom fixed
    return (
        <>
            <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 z-[100] pointer-events-auto">
                <div className="w-full sm:w-[380px] h-[85dvh] sm:h-[550px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">하루 실장님이 상담중</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-200 flex items-center gap-1">
                                        <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                        {isRegistered ? `${userName}님 환영합니다` : '실시간 답변 대기중'}
                                    </span>
                                    {isRegistered && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await fetch('/api/auth/logout', { method: 'POST' });
                                                    // Reset state
                                                    setIsRegistered(false);
                                                    setUserName('');
                                                    setVisitorId(null);
                                                    setMessages([INITIAL_MESSAGE]);

                                                    // Re-init visitor
                                                    const res = await fetch('/api/visitors', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (data.success) setVisitorId(data.visitorId);
                                                } catch (error) {
                                                    console.error("Logout failed:", error);
                                                }
                                            }}
                                            className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded transition-colors"
                                        >
                                            로그아웃
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                                title="최소화"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                                title="닫기"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex w-full mb-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                {msg.role === 'bot' && (
                                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-white mr-2 shrink-0">
                                        <span className="text-xs font-bold">하루</span>
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
                                    <span className="text-xs font-bold">하루</span>
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

                        {/* Show Registration Form inline */}
                        {showRegistrationForm && visitorId && (
                            <div className="pl-10">
                                <RegistrationForm
                                    visitorId={visitorId}
                                    onSuccess={handleRegistrationSuccess}
                                    onCancel={() => setShowRegistrationForm(false)}
                                />
                            </div>
                        )}

                        {/* Show Quick Options ONLY if it's the very last message AND it has options AND we're not showing registration */}
                        {messages.length > 0 && !isTyping && !showRegistrationForm && messages[messages.length - 1].options && (
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

            {/* Quick Booking Modal */}
            {visitorId && (
                <QuickBookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    visitorId={visitorId}
                    userName={userName}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </>
    );
}
