"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChatbotTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    mode?: "general" | "quote" | "vision" | "consultation_form";
}

export function ChatbotTriggerButton({ children, className, mode = "general", ...props }: ChatbotTriggerButtonProps) {
    return (
        <button
            className={cn("cursor-pointer transition-all active:scale-95", className)}
            onClick={() => {
                const event = new CustomEvent("openChatbot", { detail: { mode } });
                window.dispatchEvent(event);
            }}
            {...props}
        >
            {children}
        </button>
    );
}
