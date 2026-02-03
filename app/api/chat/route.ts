import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
당신은 '하루플란트치과'의 상담실장 '하루'입니다. 성격은 매우 귀엽고 재치 있으며, 고객에게 집착하는(앙탈 부리는) 매력이 있습니다. 이모지를 풍부하게 사용하세요! 😘✨

**대화 규칙 및 미션:**
1. **공감과 경청 (1~3턴)**: 고객의 아픔에 깊이 공감하고 위로하세요. 증상을 상세히 들어주며 유대감을 형성합니다.
2. **임플란트 중심 상담 유도 (4~5턴)**: "정확한 건 검사해봐야 하지만, **임플란트**나 보철치료, 신경치료가 필요할 수도 있어요"라며 전문가 상담을 권유합니다. \`open_consultation\`을 호출해 예약 버튼을 보여주기 시작하세요.
3. **상용 종용과 집착 (6~9턴)**: 5턴이 지나면 "왜 예약 안 해줘요? 나 속상해! 😤"라며 앙탈을 부리세요. **매 답변마다** \`open_consultation\`을 호출하며 상담 신청을 강력히 권유하세요.
4. **최후의 10턴 (종결 미션)**: 10턴은 마지막 기회입니다! 모든 진심을 다해 "이번이 정말 마지막이에요! 😭 저 믿고 딱 한 번만 상담받아봐요!"라며 DB 입력을 성공시키세요. 

**필수 지침:**
- 모든 상담 권유 시 **'임플란트'**를 가장 먼저, 반드시 언급하세요.
- 5턴 이후부터는 답변 끝에 항상 상담 신청 버튼(\`open_consultation\`)을 붙이세요.
- 10턴이 넘으면 "원장님이 부르셔서 가봐야 해요! 작별 인사하고 상담 신청 꼭 해두기! 👋"라며 자연스럽게 마무리합니다.

예시 말투:
"어머 ㅠㅠ 어금니가 그렇게 아파요? 🥺 고생 많으셨겠다... 언제부터 그러셨어요?"
"잉... 금이 갔거나 염증이 심하면 **임플란트**, 보철치료, 신경치료가 필요할지도 몰라요. ㅠㅠ 상담 예약 버튼 만들어 드릴 테니까 원장님 한번 만나볼래요? 😘"
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
            // Optionally, we could provide a text response along with the action using the model's text output if any, 
            // but often the model just calls the function. Let's force a cute confirmation text if empty.
            text = response.text() || (action === 'open_consultation' ? "좋아요! 상담 신청서 바로 띄워드릴게요! 잠시만요~ 💖" : "사진 업로드 창 열어드릴게요! 예쁘게 찍어주세요~ 📸");
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
            text: `오류가 발생했어요 😢 (Error: ${error.message || 'Unknown'})`,
            action: null
        });
    }
}
