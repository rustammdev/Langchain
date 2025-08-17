// ChatDTO.ts
// HTTP so'rovlar uchun kirish ma'lumotlarini validatsiya qilish uchun Zod sxemasi.
import { z } from "zod";

export const ChatRequestSchema = z.object({
  userId: z.string().min(1),
  input: z.string().min(1),
});

// Sxemadan avtomatik tur chiqarish.
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
