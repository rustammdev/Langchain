import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "../../config/index.js";
import { AppError } from "../../common/utils/AppError.js";

export class LangChainService {
  private model: any;
  constructor() {
    this.model = new ChatOpenAI({
      apiKey: config.api_keys.open_ai,
      model: "gpt-3.5-turbo",
    });
  }

  async simpleLlmChat() {
    try {
      const messages = [
        /**
         * `SystemMessage` bu oldindan tayinlab qoyilgan biror buyruq
         * Keyingi qadamlardi LLM ushbu buyruq asosida userdan kelgan topshiriqni bajaradi
         */
        new SystemMessage("Translate the following from English into Italian"),

        /**
         * `HumanMessage` bu user tomonidan kelgan habar
         */
        new HumanMessage("hi!"),
      ];

      // LLM ni ishga tushirish
      const response = await this.model.invoke(messages);

      return response;
    } catch (error: any) {
      console.debug(error?.message);
      throw new AppError(error?.message, 500);
    }
  }
}
