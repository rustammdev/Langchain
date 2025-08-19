import { InstagramOutput, TelegramOutput, TwitterOutput, type Platform, WhatsAppOutput, YouTubeOutput } from "../core/schemas.js";
import { InstagramAgent } from "./instagram_agent.js";
import { TelegramAgent } from "./telegram_agent.js";
import { TwitterAgent } from "./twitter_agent.js";
import { WhatsAppAgent } from "./whatsapp_agent.js";
import { YouTubeAgent } from "./youtube_gent.js";

export const agentFactory = (platform: Platform) => {
    switch (platform) {
        case 'twitter': return new TwitterAgent(TwitterOutput);
        case 'youtube': return new YouTubeAgent(YouTubeOutput);
        case 'instagram': return new InstagramAgent(InstagramOutput);
        case 'telegram': return new TelegramAgent(TelegramOutput);
        case 'whatsapp': return new WhatsAppAgent(WhatsAppOutput);
    }
};