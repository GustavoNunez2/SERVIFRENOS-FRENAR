import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product, ExternalSource } from "./types";

// En Vite usamos import.meta.env para acceder a las variables del archivo .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ VITE_GEMINI_API_KEY no encontrada. Revisa tu archivo .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function extractProductsFromText(rawText: string): Promise<Partial<Product>[]> {
  if (!API_KEY) return [];
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Extrae información de productos del siguiente texto. 
    Devuelve un ARREGLO JSON con objetos que tengan: name (string), price (number), code (string), category (string).
    Texto: ${rawText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text);
  } catch (e) {
    console.error("Error en Scraping con Gemini:", e);
    return [];
  }
}

export async function getExternalPrices(query: string, sources: ExternalSource[]) {
  if (!API_KEY || sources.length === 0 || !query) return [];

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{ googleSearch: {} }] as any 
    });

    const prompt = `Busca el precio real actual de "${query}" en estos sitios: ${sources.map(s => s.nombre).join(", ")}. 
    Devuelve un JSON array: [{"siteName": "nombre", "price": 0, "url": "link"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return parsed.map((res: any) => ({
      sourceId: sources.find(s => s.nombre.toLowerCase().includes(res.siteName.toLowerCase()))?.id || 'unknown',
      price: Number(res.price),
      url: res.url
    })).filter((r: any) => r.sourceId !== 'unknown');
  } catch (e) {
    console.error("Error en búsqueda externa:", e);
    return [];
  }
}