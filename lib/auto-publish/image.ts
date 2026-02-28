/**
 * 이미지 생성 + Supabase Storage 업로드
 */

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { pickImageScene } from "./image-scenes";
import type { Category } from "@/types";

/**
 * 카테고리 기반 이미지 생성 후 Supabase에 업로드
 * 실패 시 null 반환 (에러가 전체 게시를 막지 않음)
 */
export async function generateAndUploadImage(
  category: Category,
  ai: InstanceType<typeof GoogleGenAI>,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  const imagePrompt = pickImageScene(category);
  if (!imagePrompt) return null;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: imagePrompt,
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const fileName = `auto/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`;

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.storage
        .from("post-images")
        .upload(fileName, buffer, { contentType: "image/png", upsert: true });

      if (error) throw new Error(`업로드 실패: ${error.message}`);

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);
      return data.publicUrl;
    }
  }

  return null;
}
