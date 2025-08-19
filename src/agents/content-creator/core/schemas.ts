import { z } from 'zod';

export const Platform = z.enum(['twitter', 'youtube', 'instagram', 'telegram', 'whatsapp']);
export type Platform = z.infer<typeof Platform>;

export const TopicInput = z.object({
    userId: z.string(),
    topicId: z.string().optional(),
    data: z.string().min(10),
    social_media: z.array(Platform).min(1),
});

export const TwitterOutput = z.object({
    thread: z.array(z.string()).min(1), // har bir element <= 280 char bo‘lishi kerak (prompt orqali nazorat)
    hashtags: z.array(z.string()).max(6),
});

export const YouTubeOutput = z.object({
    title: z.string(),
    description: z.string(),
    video_script: z.string(), // sahna-by-sahna
    tags: z.array(z.string()).max(15),
});

export const InstagramOutput = z.object({
    caption: z.string(),
    video_script: z.string(),
    hashtags: z.array(z.string()).max(10),
});

export const TelegramOutput = z.object({
    post: z.string(),
    buttons: z.array(z.object({ text: z.string(), url: z.string().optional() })).optional(),
});

export const WhatsAppOutput = z.object({
    message: z.string(), // qisqa, to‘g‘ri
});

export type TwitterOutput = z.infer<typeof TwitterOutput>;
export type YouTubeOutput = z.infer<typeof YouTubeOutput>;
export type InstagramOutput = z.infer<typeof InstagramOutput>;
export type TelegramOutput = z.infer<typeof TelegramOutput>;
export type WhatsAppOutput = z.infer<typeof WhatsAppOutput>;