/**
 * 
 * This controller handles HTTP requests related to semantic search operations.
 * It provides endpoints for:
 * - Document loading
 * - Embeddings generation
 * - Vector store creation
 * - Semantic search queries
 * 
 */

import { SemanticSearchService } from "../services/semantic-search.service.js";
import type { Request, Response } from "express";

export class SemanticSearchController {
    private semanticSearchService: SemanticSearchService;

    constructor() {
        this.semanticSearchService = new SemanticSearchService();
    }

    /**
     * Handles document loading requests
     */
    async loadDocument(req: Request, res: Response) {
        try {
            const response = await this.semanticSearchService.loadDocument();
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Get embeddings for a text
     */
    async getEmbeddings(req: Request, res: Response) {
        try {
            const text = "Hello world!"

            const response = await this.semanticSearchService.getEmbeddings(text);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Create vector store
     */
    async createVectorStore(req: Request, res: Response) {
        try {
            const response = await this.semanticSearchService.createVectorStore();
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Perform similarity search
     */
    async similaritySearch(req: Request, res: Response) {
        try {
            const { query, k } = {
                "query": "loyal pets",
                "k": 2
            }

            const response = await this.semanticSearchService.similaritySearch(query, k);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Load PDF and create vector store
     */
    async loadPdfAndCreateVectorStore(req: Request, res: Response) {
        try {
            const filePath = "./src/v1/utils/ROLE_BASED_ACCESS_SYSTEMv2.pdf";
            const response = await this.semanticSearchService.loadPdfAndCreateVectorStore(filePath);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Search in PDF content
     */
    async searchInPdf(req: Request, res: Response) {
        try {
            const { query, k } = {
                "query": "How many modules role based access system has?",
                "k": 3
            }

            const response = await this.semanticSearchService.searchInPdf(query, k);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }
}
