/**
 * @fileoverview ChromaDB Search Routes
 * 
 * This file defines the API routes for ChromaDB operations.
 * It provides endpoints for:
 * - PDF loading: POST /load-pdf
 * - Search: POST /search
 * - Collection info: GET /collection-info
 * - Delete collection: DELETE /delete-collection
 * 
 * @author Your Name
 * @version 1.0.0
 * @since 2024
 */

import { Router } from "express";
import { ChromaSearchController } from "../controllers/chroma-search.controller.js";

const router = Router();
const chromaSearchController = new ChromaSearchController();

// PDF operations
router.post("/load-pdf", chromaSearchController.loadPdfToChromaDB.bind(chromaSearchController));

// Search operations
router.post("/search", chromaSearchController.searchInChromaDB.bind(chromaSearchController));

// Collection management
router.get("/collection-info", chromaSearchController.getCollectionInfo.bind(chromaSearchController));
router.delete("/delete-collection", chromaSearchController.deleteCollection.bind(chromaSearchController));

export default router;
