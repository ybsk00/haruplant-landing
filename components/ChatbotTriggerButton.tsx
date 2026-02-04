"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChatbotTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    mode?: "general" | "quote" | "vision" | "consultation_form";
}

export function ChatbotTriggerButton({ children, className, mode = "general", ...props }: ChatbotTriggerButtonProps) {
    const handleClick = () => {
        // Scroll to chat section
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus on chat input after scroll
            setTimeout(() => {
                const chatInput = chatSection.querySelector('input[type="text"]') as HTMLInputElement;
                if (chatInput) {
                    chatInput.focus();
                }
            }, 500);
        }

        // Also dispatch event for any listeners (e.g., consultation form mode)
        if (mode === 'consultation_form') {
            const event = new CustomEvent("openChatbot", { detail: { mode } });
            window.dispatchEvent(event);
        }
    };

    return (
        <button
            className={cn("cursor-pointer transition-all active:scale-95", className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
}
