"use client";

import { MessageCircle } from "lucide-react";

export function FloatingChatButton() {
    const handleClick = () => {
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
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-[90] size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label="채팅으로 이동"
        >
            <MessageCircle className="w-7 h-7" />
        </button>
    );
}
