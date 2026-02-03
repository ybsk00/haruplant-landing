export type ChatMessage = {
    id: string;
    role: 'bot' | 'user';
    text: string | ((name: string) => string);
    type?: 'text' | 'options' | 'input' | 'image_upload' | 'vision_result';
    options?: { label: string; value: string; nextStep?: string }[];
    inputKey?: string; // key to save data to (e.g. 'name', 'phone')
    nextStep?: string; // Auto-advance step
};

export type LeadData = {
    name?: string;
    phone?: string;
    time?: string;
    concerns?: string[];
    ageGroup?: string;
    isVisionAnalyzed?: boolean;
    visionResult?: string;
}

export const INITIAL_GREETING = "어머 고객님! 💖 임플란트 견적 보러 오셨구나~ 제가 딱! 알려드릴게요. 잠시만요~";
