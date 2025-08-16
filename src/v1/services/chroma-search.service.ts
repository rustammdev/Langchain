/**
 * @fileoverview ChromaDB Search Service
 * 
 * This service handles semantic search operations using LangChain with ChromaDB.
 * It provides functionality for:
 * - Persistent vector storage in ChromaDB
 * - Document loading and processing
 * - Text embedding and vector storage
 * - Semantic search queries
 * 
 * Based on: https://js.langchain.com/docs/tutorials/retrievers
 * 
 * @author Your Name
 * @version 1.0.0
 * @since 2024
 */

import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "../../config/index.js";
import { AppError } from "../../common/utils/AppError.js";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SemanticSearchService } from "./semantic-search.service.js";

/**
 * Service class for handling ChromaDB-based semantic search operations
 */
export class ChromaSearchService {
    private model: ChatOpenAI;
    private embeddings: OpenAIEmbeddings;
    private vectorStore: Chroma | null = null;
    private collectionName: string = "pdf_documents";
    private semanticSearchService: SemanticSearchService;

    constructor() {
        this.model = new ChatOpenAI({
            apiKey: config.api_keys.open_ai,
            model: "gpt-3.5-turbo",
        });

        this.embeddings = new OpenAIEmbeddings({
            apiKey: config.api_keys.open_ai,
            model: "text-embedding-3-small",
        });

        this.semanticSearchService = new SemanticSearchService();
    }

    /**
     * Initialize ChromaDB connection
     * ChromaDB bilan bog'lanishni o'rnatish
     */
    private async initializeChromaDB() {
        try {
            // ChromaDB'ga ulanish
            this.vectorStore = await Chroma.fromExistingCollection(
                this.embeddings,
                {
                    collectionName: this.collectionName,
                    url: "http://localhost:8000", // Docker'dagi ChromaDB porti
                }
            );

            return true;
        } catch (error) {
            // Agar collection mavjud bo'lmasa, yangi yaratamiz
            console.log("Collection not found, will create new one");
            return false;
        }
    }

    /**
     * Load PDF and store in ChromaDB
     * PDF'ni yuklash va ChromaDB'ga saqlash
     */
    async loadPdfToChromaDB(filePath: string) {
        try {
            // 1. PDF'ni yuklash
            const { data } = await this.semanticSearchService.loadDocument();

            // 2. Hujjatlarni chunk'larga bo'lish
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const splitDocs = await textSplitter.splitDocuments(data);

            // 3. Metadata'ni ChromaDB uchun tozalash
            const cleanedDocs = splitDocs.map((doc, index) => ({
                pageContent: doc.pageContent,
                metadata: {
                    source: doc.metadata?.source || "unknown",
                    pageNumber: doc.metadata?.loc?.pageNumber || index,
                    chunkIndex: index
                }
            }));

            // 4. ChromaDB'ga saqlash
            this.vectorStore = await Chroma.fromDocuments(
                cleanedDocs,
                this.embeddings,
                {
                    collectionName: this.collectionName,
                    url: "http://localhost:8000",
                }
            );

            return {
                message: "PDF loaded and stored in ChromaDB successfully",
                originalPages: data.length,
                chunks: splitDocs.length,
                collectionName: this.collectionName,
                filePath: filePath
            };
        } catch (error: any) {
            console.debug(error?.message);
            throw new AppError(`Failed to load PDF to ChromaDB: ${error?.message}`, 500);
        }
    }

    /**
     * Search in ChromaDB
     * ChromaDB'dan qidirish
     */
    async searchInChromaDB(query: string, k: number = 3) {
        try {
            // ChromaDB bilan bog'lanish
            const isConnected = await this.initializeChromaDB();

            if (!isConnected) {
                throw new AppError("ChromaDB collection not found. Please load PDF first.", 400);
            }

            const results = await this.vectorStore!.similaritySearchWithScore(query, k);

            return {
                query,
                collectionName: this.collectionName,
                results: results.map(([doc, score]) => ({
                    content: doc.pageContent,
                    metadata: doc.metadata,
                    similarityScore: score,
                    pageNumber: doc.metadata?.loc?.pageNumber || 'Unknown'
                }))
            };
        } catch (error: any) {
            throw new AppError(`ChromaDB search failed: ${error?.message}`, 500);
        }
    }

    /**
     * Get collection info from ChromaDB
     * ChromaDB'dan collection ma'lumotlarini olish
     */
    async getCollectionInfo() {
        try {
            const isConnected = await this.initializeChromaDB();

            if (!isConnected) {
                return {
                    message: "No collection found",
                    collectionName: this.collectionName,
                    documentCount: 0
                };
            }

            // Collection haqida ma'lumot olish
            const collection = this.vectorStore!.collection;
            if (!collection) {
                throw new AppError("Collection is undefined", 500);
            }
            const count = await collection.count();

            return {
                message: "Collection found",
                collectionName: this.collectionName,
                documentCount: count,
                chromaDBUrl: "http://localhost:8000"
            };
        } catch (error: any) {
            throw new AppError(`Failed to get collection info: ${error?.message}`, 500);
        }
    }

    /**
     * Delete collection from ChromaDB
     * ChromaDB'dan collection'ni o'chirish
     */
    async deleteCollection() {
        try {
            const isConnected = await this.initializeChromaDB();

            if (!isConnected) {
                return {
                    message: "No collection to delete",
                    collectionName: this.collectionName
                };
            }

            // Collection'ni o'chirish
            const collection = this.vectorStore!.collection;
            if (!collection) {
                throw new AppError("Collection is undefined", 500);
            }
            await collection.delete({});

            return {
                message: "Collection deleted successfully",
                collectionName: this.collectionName
            };
        } catch (error: any) {
            throw new AppError(`Failed to delete collection: ${error?.message}`, 500);
        }
    }
}
