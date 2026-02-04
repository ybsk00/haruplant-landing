"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/lib/chatbot/types";
import { SCENARIO } from "@/lib/chatbot/scenario";
import { cn } from "@/lib/utils";
import { Send, ImagePlus, User, MessageCircle } from "lucide-react";

// Inline Registration Form Component
function InlineRegistrationForm({ onSubmit, isSubmitting }: { onSubmit: (name: string, phone: string) => void; isSubmitting: boolean }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && agreed) {
            onSubmit(name, phone);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                />
            </div>
            <div>
                <input
                    type="tel"
                    placeholder="전화번호 (예: 010-1234-5678)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                />
            </div>
            <label className="flex items-start gap-2 text-xs text-gray-600">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5"
                    required
                />
                <span>수집된 정보는 예약관리 및 상담목적으로만 사용되며 30일 이후 자동 삭제됩니다.</span>
            </label>
            <button
                type="submit"
                disabled={!name || !phone || !agreed || isSubmitting}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
                {isSubmitting ? '처리중...' : '상담 신청하기'}
            </button>
        </form>
    );
}

// Initial greeting without emojis
const INITIAL_MESSAGE: ChatMessage = {
    id: 'init',
    role: 'bot',
    text: "안녕하세요! 하루임플란트치과 상담실장 '하루'입니다. 궁금한 점이 있으시면 편하게 말씀해주세요. (임플란트, 비용, 진단 등)"
};

export function ChatSection() {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasSwitchedToAI, setHasSwitchedToAI] = useState(false);

    // Visitor and registration state
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [userPhone, setUserPhone] = useState<string>('');
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Additional state for lead collection
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize visitor on mount
    useEffect(() => {
        const initVisitor = async () => {
            try {
                const res = await fetch('/api/visitors', { method: 'POST' });
                const data = await res.json();
                if (data.success && data.visitorId) {
                    setVisitorId(data.visitorId);

                    const leadRes = await fetch(`/api/leads?visitorId=${data.visitorId}`);
                    const leadData = await leadRes.json();
                    if (leadData.isRegistered && leadData.lead) {
                        setIsRegistered(true);
                        setUserName(leadData.lead.name);
                        setUserPhone(leadData.lead.phone || '');
                    }
                }
            } catch (error) {
                console.error("Failed to initialize visitor:", error);
            }
        };
        initVisitor();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    // Handle Scenario Step (Rule-based)
    const handleScenarioStep = useCallback((stepId: string) => {
        const scenario = SCENARIO[stepId];
        if (!scenario) return;

        let resolvedText = scenario.text;
        // @ts-ignore
        if (typeof scenario.text === 'function') {
            // @ts-ignore
            resolvedText = scenario.text(leadData['name'] || '고객');
        }

        const newMsg: ChatMessage = { ...scenario, text: resolvedText as string };
        setMessages(prev => [...prev, newMsg]);

        if (stepId === 'vision_analyzing') {
            setTimeout(() => {
                handleScenarioStep(scenario.nextStep || 'vision_result_ment');
            }, 2500);
        }
    }, [leadData]);

    // Handle Quick Options
    const handleOptionClick = async (option: { label: string; value: string; nextStep?: string }) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: option.label };
        setMessages(prev => [...prev, userMsg]);

        if (option.value === 'consult_form' || option.value === 'start_consultation') {
            if (isRegistered && userName && visitorId) {
                // Logged in: submit consultation directly
                setIsSubmitting(true);
                try {
                    const res = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            visitorId,
                            service: 'consultation',
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        const botMsg: ChatMessage = {
                            id: Date.now().toString(),
                            role: 'bot',
                            text: `${userName}님, 상담신청이 완료되었습니다. 빠른 시일내 통화 혹은 문자로 예약 관련 안내 연락을 드리겠습니다.`
                        };
                        setMessages(prev => [...prev, botMsg]);
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    console.error('Booking error:', error);
                    const botMsg: ChatMessage = {
                        id: Date.now().toString(),
                        role: 'bot',
                        text: '상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.'
                    };
                    setMessages(prev => [...prev, botMsg]);
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                // Not logged in: show inline registration form
                setShowInlineForm(true);
                const botMsg: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'bot',
                    text: '상담 신청을 위해 연락처를 입력해주세요.'
                };
                setMessages(prev => [...prev, botMsg]);
            }
            return;
        }

        if (option.nextStep) {
            handleScenarioStep(option.nextStep);
        } else {
            handleAIResponse(option.label);
        }
    };

    // Handle inline form submission
    const handleInlineFormSubmit = async (name: string, phone: string) => {
        if (!visitorId) return;
        setIsSubmitting(true);
        try {
            // First register the lead
            const leadRes = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId, name, phone, privacyAgreed: true })
            });
            const leadData = await leadRes.json();
            if (!leadData.success) throw new Error(leadData.error);

            // Then create booking
            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    service: 'consultation',
                })
            });
            const bookingData = await bookingRes.json();
            if (bookingData.success) {
                setIsRegistered(true);
                setUserName(name);
                setUserPhone(phone);
                setShowInlineForm(false);
                const botMsg: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'bot',
                    text: `${name}님, 예약이 완료되었습니다. 빠른 시일내 통화 혹은 문자로 예약 관련 안내 연락을 드리겠습니다.`
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error(bookingData.error);
            }
        } catch (error) {
            console.error('Registration/Booking error:', error);
            const botMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'bot',
                text: '상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const lastMsg = messages[messages.length - 1];
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

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

        if (e.target) e.target.value = "";
        handleScenarioStep('vision_analyzing');
    };

    return (
        <section id="chat-section" className="w-full bg-white py-12 border-t border-gray-100">
            <div className="mx-auto flex flex-col px-5 md:px-10 lg:px-40">
                <div className="max-w-[960px] w-full mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-8">
                        <span className="text-primary font-bold tracking-wider text-sm uppercase">Consultation</span>
                        <h2 className="text-[#101418] tracking-tight text-[28px] md:text-[32px] font-bold leading-tight mt-2">
                            하루 실장님과 상담하기
                        </h2>
                        <p className="text-[#5e748d] text-base font-normal leading-normal mt-2">
                            임플란트에 대해 궁금한 점을 물어보세요. 상담실장이 친절하게 답변해드립니다.
                        </p>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f7ff] rounded-2xl border border-blue-100 shadow-soft overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-primary p-4 text-white flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">하루 실장님</h3>
                                <span className="text-xs text-blue-200 flex items-center gap-1">
                                    <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                    {isRegistered ? `${userName}님 환영합니다` : '실시간 답변 대기중'}
                                </span>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
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

                            {/* Quick Options */}
                            {messages.length > 0 && !isTyping && !showInlineForm && messages[messages.length - 1].options && (
                                <div className="flex flex-wrap gap-2 mt-2 pl-10">
                                    {messages[messages.length - 1].options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionClick(opt)}
                                            disabled={isSubmitting}
                                            className="bg-white border border-primary/20 text-primary text-sm font-medium py-2 px-4 rounded-xl hover:bg-primary/5 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Inline Registration Form */}
                            {showInlineForm && (
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm ml-10">
                                    <InlineRegistrationForm
                                        onSubmit={handleInlineFormSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleInputSubmit} className="flex gap-2 items-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
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
                                    className="bg-primary text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
