"use client";

import { Bot, Clock, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ExecutionResult {
  success: boolean;
  data: any[];
  count: number;
  executionTime: number;
}

interface ResponseData {
  query?: string | any[];
  type?: string;
  explanation: string;
  executionResult: ExecutionResult;
  executed?: boolean;
  plan?: string;
}

interface ResponseInputProps {
  data: ResponseData;
  timestamp?: string;
}

export function ResponseChatBox({ data, timestamp }: ResponseInputProps) {
  const { query, type, explanation, executionResult, executed, plan } = data;

  const isMongoQuery = type === "mongo" || Array.isArray(query);
  const isPreview = executed === false;

  // Conversational reply (greeting/help) or an optimization analysis —
  // plain text bubble, no results table. Analysis also shows the EXPLAIN plan.
  if (type === "chat" || type === "analysis") {
    return (
      <div className="flex items-start gap-2 mb-4 justify-start">
        <span className="grid place-items-center size-7 rounded-md border border-primary/40 bg-primary/10 font-mono text-primary text-xs" aria-hidden>{">_"}</span>
        <div className="flex flex-col gap-0.5 max-w-[75%] min-w-0">
          <div className="relative bg-card border border-border rounded-lg rounded-bl-none px-3.5 py-2.5">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
            {type === "analysis" && plan && (
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  EXPLAIN plan
                </p>
                <div className="bg-background border border-border rounded-md p-3 overflow-x-auto">
                  <pre className="font-mono text-[11px] leading-relaxed text-muted-foreground whitespace-pre">
                    {plan}
                  </pre>
                </div>
              </div>
            )}
          </div>
          {timestamp && (
            <span className="text-[10px] text-muted-foreground ml-1.5">{timestamp}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mb-4 justify-start">
      <span className="grid place-items-center size-7 rounded-md border border-primary/40 bg-primary/10 font-mono text-primary text-xs" aria-hidden>{">_"}</span>

      <div className="flex flex-col gap-0.5 max-w-[75%] min-w-150">
        <div className="relative bg-card border border-border rounded-lg rounded-bl-none shadow-lg px-3 py-3">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-10 border-t-card border-r-10 border-r-transparent"></div>
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-11 border-t-border border-r-11 border-r-transparent -z-10"></div>

          {/* Tabs for Query and Results */}
          <Tabs defaultValue={isPreview ? "query" : "results"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted border border-border h-8">
              <TabsTrigger
                value="results"
                className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground text-xs"
              >
                Results
              </TabsTrigger>
              <TabsTrigger
                value="query"
                className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground text-xs"
              >
                Query
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="mt-2">
              {/* Explanation */}
              <div className="mb-2">
                <p className="text-foreground text-xs leading-relaxed">
                  {explanation}
                </p>
              </div>

              <div className="bg-background border border-border rounded-md p-3 font-mono text-sm text-foreground overflow-x-auto">
                <pre className="text-[11px] leading-relaxed">
                  {isMongoQuery
                    ? JSON.stringify(query, null, 2)
                    : query}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-2">
              {isPreview ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed">
                  <p className="font-medium text-foreground">
                    Preview only — not executed
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    askdb runs read-only queries. This is a write operation, so
                    it was generated for review but never run against your
                    database. Copy it from the Query tab if you want to run it
                    yourself.
                  </p>
                </div>
              ) : (
              <>
              <Card className="bg-background border-border">
                <CardContent className="p-0">
                  {executionResult.success ? (
                    <ScrollArea className="max-h-60 max-w-full overflow-auto border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted border-b border-border sticky top-0">
                            <tr>
                              {executionResult.data.length > 0 &&
                                Object.keys(executionResult.data[0]).map(
                                  (key) => (
                                    <th
                                      key={key}
                                      className="px-3 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                                    >
                                      {key}
                                    </th>
                                  )
                                )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {executionResult.data.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                {Object.values(row).map((value: any, i) => (
                                  <td
                                    key={i}
                                    className="px-3 py-1.5 text-foreground whitespace-nowrap"
                                  >
                                    {value !== null && value !== undefined
                                      ? typeof value === "object"
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)
                                      : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-red-400 text-sm">
                      Query execution failed
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Stats */}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>{executionResult.count} rows</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{executionResult.executionTime}ms</span>
                </div>
              </div>
              </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {timestamp && (
          <span className="text-[10px] text-muted-foreground ml-1.5">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
