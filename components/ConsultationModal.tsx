"use client";

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUTMs, pixelEvent } from '@/lib/tracking';

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        treatmentType: '임플란트',
        agreement: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreement) {
            alert("개인정보 제공에 동의해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    treatmentType: formData.treatmentType,
                    source: 'consultation_form',
                    ...getUTMs()
                })
            });
            if (res.ok) {
                // 트래킹 이벤트 전송
                pixelEvent('Lead', {
                    content_name: formData.treatmentType,
                    currency: 'KRW',
                    value: 0
                });

                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setFormData({ name: '', phone: '', email: '', treatmentType: '임플란트', agreement: false });
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full sm:w-[480px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900">빠른 상담 신청</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[80vh] sm:max-h-none">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                            <div className="size-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">상담 신청이 완료되었습니다!</h3>
                            <p className="text-gray-500">빠른 시일 내에 전문 상담원이<br />연락드리겠습니다.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">치과 치료 항목</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white font-medium text-gray-800"
                                    value={formData.treatmentType}
                                    onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                                >
                                    <option value="임플란트">임플란트</option>
                                    <option value="치아교정">치아교정</option>
                                    <option value="충치치료">충치치료</option>
                                    <option value="라미네이트">라미네이트</option>
                                    <option value="사랑니발치">사랑니발치</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">성명</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">전화번호</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
                                    placeholder="010-1234-5678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">이메일</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        required
                                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                        checked={formData.agreement}
                                        onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-600 leading-relaxed">
                                        <span className="font-bold text-gray-800">개인정보 제공에 동의합니다.</span><br />
                                        수집된 정보는 상담 목적 외에는 사용되지 않으며, 이용 목적 달성 시 즉시 파기됩니다.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isSubmitting ? '처리중...' : '상담 신청하기'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
