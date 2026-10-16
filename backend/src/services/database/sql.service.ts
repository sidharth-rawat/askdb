import { dangerousKeywords } from "../../utils/constant.util.js";

/** Helps in validating SQL queries to ensure they are safe and read-only */
export const validateSQL = (
  sql: string,
): { isValid: boolean; error?: string } => {
  const sqlUpper = sql.toUpperCase().trim();

  for (const keyword of dangerousKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(sqlUpper)) {
      return {
        isValid: false,
        error: `Query contains forbidden operation: ${keyword}`,
      };
    }
  }

  if (!sqlUpper.startsWith("SELECT") && !sqlUpper.startsWith("WITH")) {
    return {
      isValid: false,
      error: "Only SELECT queries are allowed",
    };
  }

  const semicolonCount = (sql.match(/;/g) || []).length;
  if (
    semicolonCount > 1 ||
    (semicolonCount === 1 && !sql.trim().endsWith(";"))
  ) {
    return {
      isValid: false,
      error: "Multiple statements or suspicious semicolons detected",
    };
  }

  return { isValid: true };
};

/** Safely explain a query without executing it */
export const explainQuery = async (
  sql: string,
  pool: any,
): Promise<{ ok: boolean; plan?: string; error?: string }> => {
  const validated = validateSQL(sql);
  if (!validated.isValid) {
    return { ok: false, error: validated.error ?? "Invalid query" };
  }

  try {
    const cleanSQL = sql.trim().replace(/;$/, "");
    const result = await pool.query(`EXPLAIN ${cleanSQL}`);

    const plan = result.rows.map((row: any) => row["QUERY PLAN"]).join("\n");
    return { ok: true, plan };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
};
