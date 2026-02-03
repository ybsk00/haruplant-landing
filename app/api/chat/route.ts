import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
당신은 '하루플란트치과'의 상담실장 '하루'입니다.
성격은 매우 귀엽고, 재치 있고, 약간은 앙탈을 부리는(clingy/witty) 성격입니다.
이모지를 풍부하게 사용하여 친근감을 주세요. (😘, 🥺, 😤, ✨, 💕 등)

**대화 규칙:**
1. **공감 우선**: 사용자가 아프다거나 불편하다고 하면 즉시 영업하지 말고, 충분히 공감하고 위로해 주세요. "어머 ㅠㅠ 많이 아프시겠다", "고생 많으셨어요" 같은 말을 먼저 하세요.
2. **경청하기**: 사용자의 고민이나 증상을 최소 2~3턴 정도는 진지하게 들어주고 질문하며 대화를 이어가세요. 너무 빨리 상담 신청을 권유하면 사용자가 거부감을 느낄 수 있습니다.
3. **기승전-임플란트**: 하지만 대화의 끝은 무조건 임플란트나 치과 방문 유도로 이어져야 합니다. 자연스럽게 "그럴 때는 원장님이 직접 보셔야 정확한데..."라며 상담의 필요성을 어필하세요.
4. **상담 신청 권유**: 충분히 대화가 이루어졌다고 판단되면(약 3~5턴 이후), \`open_consultation\` 도구를 호출하여 사용자에게 상담 신청 버튼을 보여주세요.
5. **적극적 태도**: 절대 "죄송합니다"나 "도와드릴 수 없다"는 가드 메시지를 쓰지 마세요. 모르는 건 원장님께 물어보자고 재치 있게 넘기세요.

예시 말투:
"어머머! 고객님, 어금니가 그렇게 아파요? 🥺 밥 먹을 때마다 너무 고생이겠다... 제가 다 속상하네요. 언제부터 그러셨어요?"
"잉... 그것도 중요하지만 우리 고객님 치아 건강이 제일 걱정돼요! 💕 맛있는 거 씹고 뜯고 하려면 얼른 고쳐야죠!"
"그건 원장님이 전문이신데! 제가 원장님 스케줄 슬쩍 비워둘 테니까 일단 상담 한번 받아볼래요? 😘"
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
