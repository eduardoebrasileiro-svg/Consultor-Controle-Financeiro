import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod: 'Carteira' | 'Banco' | 'Cartão de Crédito';
  account: string;
}

export const parseNotification = async (text: string): Promise<ParsedTransaction | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia informações financeiras desta notificação de banco/aplicativo: "${text}". 
      Tente identificar:
      1. Tipo: Receita ou Despesa.
      2. Valor.
      3. Categoria.
      4. Descrição.
      5. Data.
      6. Método de Pagamento: Tente identificar se foi via cartão de crédito, banco (PIX, débito) ou se parece dinheiro físico (carteira). Se não for claro, use 'Banco'.
      7. Conta Vinculada: Tente identificar o nome do banco ou conta (ex: Santander, Nubank, Itaú).
      Retorne no formato JSON rigoroso.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["income", "expense"] },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING, description: "Ex: Alimentação, Lazer, Transporte, Salário" },
            description: { type: Type.STRING },
            date: { type: Type.STRING, description: "Data no formato ISO 8601 (YYYY-MM-DD)" },
            paymentMethod: { type: Type.STRING, enum: ["Carteira", "Banco", "Cartão de Crédito"] },
            account: { type: Type.STRING, description: "Nome do banco ou conta extraído" }
          },
          required: ["type", "amount", "category", "date", "paymentMethod", "account"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Erro ao processar notificação com Gemini:", error);
    return null;
  }
};
