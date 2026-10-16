import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import Groq from "groq-sdk";

declare module 'fastify' {
    interface FastifyInstance {
        ai: Groq;
    }
}

export const aiPlugin = fp(async (app: FastifyInstance) => {
    const apiKey = app.config.AI_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
        app.log.warn("AI_API_KEY not configured. LLM features will be disabled.");
        return;
    }

    try {
        const client = new Groq({ apiKey });
        app.decorate("ai", client);
    } catch (error) {
        app.log.error(error, "Failed to initialize Groq service");
        throw error;
    }
});
