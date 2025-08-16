/**
 * 
 * This controller handles HTTP requests related to ChromaDB operations.
 * It provides endpoints for:
 * - PDF loading to ChromaDB
 * - Searching in ChromaDB
 * - Collection management
 * 
 */

import { ChromaSearchService } from "../services/chroma-search.service.js";
import type { Request, Response } from "express";

export class ChromaSearchController {
    private chromaSearchService: ChromaSearchService;

    constructor() {
        this.chromaSearchService = new ChromaSearchService();
    }

    /**
     * Load PDF to ChromaDB
     */
    async loadPdfToChromaDB(req: Request, res: Response) {
        try {
            const filePath = "./src/v1/utils/ROLE_BASED_ACCESS_SYSTEMv2.pdf";
            const response = await this.chromaSearchService.loadPdfToChromaDB(filePath);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Search in ChromaDB
     */
    async searchInChromaDB(req: Request, res: Response) {
        try {
            const { query, k } = {
                "query": "How many modules role based access system has?",
                "k": 3
            }

            const response = await this.chromaSearchService.searchInChromaDB(query, k);
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Get collection info
     */
    async getCollectionInfo(req: Request, res: Response) {
        try {
            const response = await this.chromaSearchService.getCollectionInfo();
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Delete collection
     */
    async deleteCollection(req: Request, res: Response) {
        try {
            const response = await this.chromaSearchService.deleteCollection();
            return res.json(response);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }
}
