import { getChroma } from './chroma.js';

type RetrievalOpts = {
    userId: string;
    topicId: string;
    query: string;
    k?: number;
    scoreThreshold?: number;
};

// ChromaDB metadata'ni tozalash funksiyasi
const cleanMetadata = (metadata: Record<string, any>) => {
    return Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                return [k, JSON.stringify(v)];
            }
            return [k, v];
        })
    );
};

export const maybeRetrieveContext = async (opts: RetrievalOpts) => {
    const { userId, topicId, query, k = 4, scoreThreshold = 0.3 } = opts;
    const chroma = await getChroma();


    const results = await chroma.similaritySearchWithScore(query, k, {
        where: `userId = "${userId}" AND topicId = "${topicId}"`,
    });

    const filtered = results.filter(([, score]: [any, number]) => score <= scoreThreshold);


    if (!filtered.length) return [];
    return filtered.map(([doc]: [any, number]) => doc.pageContent);
};

export const upsertTopicSeed = async (userId: string, topicId: string, data: string) => {
    const chroma = await getChroma();
    const metadata = cleanMetadata({ userId, topicId, type: 'seed' });
    await chroma.addDocuments([{ pageContent: data, metadata }]);
};

export const upsertGenerated = async (userId: string, topicId: string, text: string, tags: string[]) => {
    const chroma = await getChroma();
    const metadata = cleanMetadata({ userId, topicId, type: 'generated', tags });
    await chroma.addDocuments([{ pageContent: text, metadata }]);
};