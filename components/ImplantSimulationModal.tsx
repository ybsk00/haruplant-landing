"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X, Hand } from 'lucide-react';

interface ImplantSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    needSrc?: string;
    restoredSrc?: string;
    hintTextMobile?: string;
    hintTextDesktop?: string;
}

export function ImplantSimulationModal({
    isOpen,
    onClose,
    needSrc = "/plant_before.png",
    restoredSrc = "/plant_after.png",
    hintTextMobile = "길게 눌러서 복원 후 미리보기",
    hintTextDesktop = "클릭을 누르고 있는 동안 복원 후 미리보기"
}: ImplantSimulationModalProps) {
    const [isPreviewing, setIsPreviewing] = useState(false);

    // Pointer event handlers
    const handlePointerDown = useCallback(() => {
        setIsPreviewing(true);
    }, []);

    const handlePointerUp = useCallback(() => {
        setIsPreviewing(false);
    }, []);

    const handlePointerCancel = useCallback(() => {
        setIsPreviewing(false);
    }, []);

    const handlePointerLeave = useCallback(() => {
        setIsPreviewing(false);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[95%] max-w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">AI 임플란트 시뮬레이션</h3>
                        <p className="text-sm text-gray-500">임플란트 전/후 모습을 미리 확인해보세요</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Simulation Area */}
                <div
                    className="relative w-full aspect-[16/9] select-none cursor-pointer"
                    style={{ touchAction: 'manipulation' }}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    onPointerLeave={handlePointerLeave}
                >
                    {/* Before Image (Need) */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            isPreviewing ? "opacity-0" : "opacity-100"
                        )}
                    >
                        <Image
                            src={needSrc}
                            alt="임플란트 필요 상태"
                            fill
                            className="object-cover"
                            priority
                            draggable={false}
                        />
                    </div>

                    {/* After Image (Restored) */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            isPreviewing ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <Image
                            src={restoredSrc}
                            alt="임플란트 복원 상태"
                            fill
                            className="object-cover"
                            priority
                            draggable={false}
                        />
                    </div>

                    {/* Status label */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-full shadow-lg transition-all duration-300",
                            isPreviewing
                                ? "bg-green-500 text-white"
                                : "bg-red-500/90 text-white"
                        )}>
                            {isPreviewing ? "복원 후" : "복원 전"}
                        </div>
                    </div>

                    {/* Preview active indicator */}
                    {isPreviewing && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                                미리보기 중
                            </div>
                        </div>
                    )}

                    {/* Light sweep effect on preview start */}
                    {isPreviewing && (
                        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-sweep" />
                        </div>
                    )}

                    {/* Hint overlay */}
                    {!isPreviewing && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
                            <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                                <Hand className="w-4 h-4" />
                                <span className="hidden sm:inline">{hintTextDesktop}</span>
                                <span className="sm:hidden">{hintTextMobile}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        실제 결과는 개인별 치아 상태에 따라 다를 수 있습니다. 정확한 진단은 전문의 상담을 받으세요.
                    </p>
                </div>
            </div>
        </div>
    );
}
