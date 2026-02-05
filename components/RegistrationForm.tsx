"use client";

import { useState } from 'react';
import { Check } from 'lucide-react';
import { getUTMs, pixelEvent } from '@/lib/tracking';

interface RegistrationFormProps {
    visitorId: string;
    onSuccess: (name: string, phone: string) => void;
    onCancel?: () => void;
}

export function RegistrationForm({ visitorId, onSuccess, onCancel }: RegistrationFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        privacyAgreed: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError("성함을 입력해주세요.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("전화번호를 입력해주세요.");
            return;
        }

        if (!formData.privacyAgreed) {
            setError("개인정보 수집 및 이용에 동의해주세요.");
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
                    privacyAgreed: formData.privacyAgreed,
                    visitorId,
                    ...getUTMs()
                })
            });

            const data = await res.json();

            if (data.success) {
                // 트래킹 이벤트 전송
                pixelEvent('Lead', {
                    content_name: 'Chatbot Registration',
                    currency: 'KRW',
                    value: 0
                });
                onSuccess(formData.name, formData.phone);
            } else {
                setError(data.error || "등록에 실패했습니다. 다시 시도해주세요.");
            }
        } catch {
            setError("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">회원 등록</h3>
            <p className="text-sm text-gray-500 mb-4">
                상담을 위해 연락처를 남겨주세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input
                        type="text"
                        placeholder="성함"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <input
                        type="tel"
                        placeholder="전화번호 (예: 010-1234-5678)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <label className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.privacyAgreed}
                        onChange={(e) => setFormData({ ...formData, privacyAgreed: e.target.checked })}
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                        수집된 정보는 예약관리 및 상담목적으로만 사용되며 <span className="font-semibold text-primary">30일 이후 자동 삭제</span>됩니다.
                    </span>
                </label>

                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? '처리중...' : (
                            <>
                                <Check className="w-4 h-4" />
                                등록하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
