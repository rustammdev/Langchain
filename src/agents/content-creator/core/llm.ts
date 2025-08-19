import { ChatOpenAI } from '@langchain/openai';
import { config } from '../../../config/index.js';

export const llm = new ChatOpenAI({
    apiKey: config.api_keys.open_ai,
    modelName: config.agent.default_model,
    temperature: config.agent.default_temperature,
});