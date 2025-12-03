
import { GoogleGenAI } from "@google/genai";
import { Employee, LeaveRequest } from "../types";

export const getHRAssistantResponse = async (
  query: string,
  employeeData: Employee,
  leaveHistory: LeaveRequest[]
): Promise<string> => {
  try {
    // Initialize inside the function to avoid startup crashes
    // This safely handles cases where process.env might not be fully loaded initially
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("Gemini API Key is missing");
      return "عذراً، خدمة المساعد الذكي غير متوفرة حالياً (مفتاح API مفقود). يرجى التأكد من الإعدادات.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

    const systemInstruction = `
      أنت مساعد إداري ذكي في قسم الموارد البشرية.
      دورك هو مساعدة مسؤول الأرشفة في فهم البيانات، واقتراح طرق تنظيم السجلات، أو شرح قوانين العمل العامة.
      
      البيانات المتاحة حالياً هي سجلات مؤرشفة وليست طلبات قيد الانتظار.
      أنواع الإجازات المدعومة: سنوية، مرضية، زمنية (بالساعات)، وبدون راتب.

      أجب باختصار واحترافية باللغة العربية.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "عذراً، لم أتمكن من معالجة طلبك.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.";
  }
};
