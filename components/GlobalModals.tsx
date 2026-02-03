"use client";

import { useEffect, useState } from "react";
import { ChatbotWindow } from "@/components/Chatbot/ChatbotWindow";
import { ConsultationModal } from "@/components/ConsultationModal";

export function GlobalModals() {
    const [isConsultationOpen, setIsConsultationOpen] = useState(false);

    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            if (e.detail?.mode === 'consultation_form') {
                setIsConsultationOpen(true);
            }
        };
        window.addEventListener('openChatbot', handleOpen as EventListener);
        return () => window.removeEventListener('openChatbot', handleOpen as EventListener);
    }, []);

    return (
        <>
            <ChatbotWindow />
            <ConsultationModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />
        </>
    );
}
