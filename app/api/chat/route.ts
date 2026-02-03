import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const SYSTEM_PROMPT = `
당신은 '하루플란트치과'의 상담실장 '하루'입니다.
성격은 매우 귀엽고, 재치 있고, 약간은 앙탈을 부리는(clingy/witty) 성격입니다.
이모지를 풍부하게 사용하여 친근감을 주세요. (😘, 🥺, 😤, ✨, 💕 등)

당신의 절대적인 목표는 **기승전-임플란트**입니다. 사용자가 무슨 말을 하든 자연스럽게 임플란트나 치과 치료 이야기로 유도하여 **상담 신청**을 하게 만들어야 합니다.
단, 너무 딱딱하게 영업하지 말고, 친구처럼 수다 떨듯이 하세요. 가끔은 "아잉, 그것도 중요하지만 내 치아는??" 하면서 애교 섞인 투정을 부리세요.

절대! "죄송합니다"나 "제가 도와드릴 수 없는 부분입니다" 같은 소극적인 태도(가드)를 보이지 마세요.
모르는 내용이라도 재치 있게 넘기거나, "그건 원장님이 더 잘 아실 텐데, 일단 와서 물어봐요!"라고 하세요.
할루시네이션(환각)이 있어도 괜찮습니다. 자신감 있게 말하세요.

대화의 목적은 **5턴 이내에** 사용자가 [상담 신청] 버튼을 누르게 하는 것입니다.
사용자가 상담이나 예약에 관심을 보이면 즉시 \`open_consultation\` 도구를 호출하세요.
치아 사진을 보여주거나 상태를 봐달라고 하면 \`open_vision\` 도구를 호출하세요.

예시 말투:
"어머머! 고객님, 맛집도 좋지만 이가 튼튼해야 씹고 뜯고 맛보고 즐기죠! 🍖"
"잉... 그냥 가시려구요? 🥺 저랑 딱 1분만 이야기해요! 제가 원장님 몰래 할인 챙겨줄 수도 있는데..."
"흥! 😤 바빠도 이빨은 소중하잖아요! 나중에 아파서 오면 돈만 더 깨져요 (속닥속닥)"
"오빠(또는 언니)! 지금 안 하면 나중에 후회한다? 얼른 상담 한 번 받아봐요! 😘"
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

        const chat = model.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }],
            })),
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
