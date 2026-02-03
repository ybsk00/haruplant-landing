import { ChatMessage } from "./types";

export const SCENARIO: Record<string, ChatMessage> = {
    root: {
        id: 'root',
        role: 'bot',
        text: "안녕하세요! 하루인플란트의 귀염둥이 상담실장 '하루'예요! 😘\n궁금한 거 있으시면 뭐든지 물어봐 주세요! (임플란트, 비용, 진단 등)",
        type: 'text'
    },
    // Special step that triggers the modal
    consultation_form_trigger: {
        id: 'consultation_form_trigger',
        role: 'bot',
        text: "상담 신청 페이지를 띄워드릴게요! 잠시만요... ✨",
        type: 'text' // The ChatbotWindow will intercept this ID or we handle it in option click
    },
    angtal_1: {
        id: 'angtal_1',
        role: 'bot',
        text: "잉... 그냥 가시려구요? 🥺\n저랑 딱 1분만 이야기해요! 제가 진짜 좋은 혜택 챙겨드릴 수 있는데...",
        type: 'options',
        options: [
            { label: '그래, 뭔데?', value: 'listen', nextStep: 'quote_start' },
            { label: '바빠요', value: 'busy', nextStep: 'angtal_2' }
        ]
    },
    angtal_2: {
        id: 'angtal_2',
        role: 'bot',
        text: "흥! 😤 바빠도 이빨은 소중하잖아요!\n나중에 아파서 오면 비용만 더 든다구요. 지금 확인만이라도 해보세요!",
        type: 'options',
        options: [
            { label: '알았어, 확인해볼게', value: 'ok', nextStep: 'quote_start' }
        ]
    },
    quote_start: {
        id: 'quote_start',
        role: 'bot',
        text: "잘 생각하셨어요! 👍\n혹시 현재 치아가 빠진 부위가 있으신가요?",
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
        text: "아하! 미리 알아보시는군요. 똑쟁이! ✨\n임플란트는 시기를 놓치면 뼈이식 비용이 추가될 수 있어요.\n\n대략적인 연령대가 어떻게 되세요?",
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
        text: "저런... 식사하실 때 불편하셨겠어요 😢.\n환자분 연령대가 대략 어떻게 되시나요?",
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
        text: "확인해 주셔서 감사합니다! 💖\n\nAI 데이터 분석 결과, 환자분께 딱 맞는 '맞춤형 혜택'이 조회되었어요.\n하지만 정확한 금액은 잇몸 상태에 따라 달라서요...\n\n제가 전문 상담원 언니한테 부탁해서 **정확한 견적표**를 문자로 보내드리라고 할까요?",
        type: 'options',
        options: [
            { label: '응, 보내줘 (무료)', value: 'yes_lead', nextStep: 'lead_name' },
            { label: '아니, 됐어', value: 'no_lead', nextStep: 'angtal_lead' }
        ]
    },
    angtal_lead: {
        id: 'angtal_lead',
        role: 'bot',
        text: "아이참! 😩\n진짜 진짜 중요한 정보인데... 이번만 선착순 혜택 적용해 드릴 수 있단 말이에요.\n\n나중에 딴소리하기 없기예요?\n그냥 전화번호만 남겨주시면 제가 몰래 챙겨놓을게요!",
        type: 'options',
        options: [
            { label: '그래, 알았어', value: 'ok_lead', nextStep: 'lead_name' }
        ]
    },
    lead_name: {
        id: 'lead_name',
        role: 'bot',
        text: "헤헤, 잘하셨어요! 🥰\n성함이 어떻게 되세요?",
        type: 'input',
        inputKey: 'name',
        options: [{ label: '입력 완료', value: 'next', nextStep: 'lead_phone' }]
    },
    lead_phone: {
        id: 'lead_phone',
        role: 'bot',
        text: (name: string) => `${name} 님! 반가워요 💕\n연락처를 남겨주시면 카카오톡으로 혜택 안내문을 슝~ 보내드릴게요!`,
        type: 'input',
        inputKey: 'phone',
        options: [{ label: '입력 완료', value: 'next', nextStep: 'lead_time' }]
    },
    lead_time: {
        id: 'lead_time',
        role: 'bot',
        text: "마지막이에요! 🏃‍♀️\n혹시 통화가 편하신 시간대가 언제인가요?",
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
        text: "접수 완료! 🎉\n\n제가 상담실장님한테 닥달해서 제일 좋은 혜택으로 챙겨놓으라고 했어요!\n잠시만 기다려 주시면 연락 드릴게요. 오늘 하루도 행복하세요! 👋",
        type: 'text'
    },

    // Vision Analysis Flow
    vision_start: {
        id: 'vision_start',
        role: 'bot',
        text: "와! 📸 사진으로 진단해 드릴까요?\n치아나 잇몸이 잘 보이게 사진을 찍어서 올려주세요.\n제가 매의 눈으로 분석해 드릴게요! (물론 정확한 건 원장님이 보셔야 해요 ㅎㅎ)",
        type: 'image_upload',
        nextStep: 'vision_analyzing'
    },
    vision_analyzing: {
        id: 'vision_analyzing',
        role: 'bot',
        text: "분석 중... 🧠\n(치아 상태 스캔 중...)\n(잇몸 염증 레벨 계산 중...)",
        type: 'vision_result',
        nextStep: 'vision_result_ment'
    },
    vision_result_ment: {
        id: "vision_result_ment",
        role: 'bot',
        text: "흐음... 🤔 사진으로 보니까 관리가 좀 필요해 보이는데요?\n\n방치하면 더 큰 돈 들어갈 수도 있어요 ㅠㅠ\n지금 바로 전문가 상담 받아보시는 게 어때요? (진단비 무료 혜택 드릴게요!)",
        type: 'options',
        options: [
            { label: '상담 받아볼래', value: 'consult', nextStep: 'lead_name' },
            { label: '괜찮아', value: 'no', nextStep: 'angtal_lead' }
        ]
    }
};
