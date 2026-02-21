
export const META_PIXEL_ID = 'YOUR_PIXEL_ID'; // 교체 필요
export const GA_TRACKING_ID = 'G-XXXXXXXX';   // 교체 필요

// UTM 파라미터 타입 정의
export interface UTMParams {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
}

// 쿠키 헬퍼
function setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * URL 파라미터에서 UTM 정보를 추출하여 쿠키에 저장하고, 
 * 서버 API를 호출하여 방문자 DB에도 업데이트합니다.
 */
export async function persistUTMs() {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    let hasUTM = false;
    const utmData: Record<string, string | null> = {};

    // 1. URL에서 UTM 추출 및 쿠키 저장 (30일)
    utmFields.forEach(field => {
        const value = urlParams.get(field);
        if (value) {
            hasUTM = true;
            setCookie(field, value, 30);
            utmData[field] = value;
        } else {
            // URL에 없으면 쿠키에서 가져옴
            utmData[field] = getCookie(field);
        }
    });

    // 2. UTM 정보가 새로 유입되었거나 쿠키에 있다면 DB 업데이트 시도
    if (hasUTM) {
        try {
            // visitor_id 쿠키가 있는지 확인
            const visitorId = getCookie('visitor_id');
            if (visitorId) {
                await fetch('/api/visitors', {
                    method: 'PATCH', // POST 대신 PATCH 사용 (업데이트)
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitorId,
                        ...utmData
                    })
                });
            }
        } catch (e) {
            console.error('Failed to update visitor UTMs:', e);
        }
    }
}

/**
 * 현재 저장된 UTM 정보를 가져옵니다.
 */
export function getUTMs(): UTMParams {
    if (typeof window === 'undefined') {
        return {
            utm_source: null,
            utm_medium: null,
            utm_campaign: null,
            utm_content: null,
            utm_term: null
        };
    }

    return {
        utm_source: getCookie('utm_source'),
        utm_medium: getCookie('utm_medium'),
        utm_campaign: getCookie('utm_campaign'),
        utm_content: getCookie('utm_content'),
        utm_term: getCookie('utm_term'),
    };
}

/**
 * 픽셀 이벤트 전송
 * @param eventName 표준 이벤트 이름 (Lead, CompleteRegistration, etc.)
 * @param data 추가 데이터
 */
export function pixelEvent(eventName: string, data: any = {}) {
    if (typeof window !== 'undefined') {
        // Meta Pixel
        if ((window as any).fbq) {
            (window as any).fbq('track', eventName, data);
        }

        // Google Analytics (GA4)
        if ((window as any).gtag) {
            (window as any).gtag('event', eventName, data);
        }

        // Naver, Kakao 등 추가 가능
        console.log(`[Pixel] ${eventName} fired`, data);
    }
}
