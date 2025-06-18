// managers/NewsManager.js
import { debugLogger } from '../utils.js';
import { newsData } from '../data/news_articles.js'; // Changed to .js and named import

class NewsManager {
    constructor(gameState) {
        console.log("MANAGER: NewsManager constructor called"); // Added log
        this.gameState = gameState;
        this.staticArticles = newsData.staticNewsArticles || [];
        this.dynamicTemplates = newsData.dynamicNewsTemplates || []; // For Phase 2

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('NewsManager', 'Initialized with static articles:', this.staticArticles.length);
        }
    }

    /**
     * Returns all static news articles, optionally sorted.
     * For Phase 1, timestamp sorting is basic string sort; can be improved.
     * @param {string} sortBy - Optional: 'timestamp_asc', 'timestamp_desc'.
     * @returns {Array<object>}
     */
    getStaticArticles(sortBy = null) {
        let articles = [...this.staticArticles];
        if (sortBy === 'timestamp_desc') {
            // Basic sort, assumes timestamps are comparable strings or numbers
            articles.sort((a, b) => {
                if (a.timestamp < b.timestamp) return 1;
                if (a.timestamp > b.timestamp) return -1;
                return 0;
            });
        } else if (sortBy === 'timestamp_asc') {
            articles.sort((a, b) => {
                if (a.timestamp < b.timestamp) return -1;
                if (a.timestamp > b.timestamp) return 1;
                return 0;
            });
        }
        return articles;
    }

    /**
     * Retrieves a specific static article by its ID.
     * @param {string} articleId - The ID of the static article.
     * @returns {object|undefined} The article object or undefined if not found.
     */
    getStaticArticleById(articleId) {
        return this.staticArticles.find(article => article.id === articleId);
    }

    // --- Placeholder for Phase 2: Dynamic News Generation ---
    /**
     * Generates a list of currently relevant dynamic news articles based on game state.
     * (This will be a more complex method in Phase 2)
     * @returns {Array<object>}
     */
    getDynamicArticles() {
        const triggeredDynamicNews = [];
        // Placeholder logic for Phase 2:
        // this.dynamicTemplates.forEach(template => {
        //     let conditionsMet = true;
        //     template.triggerConditions.forEach(condition => {
        //         // Evaluate condition against gameState (e.g., gameState.systemic, gameState.choices)
        //         // For example:
        //         // if (condition.type === "systemicStat") {
        //         //     const statValue = /* get value from gameState.systemic[condition.statId] */;
        //         //     if (!this._evaluateNumericCondition(statValue, condition.operator, condition.value)) {
        //         //         conditionsMet = false;
        //         //     }
        //         // }
        //     });
        //     if (conditionsMet) {
        //         // Populate template with dynamic values from gameState
        //         // const populatedArticle = this._populateNewsTemplate(template, this.gameState);
        //         // triggeredDynamicNews.push(populatedArticle);
        //     }
        // });
        if (this.gameState.DEBUG_MODE && triggeredDynamicNews.length > 0) {
            debugLogger.log('NewsManager', 'Generated dynamic articles:', triggeredDynamicNews);
        }
        return triggeredDynamicNews;
    }

    /**
     * Combines static and (future) dynamic news, sorts them, etc.
     * For Phase 1, this just returns static articles sorted by timestamp descending.
     */
    getAllDisplayableArticles() {
        // In Phase 2, this will merge static and dynamic news and sort them appropriately.
        return this.getStaticArticles('timestamp_desc');
    }

    // _evaluateNumericCondition(val1, operator, val2) { ... } // Helper for dynamic news
    // _populateNewsTemplate(template, gameState) { ... } // Helper for dynamic news
}

export { NewsManager };
