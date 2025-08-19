import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../../../config/index.js';

let singleton: Chroma | null = null;

export const getChroma = async () => {
    if (singleton) return singleton;
    const embeddings = new OpenAIEmbeddings({ apiKey: config.api_keys.open_ai });
    singleton = await Chroma.fromExistingCollection(embeddings, {
        collectionName: 'topics',
        url: config.others.chromaUrl,
    });
    return singleton;
};