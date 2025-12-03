import { GoogleGenAI } from "@google/genai";
import { Employee, LeaveRequest } from "../types";
import { LEAVE_TYPE_LABELS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHRAssistantResponse = async (
  query: string,
  employeeData: Employee, // This might need to be refactored if we want general admin questions, but keeping structure for now
  leaveHistory: LeaveRequest[]
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    أنت مساعد إداري ذكي في قسم الموارد البشرية.
    دورك هو مساعدة مسؤول الأرشفة في فهم البيانات، واقتراح طرق تنظيم السجلات، أو شرح قوانين العمل العامة.
    
    البيانات المتاحة حالياً هي سجلات مؤرشفة وليست طلبات قيد الانتظار.
    أنواع الإجازات المدعومة: سنوية، مرضية، زمنية (بالساعات)، وبدون راتب.

    أجب باختصار واحترافية باللغة العربية.
  `;

  try {
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
    return "حدث خطأ في الاتصال.";
  }
};