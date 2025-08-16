import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "../config/index.js";

const model = new ChatOpenAI({
  apiKey: config.api_keys.open_ai,
  model: "gpt-3.5-turbo",
});

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
await model.invoke(messages);
