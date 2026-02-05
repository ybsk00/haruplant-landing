"use client";

import { useEffect } from "react";
import { persistUTMs } from "@/lib/tracking";

export function TrackingInitializer() {
    useEffect(() => {
        // 페이지 로드 시 URL의 UTM 파라미터를 쿠키 및 DB에 저장
        persistUTMs();
    }, []);

    return null;
}
