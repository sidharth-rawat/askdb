import type { NormalizedSchema } from "../../types.js";
import { STOP_WORDS, semanticHints } from "../../utils/constant.util.js";

/** This service is used to prune the database schema based on the user's query to optimize LLM context usage */
export const pruneSchema = async (
  cachedSchema: NormalizedSchema,
  message: string,
): Promise<NormalizedSchema> => {
  const schema = cachedSchema;
  const tableNames = Object.keys(schema.tables);

  // if table length is less than or equal to 5, no need of pruning
  if (tableNames.length <= 5) {
    return schema;
  }

  const messageLower = message.toLowerCase();

  // Remove stop words & noise
  const words = messageLower
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const tableScores = new Map<string, number>();
  // Tables whose name a message word matches exactly — always included so the
  // table the user explicitly names can never be pruned out of context.
  const exactMatches = new Set<string>();

  for (const tableName of tableNames) {
    const table = schema.tables[tableName];
    if (!table) continue;

    let score = 0;
    const tableNameLower = tableName.toLowerCase();
    const columnNames = table.columns.map((c) => c.name.toLowerCase());

    // Table name match
    if (messageLower.includes(tableNameLower)) score += 80;

    // singular / plural
    const singular = tableNameLower.endsWith("s")
      ? tableNameLower.slice(0, -1)
      : tableNameLower;
    const plural = singular.endsWith("s") ? singular : `${singular}s`;

    if (messageLower.includes(singular) || messageLower.includes(plural)) {
      score += 60;
    }

    // General important columns
    if (
      messageLower.includes("email") &&
      columnNames.some((c) => c.includes("email"))
    ) {
      score += 70;
    }

    if (
      messageLower.includes("name") &&
      columnNames.some((c) => c.includes("name"))
    ) {
      score += 40;
    }

    if (messageLower.includes("id") && columnNames.some((c) => c === "id")) {
      score += 10;
    }

    // Word-level matching
    for (const word of words) {
      // Exact table-name token match (e.g. message word "booking" == singular
      // of table "bookings") is a strong signal — dominate lookalike tables
      // like "booking_crops" so the table actually asked about is never dropped.
      if (tableNameLower === word || singular === word || plural === word) {
        score += 120;
        exactMatches.add(tableName);
      } else if (tableNameLower.includes(word)) {
        score += 30;
      }

      for (const col of columnNames) {
        if (col === word) score += 25;
        else if (col.includes(word)) score += 15;
      }
    }

    for (const [key, hints] of Object.entries(semanticHints)) {
      if (tableNameLower.includes(key)) {
        for (const hint of hints) {
          if (messageLower.includes(hint)) score += 25;
        }
      }
    }

    if (score > 0) {
      tableScores.set(tableName, score);
    }
  }

  // Dont return full schema due to LLM context limits
  if (tableScores.size === 0) {
    return {
      source: schema.source,
      tables: {},
    };
  }

  // Ranking tables
  const MIN_SCORE = 50;

  const primaryTables = Array.from(tableScores.entries())
    .filter(([, score]) => score >= MIN_SCORE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  if (primaryTables.length === 0) {
    return {
      source: schema.source,
      tables: {},
    };
  }

  // Controlled FK expansion
  const selectedTables = new Set<string>(primaryTables);

  // Guarantee: any table the user named explicitly is always included.
  for (const t of exactMatches) selectedTables.add(t);

  for (const tableName of primaryTables) {
    const table = schema.tables[tableName];
    if (!table) continue;

    const tableScore = tableScores.get(tableName) ?? 0;
    if (tableScore < 90) continue;

    for (const col of table.columns) {
      if (col.foreignKeys) {
        for (const fk of col.foreignKeys) {
          selectedTables.add(fk.referencesTable);
        }
      }
    }
  }

  // Build pruned schema
  const prunedSchema: NormalizedSchema = {
    source: schema.source,
    tables: {},
  };

  for (const tableName of selectedTables) {
    const table = schema.tables[tableName];
    if (table) {
      prunedSchema.tables[tableName] = table;
    }
  }

  return prunedSchema;
};

/** Helps in building the schema description which is to be sent to the LLM */
export const buildSchemaDescription = (schema: NormalizedSchema): string => {
  const lines: string[] = [];

  lines.push(`Database Type: ${schema.source}`);
  lines.push(`Entities:\n`);

  for (const [tableName, table] of Object.entries(schema.tables)) {
    lines.push(`Entity: ${tableName}`);
    lines.push(`Fields:`);

    for (const column of table.columns) {
      let desc = `  - ${column.name} (${column.type})`;

      if (column.isPrimaryKey) desc += " [PRIMARY KEY]";
      if (!column.nullable) desc += " [NOT NULL]";

      if (column.foreignKeys?.length) {
        for (const fk of column.foreignKeys) {
          desc += ` [FK → ${fk.referencesTable}.${fk.referencesColumn}]`;
        }
      }

      lines.push(desc);
    }

    if (table.indexes?.length) {
      lines.push("Indexes:");
      for (const index of table.indexes) {
        const cols = Array.isArray(index.columns) ? index.columns : [];
        let indexDesc = `  - ${index.name} on (${cols.join(", ")})`;
        if (index.unique) {
          indexDesc += " [UNIQUE]";
        }
        lines.push(indexDesc);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
};
