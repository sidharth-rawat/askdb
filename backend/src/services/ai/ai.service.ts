import type Groq from "groq-sdk";
import type { NormalizedSchema } from "../../types.js";
import { buildUserPrompt, initializePrompt } from "./prompts.service.js";

// Groq model id. Override with GROQ_MODEL in the environment if this one is
// retired — see the model list at https://console.groq.com/docs/models
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export const generateQuery = async (
  client: Groq,
  userQuery: string,
  schema: NormalizedSchema,
): Promise<any> => {
  const userPrompt = buildUserPrompt(schema, userQuery);

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: initializePrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Groq");
    }
    console.log("Groq raw response content:", content);

    const parsed = JSON.parse(content);

    // Optimize intent: user wants to analyze/explain/speed up a query
    if (parsed.optimize && parsed.query) {
      return { type: "optimize", query: String(parsed.query) };
    }

    // Conversational reply (greeting / help / non-data message) — no query.
    if (parsed.message && !parsed.query) {
      return {
        type: "chat",
        query: null,
        explanation: String(parsed.message),
      };
    }

    if (!parsed.query) {
      throw new Error("Invalid response format: missing query");
    }

    if (schema.source === "postgres") {
      if (typeof parsed.query !== "string") {
        throw new Error("Expected SQL query as string");
      }

      return {
        type: "sql",
        query: parsed.query.trim(),
        explanation: parsed.explanation || "No explanation provided",
      };
    }

    if (schema.source === "mongo") {
      if (!parsed.collection) {
        throw new Error("Missing collection name for Mongo query");
      }

      // A read is an aggregation pipeline (array) and gets executed.
      // A write op (insert/update/delete) is returned as a non-array object
      // and is shown as a preview only — never executed.
      return {
        type: "mongo",
        collection: parsed.collection,
        query: parsed.query,
        explanation: parsed.explanation || "No explanation provided",
      };
    }
  } catch (error: any) {
    console.log("Groq generation error:", error);
    throw error;
  }
};

export const generateOptimization = async (
  client: Groq,
  userQuery: string,
  sql: string,
  plan: string,
  schemaText: string,
): Promise<string> => {
  try {
    const userMessage = `User request: ${userQuery}

SQL Query:
${sql}

EXPLAIN PLAN:
${plan}

Database Schema (with indexes):
${schemaText}`;

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a PostgreSQL performance expert. Given a SQL query, its EXPLAIN plan, and the available indexes, explain in plain English what the plan is doing, whether existing indexes are used or a sequential scan is happening, and give concrete, specific optimization suggestions (which column(s) to index with a CREATE INDEX statement the user could run, and any query rewrite). Be concise and practical. Respond in plain text/markdown, NOT JSON.",
        },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content ?? "No analysis available.";
  } catch (error: any) {
    console.log("Groq optimization error:", error);
    return "Unable to generate optimization suggestions at this time.";
  }
};
