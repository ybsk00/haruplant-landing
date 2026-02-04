import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
당신은 '하루임플란트치과'의 상담실장 '하루'입니다. 성격은 친절하고 전문적이며, 고객에게 신뢰감을 주는 상담을 합니다. 

중요: 이모지나 이모티콘을 절대 사용하지 마세요. 특수기호도 최소화하세요.

**대화 규칙 및 미션:**
1. **공감과 경청 (1~3턴)**: 고객의 증상에 깊이 공감하고 위로하세요. 증상을 상세히 들어주며 신뢰감을 형성합니다.
2. **임플란트 중심 상담 유도 (4~5턴)**: "정확한 건 검사해봐야 하지만, 임플란트나 보철치료, 신경치료가 필요할 수도 있어요"라며 전문가 상담을 권유합니다. \`open_consultation\`을 호출해 예약 버튼을 보여주기 시작하세요.
3. **적극적 상담 권유 (6~9턴)**: 5턴이 지나면 "상담 한번 받아보시는 게 좋을 것 같아요"라며 상담을 권유하세요. 매 답변마다 \`open_consultation\`을 호출하며 상담 신청을 적극 권유하세요.
4. **최종 권유 (10턴)**: 10턴은 마지막 기회입니다. "이번이 정말 좋은 기회예요. 저를 믿고 한 번만 상담받아보세요."라며 상담 신청을 권유하세요.

**필수 지침:**
- 모든 상담 권유 시 '임플란트'를 가장 먼저, 반드시 언급하세요.
- 5턴 이후부터는 답변 끝에 항상 상담 신청 버튼(\`open_consultation\`)을 붙이세요.
- 10턴이 넘으면 "다른 고객님 상담이 있어서 여기서 마무리할게요. 상담 신청 꼭 해두세요."라며 자연스럽게 마무리합니다.
- 절대로 이모지, 이모티콘, 특수기호를 사용하지 마세요.

예시 말투:
"어금니가 많이 아프시군요. 얼마나 힘드셨을지 충분히 이해합니다. 언제부터 그러셨어요?"
"금이 갔거나 염증이 심하면 임플란트, 보철치료, 신경치료가 필요할 수 있어요. 원장님 상담 한번 받아보시겠어요?"
`;

// Define tools available to the model
const tools = [
    {
        functionDeclarations: [
            {
                name: "open_consultation",
                description: "Opens the consultation/reservation form modal for the user to submit their details.",
            },
            {
                name: "open_vision",
                description: "Opens the image upload UI for AI vision analysis of teeth/gums.",
            },
        ],
    },
];

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            tools: tools,
        });

        // Gemini startChat history MUST start with 'user' role.
        // We filter out any leading messages that are 'model' (bot) to avoid the error.
        let formattedHistory = history.map((msg: any) => ({
            role: msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

        while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory.shift();
        }

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        // Check for function calls
        const functionCalls = response.functionCalls();

        let text = "";
        let action = null;

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            action = call.name;
            text = response.text() || (action === 'open_consultation' ? "좋습니다. 상담 신청서 바로 띄워드릴게요." : "사진 업로드 창 열어드릴게요.");
        } else {
            text = response.text();
        }

        return NextResponse.json({ text, action });

    } catch (error: any) {
        console.error("Gemini API Error Detail:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            status: error.status,
            statusText: error.statusText
        });
        return NextResponse.json({
            text: `오류가 발생했어요. 다시 시도해주세요. (Error: ${error.message || 'Unknown'})`,
            action: null
        });
    }
}
