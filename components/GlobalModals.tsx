"use client";

import { useEffect, useState } from "react";
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
            <ConsultationModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />
        </>
    );
}
