"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Lock, Hand } from 'lucide-react';

interface ImplantSimulationProps {
    needSrc?: string;
    restoredSrc?: string;
    isLoggedIn: boolean;
    aspectRatio?: "16/9" | "4/3" | "1/1";
    hintTextMobile?: string;
    hintTextDesktop?: string;
    showHint?: boolean;
    overlayLoginGate?: boolean;
    onLoginClick?: () => void;
}

export function ImplantSimulation({
    needSrc = "/plant_before.png",
    restoredSrc = "/plant_after.png",
    isLoggedIn,
    aspectRatio = "16/9",
    hintTextMobile = "길게 눌러서 미리보기",
    hintTextDesktop = "클릭을 누르고 있는 동안 미리보기",
    showHint = true,
    overlayLoginGate = true,
    onLoginClick
}: ImplantSimulationProps) {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Pointer event handlers
    const handlePointerDown = useCallback(() => {
        if (isLoggedIn) {
            setIsPreviewing(true);
        }
    }, [isLoggedIn]);

    const handlePointerUp = useCallback(() => {
        setIsPreviewing(false);
    }, []);

    const handlePointerCancel = useCallback(() => {
        setIsPreviewing(false);
    }, []);

    const handlePointerLeave = useCallback(() => {
        setIsPreviewing(false);
        setIsHovering(false);
    }, []);

    const handlePointerEnter = useCallback(() => {
        if (isLoggedIn) {
            setIsHovering(true);
        }
    }, [isLoggedIn]);

    const handleClick = useCallback(() => {
        if (!isLoggedIn && onLoginClick) {
            onLoginClick();
        }
    }, [isLoggedIn, onLoginClick]);

    // Aspect ratio styles
    const aspectRatioClass = {
        "16/9": "aspect-[16/9]",
        "4/3": "aspect-[4/3]",
        "1/1": "aspect-square"
    }[aspectRatio];

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-2xl shadow-lg select-none",
                aspectRatioClass,
                isLoggedIn ? "cursor-pointer" : "cursor-not-allowed"
            )}
            style={{ touchAction: 'manipulation' }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerLeave}
            onPointerEnter={handlePointerEnter}
            onClick={handleClick}
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

            {/* Login Gate Overlay (before login) */}
            {!isLoggedIn && overlayLoginGate && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
                    <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-white text-sm font-medium text-center px-4">
                        로그인 후 시뮬레이션 확인
                    </p>
                    <button
                        className="mt-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLoginClick?.();
                        }}
                    >
                        로그인하기
                    </button>
                </div>
            )}

            {/* Hint text overlay (after login) */}
            {isLoggedIn && showHint && !isPreviewing && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
                    <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                        <Hand className="w-4 h-4" />
                        {/* Show different hint based on hover state (desktop vs mobile) */}
                        <span className="hidden sm:inline">
                            {isHovering ? hintTextDesktop : hintTextDesktop}
                        </span>
                        <span className="sm:hidden">
                            {hintTextMobile}
                        </span>
                    </div>
                </div>
            )}

            {/* Preview active indicator */}
            {isLoggedIn && isPreviewing && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        복원 미리보기
                    </div>
                </div>
            )}

            {/* Light sweep effect on preview start */}
            {isLoggedIn && isPreviewing && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-sweep" />
                </div>
            )}

            {/* Status labels */}
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
        </div>
    );
}
