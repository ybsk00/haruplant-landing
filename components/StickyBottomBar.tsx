"use client";

import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function StickyBottomBar() {
    const handleClick = () => {
        // Scroll to chat section
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setTimeout(() => {
                const chatInput = chatSection.querySelector('input[type="text"]') as HTMLInputElement;
                if (chatInput) {
                    chatInput.focus();
                }
            }, 500);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] block md:hidden">
            <button
                className={cn(
                    "w-full flex items-center justify-center gap-2 h-14 rounded-xl",
                    "bg-secondary text-white font-bold text-lg shadow-lg",
                    "active:scale-[0.98] transition-all animate-bounce-subtle"
                )}
                onClick={handleClick}
            >
                <Calculator className="w-6 h-6" />
                <span>내 견적 &amp; 혜택 확인하기</span>
            </button>
        </div>
    );
}
