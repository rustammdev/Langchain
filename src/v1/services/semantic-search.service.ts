/**
 *
 * This service handles semantic search operations using LangChain.
 * It provides functionality for:
 * - Document loading and processing
 * - Text embedding and vector storage
 * - Semantic search queries
 * - Retrieval operations
 * - PDF loading and vector store creation
 * - PDF content search 
 * - ```docker run -d --name chromadb -p 8000:8000 chromadb/chroma:latest```
 *
 * Based on: https://js.langchain.com/docs/tutorials/retrievers
 *
 */

import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "../../config/index.js";
import { AppError } from "../../common/utils/AppError.js";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

/**
 * Service class for handling semantic search operations
 */
export class SemanticSearchService {
    private model: ChatOpenAI;
    private embeddings: OpenAIEmbeddings;
    private vectorStore: MemoryVectorStore | null = null;

    constructor() {
        this.model = new ChatOpenAI({
            apiKey: config.api_keys.open_ai,
            model: "gpt-3.5-turbo",
        });

        this.embeddings = new OpenAIEmbeddings({
            apiKey: config.api_keys.open_ai,
            model: "text-embedding-3-small",
        });
    }

    /**
     * Sample documents
     * @returns {Document[]} Sample documents
     */
    private sampleDocuments() {
        const document = [
            new Document({
                pageContent:
                    "Dogs are great companions, known for their loyalty and friendliness.",
                metadata: { source: "mammal-pets-doc" },
            }),
            new Document({
                pageContent:
                    "Cats are independent pets that often enjoy their own space.",
                metadata: { source: "mammal-pets-doc" },
            }),

            new Document({
                pageContent:
                    "Dostevskiy book is a great book",
                metadata: { source: "dostevskiy-book" },
            })
        ];

        return document;
    }

    //   Load document
    async loadDocument() {
        try {
            const loader = new PDFLoader(
                "./src/v1/utils/ROLE_BASED_ACCESS_SYSTEMv2.pdf"
            );
            const docs = await loader.load();

            return {
                length: docs.length,
                metadata: docs[0]?.metadata,
                message: "Document loaded successfully",
                data: docs
            };
        } catch (error: any) {
            console.debug(error?.message);
            throw new AppError(`Failed to load document: ${error?.message}`, 500);
        }
    }

    /**
     * Get embeddings for a single text
     */
    async getEmbeddings(text: string) {
        try {
            const vector = await this.embeddings.embedQuery(text);

            return {
                text,
                vectorLength: vector.length,
                vectorPreview: vector.slice(0, 5), // First 5 dimensions
                // fullVector: vector
            };
        } catch (error: any) {
            throw new AppError(`Failed to get embeddings: ${error?.message}`, 500);
        }
    }

    /**
     * Get embeddings for multiple documents
     */
    async getDocumentEmbeddings(texts: string[]) {
        try {
            const vectors = await this.embeddings.embedDocuments(texts);

            return {
                documentCount: texts.length,
                vectors: vectors.map((vector, index) => ({
                    text: texts[index],
                    vectorLength: vector.length,
                    vectorPreview: vector.slice(0, 5)
                }))
            };
        } catch (error: any) {
            throw new AppError(`Failed to get document embeddings: ${error?.message}`, 500);
        }
    }

    /**
     * Create vector store from documents
     */
    async createVectorStore() {
        try {
            const documents = this.sampleDocuments();
            this.vectorStore = await MemoryVectorStore.fromDocuments(
                documents,
                this.embeddings // ← bu yerda siz konstruktorda yaratgan embeddings obyektini berayapsiz

            );

            return {
                message: "Vector store created successfully",
                documentsCount: documents.length
            };
        } catch (error: any) {
            throw new AppError(`Failed to create vector store: ${error?.message}`, 500);
        }
    }

    /**
     * Perform similarity search using text
     */
    async similaritySearch(query: string, k: number = 2) {
        try {
            // k — bu qidiruv natijalaridan nechta eng o‘xshash hujjatni qaytarish kerakligini bildiradigan parametr

            if (!this.vectorStore) {
                throw new AppError("Vector store not initialized. Create vector store first.", 400);
            }

            // similaritySearch: Query sifatida matn yuborasiz; vektorlashtirishni vector store ichida o‘zi bajaradi.
            const results = await this.vectorStore.similaritySearchWithScore(query, k);

            return {
                query,
                results: results.map(([doc, score]) => ({
                    content: doc.pageContent,
                    metadata: doc.metadata,
                    similarityScore: score
                }))
            };
        } catch (error: any) {
            throw new AppError(`Similarity search failed: ${error?.message}`, 500);
        }
    }

    /**
     * Perform similarity search using vector
     */
    async similaritySearchByVector(query: string, k: number = 2) {
        try {

            if (!this.vectorStore) {
                throw new AppError("Vector store not initialized. Create vector store first.", 400);
            }

            // First get the embedding for the query
            const queryEmbedding = await this.embeddings.embedQuery(query);

            // Then search using the vector
            // To‘liq nazorat — query vektorini ko‘rish/loglash, qayta ishlatish, boshqa joydan kelgan vektordan foydalanish mumkin.
            const results = await this.vectorStore.similaritySearchVectorWithScore(
                queryEmbedding,
                k
            );

            return {
                query,
                queryVectorLength: queryEmbedding.length,
                results: results.map(([doc, score]) => ({
                    content: doc.pageContent,
                    metadata: doc.metadata,
                    similarityScore: score
                }))
            };
        } catch (error: any) {
            throw new AppError(`Vector similarity search failed: ${error?.message}`, 500);
        }
    }

    /**
     * Load PDF and create vector store for searching
     * PDF yuklash va undan qidirish uchun vector store yaratish
     */
    async loadPdfAndCreateVectorStore(filePath: string) {
        try {
            // 1. PDF'ni yuklash
            const loader = new PDFLoader(filePath);
            const { data } = await this.loadDocument();

            // 2. Hujjatlarni chunk'larga bo'lish (katta matnlarni kichik qismlarga)
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,  // Har bir chunk'ning o'lchami
                chunkOverlap: 200, // Chunk'lar orasidagi overlap
            });
            const splitDocs = await textSplitter.splitDocuments(data);

            // 3. Vector store yaratish
            this.vectorStore = await MemoryVectorStore.fromDocuments(
                splitDocs,
                this.embeddings
            );

            return {
                message: "PDF loaded and vector store created successfully",
                originalPages: data.length,
                chunks: splitDocs.length,
                filePath: filePath
            };
        } catch (error: any) {
            console.debug(error?.message);
            throw new AppError(`Failed to load PDF and create vector store: ${error?.message}`, 500);
        }
    }

    /**
     * Search in PDF content
     * PDF ichidan ma'lumot qidirish
     */
    async searchInPdf(query: string, k: number = 3) {
        try {
            if (!this.vectorStore) {
                throw new AppError("PDF not loaded. Please load PDF first using loadPdfAndCreateVectorStore.", 400);
            }

            const results = await this.vectorStore.similaritySearchWithScore(query, k);

            return {
                query,
                results: results.map(([doc, score]) => ({
                    content: doc.pageContent,
                    metadata: doc.metadata,
                    similarityScore: score,
                    pageNumber: doc.metadata?.loc?.pageNumber || 'Unknown'
                }))
            };
        } catch (error: any) {
            throw new AppError(`PDF search failed: ${error?.message}`, 500);
        }
    }
}
