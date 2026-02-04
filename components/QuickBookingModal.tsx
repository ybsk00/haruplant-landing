"use client";

import { useState } from 'react';
import { X, Check, Calendar } from 'lucide-react';

interface QuickBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitorId: string;
    userName: string;
    onSuccess: () => void;
}

export function QuickBookingModal({ isOpen, onClose, visitorId, userName, onSuccess }: QuickBookingModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service: 'implant',
                    visitorId
                })
            });

            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setIsSuccess(false);
                }, 2000);
            } else {
                alert(data.error || "예약에 실패했습니다. 다시 시도해주세요.");
            }
        } catch {
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[90%] max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {isSuccess ? (
                    <div className="p-8 text-center">
                        <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">예약 완료</h3>
                        <p className="text-gray-500">
                            {userName}님, 상담 예약이 완료되었습니다.<br />
                            곧 연락드리겠습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-gray-900">상담 예약</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-center">
                            <p className="text-gray-700 mb-6">
                                <span className="font-bold text-primary">{userName}</span>님,<br />
                                상담 예약을 진행하시겠습니까?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    아니요
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 text-white bg-primary rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '처리중...' : '예, 예약합니다'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
