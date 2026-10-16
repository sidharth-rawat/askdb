import type { Redis } from "ioredis";
import type Groq from "groq-sdk";
import * as redisService from "../services/redis/redis.service.js";
import type {
  NormalizedSchema,
  ExecutionResult,
  AskResponse,
} from "../types.js";
import { pruneSchema, buildSchemaDescription } from "../services/schema/schema.service.js";
import * as aiService from "../services/ai/ai.service.js";
import * as databaseManager from "./database.manager.js";
import { validateSQL } from "../services/database/sql.service.js";

const ask = async (
  databaseId: string,
  message: string,
  redis: Redis,
  ai: Groq,
  db: any,
): Promise<AskResponse> => {

  try {
    // Get cached schema from Redis
    const cachedSchema = await redisService.getCachedSchema(redis, databaseId);
    if (!cachedSchema) {
      throw new Error(
        "Error retrieving database schema, please reconnect the database.",
      );
    }
    console.log("Cached schema retrieved:", cachedSchema);

    // Prune the schema to reduce context size
    const schema = cachedSchema as NormalizedSchema;
    const prunedSchema = await pruneSchema(schema, message);
    console.log("Pruned schema:", prunedSchema);
    if (!prunedSchema) {
      throw new Error("Error pruning database schema.");
    }

    // Generate query
    const response = await aiService.generateQuery(
      ai,
      message,
      prunedSchema,
    );
    console.log("AI response:", response);

    // Conversational reply (greeting / help / non-data) — nothing to run.
    if (response?.type === "chat") {
      return {
        query: "",
        explanation: response.explanation,
        executionResult: { success: true, data: [], count: 0, executionTime: 0 },
        type: "chat",
        executed: false,
      };
    }

    // Optimize intent: user wants to analyze/explain/speed up a query
    if (response?.type === "optimize") {
      if (schema.source !== "postgres") {
        return {
          query: response.query,
          explanation: "Query optimization is currently available for PostgreSQL only.",
          executionResult: { success: true, data: [], count: 0, executionTime: 0 },
          type: "analysis",
          executed: false,
        };
      }

      const explained = await databaseManager.explain(databaseId, response.query, db);
      const schemaText = buildSchemaDescription(prunedSchema);
      const advice = explained.ok
        ? await aiService.generateOptimization(ai, message, response.query, explained.plan ?? "", schemaText)
        : `Could not analyze the query: ${explained.error}`;

      const result: AskResponse = {
        query: response.query,
        explanation: advice,
        executionResult: { success: true, data: [], count: 0, executionTime: 0 },
        type: "analysis",
        executed: false,
      };

      if (explained.plan) {
        result.plan = explained.plan;
      }

      return result;
    }

    if (!response || !response.query) {
      throw new Error("Failed to generate query from the provided message.");
    }

    // Decide whether to run it. Only clean read-only SQL (SELECT/WITH) is
    // executed. Any write/DDL statement is returned as a PREVIEW and never run.
    // (Mongo aggregation pipelines are inherently read-only here.)
    const isReadOnly =
      response.type === "sql"
        ? validateSQL(response.query).isValid
        : Array.isArray(response.query); // mongo: a read is an aggregation pipeline (array); a write op is not

    if (!isReadOnly) {
      console.log("Write query detected — returning preview without executing.");
      return {
        query: response.query,
        explanation: response.explanation,
        executionResult: { success: true, data: [], count: 0, executionTime: 0 },
        type: response.type,
        executed: false,
      };
    }

    // Execute query through database adapter
    const executionResult = await databaseManager.executeQuery(
      databaseId,
      response,
      db,
    );

    console.log("Execution Result:", executionResult);
    return {
      query: response.query,
      explanation: response.explanation,
      executionResult,
      type: response.type,
      executed: true,
    };
  } catch (error: any) {
    console.error("Error in chat.manager.ask:", error);
    throw error;
  }
};

export { ask };
