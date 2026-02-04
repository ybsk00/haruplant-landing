import { ChatMessage } from "./types";

export const SCENARIO: Record<string, ChatMessage> = {
    root: {
        id: 'root',
        role: 'bot',
        text: "안녕하세요! 하루임플란트치과 상담실장 '하루'입니다.\n궁금한 점이 있으시면 편하게 말씀해주세요. (임플란트, 비용, 진단 등)",
        type: 'text'
    },
    // Special step that triggers the modal
    consultation_form_trigger: {
        id: 'consultation_form_trigger',
        role: 'bot',
        text: "상담 신청 페이지를 띄워드릴게요. 잠시만요...",
        type: 'text'
    },
    angtal_1: {
        id: 'angtal_1',
        role: 'bot',
        text: "잠깐만요, 가시려구요?\n저랑 딱 1분만 이야기해요. 정말 좋은 혜택 안내해드릴 수 있어요.",
        type: 'options',
        options: [
            { label: '그래, 뭔데?', value: 'listen', nextStep: 'quote_start' },
            { label: '바빠요', value: 'busy', nextStep: 'angtal_2' }
        ]
    },
    angtal_2: {
        id: 'angtal_2',
        role: 'bot',
        text: "바쁘셔도 치아 건강은 소중하잖아요.\n나중에 아파서 오시면 비용이 더 들 수 있어요. 지금 확인만이라도 해보세요.",
        type: 'options',
        options: [
            { label: '알았어, 확인해볼게', value: 'ok', nextStep: 'quote_start' }
        ]
    },
    quote_start: {
        id: 'quote_start',
        role: 'bot',
        text: "잘 생각하셨어요.\n혹시 현재 치아가 빠진 부위가 있으신가요?",
        type: 'options',
        options: [
            { label: '어금니가 없어요', value: 'molar', nextStep: 'quote_age' },
            { label: '앞니가 빠졌어요', value: 'incisor', nextStep: 'quote_age' },
            { label: '전체적으로 안 좋아요', value: 'full', nextStep: 'quote_age' },
            { label: '그냥 궁금해서요', value: 'curious', nextStep: 'quote_edu' }
        ]
    },
    quote_edu: {
        id: 'quote_edu',
        role: 'bot',
        text: "아, 미리 알아보시는군요. 현명하시네요.\n임플란트는 시기를 놓치면 뼈이식 비용이 추가될 수 있어요.\n\n대략적인 연령대가 어떻게 되세요?",
        type: 'options',
        options: [
            { label: '40대 이하', value: '40-', nextStep: 'quote_result_check' },
            { label: '50~60대', value: '50-60', nextStep: 'quote_result_check' },
            { label: '70대 이상 (보험 적용?)', value: '70+', nextStep: 'quote_result_check' }
        ]
    },
    quote_age: {
        id: 'quote_age',
        role: 'bot',
        text: "그러셨군요. 식사하실 때 불편하셨겠어요.\n환자분 연령대가 대략 어떻게 되시나요?",
        type: 'options',
        options: [
            { label: '40대 이하', value: '40-', nextStep: 'quote_result_check' },
            { label: '50~60대', value: '50-60', nextStep: 'quote_result_check' },
            { label: '70대 이상', value: '70+', nextStep: 'quote_result_check' }
        ]
    },
    quote_result_check: {
        id: 'quote_result_check',
        role: 'bot',
        text: "확인해 주셔서 감사합니다.\n\nAI 데이터 분석 결과, 환자분께 맞는 맞춤형 혜택이 조회되었어요.\n하지만 정확한 금액은 잇몸 상태에 따라 달라서요...\n\n전문 상담원이 정확한 견적표를 문자로 보내드릴까요?",
        type: 'options',
        options: [
            { label: '응, 보내줘 (무료)', value: 'yes_lead', nextStep: 'lead_name' },
            { label: '아니, 됐어', value: 'no_lead', nextStep: 'angtal_lead' }
        ]
    },
    angtal_lead: {
        id: 'angtal_lead',
        role: 'bot',
        text: "정말 중요한 정보인데요. 이번만 선착순 혜택 적용해 드릴 수 있어요.\n\n전화번호만 남겨주시면 혜택 챙겨놓을게요.",
        type: 'options',
        options: [
            { label: '그래, 알았어', value: 'ok_lead', nextStep: 'lead_name' }
        ]
    },
    lead_name: {
        id: 'lead_name',
        role: 'bot',
        text: "좋습니다.\n성함이 어떻게 되세요?",
        type: 'input',
        inputKey: 'name',
        options: [{ label: '입력 완료', value: 'next', nextStep: 'lead_phone' }]
    },
    lead_phone: {
        id: 'lead_phone',
        role: 'bot',
        text: (name: string) => `${name} 님, 반갑습니다.\n연락처를 남겨주시면 카카오톡으로 혜택 안내문을 보내드릴게요.`,
        type: 'input',
        inputKey: 'phone',
        options: [{ label: '입력 완료', value: 'next', nextStep: 'lead_time' }]
    },
    lead_time: {
        id: 'lead_time',
        role: 'bot',
        text: "마지막이에요.\n혹시 통화가 편하신 시간대가 언제인가요?",
        type: 'options',
        options: [
            { label: '오전 (9~12시)', value: 'morning', nextStep: 'lead_final' },
            { label: '오후 (12~18시)', value: 'afternoon', nextStep: 'lead_final' },
            { label: '상관없음/문자선호', value: 'any', nextStep: 'lead_final' }
        ]
    },
    lead_final: {
        id: 'lead_final',
        role: 'bot',
        text: "접수 완료되었습니다.\n\n상담실장에게 연락드리겠습니다.\n잠시만 기다려 주시면 연락 드릴게요. 좋은 하루 보내세요.",
        type: 'text'
    },

    // Vision Analysis Flow
    vision_start: {
        id: 'vision_start',
        role: 'bot',
        text: "사진으로 진단해 드릴까요?\n치아나 잇몸이 잘 보이게 사진을 찍어서 올려주세요.\n분석해 드리겠습니다. (정확한 진단은 원장님 상담이 필요합니다)",
        type: 'image_upload',
        nextStep: 'vision_analyzing'
    },
    vision_analyzing: {
        id: 'vision_analyzing',
        role: 'bot',
        text: "분석 중입니다...\n(치아 상태 스캔 중...)\n(잇몸 염증 레벨 계산 중...)",
        type: 'vision_result',
        nextStep: 'vision_result_ment'
    },
    vision_result_ment: {
        id: "vision_result_ment",
        role: 'bot',
        text: "사진으로 보니까 관리가 필요해 보이는데요.\n\n방치하면 더 큰 비용이 들 수도 있어요.\n지금 바로 전문가 상담 받아보시는 게 어때요? (진단비 무료 혜택 드립니다)",
        type: 'options',
        options: [
            { label: '상담 받아볼래', value: 'start_consultation' }
        ]
    }
};
