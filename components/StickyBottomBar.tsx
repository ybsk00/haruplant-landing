"use client";

import { useState } from "react";
import { MessageCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
// Chatbot trigger will be added here later

export function StickyBottomBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] block md:hidden">
                <button
                    className={cn(
                        "w-full flex items-center justify-center gap-2 h-14 rounded-xl",
                        "bg-secondary text-white font-bold text-lg shadow-lg",
                        "active:scale-[0.98] transition-all animate-bounce-subtle"
                    )}
                    onClick={() => {
                        // Trigger Chatbot
                        const event = new CustomEvent("openChatbot", { detail: { mode: "quote" } });
                        window.dispatchEvent(event);
                    }}
                >
                    <Calculator className="w-6 h-6" />
                    <span>내 견적 & 혜택 확인하기</span>
                </button>
            </div>

            {/* Desktop Floating Button */}
            <div className="fixed bottom-10 right-10 z-50 hidden md:flex flex-col gap-4">
                <button
                    className="flex items-center justify-center size-16 rounded-full bg-secondary text-white shadow-xl hover:translate-y-[-4px] transition-transform"
                    onClick={() => {
                        const event = new CustomEvent("openChatbot", { detail: { mode: "general" } });
                        window.dispatchEvent(event);
                    }}
                >
                    <MessageCircle className="size-8" />
                </button>
            </div>
        </>
    );
}
