import { useState, useEffect, useCallback, useRef } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { problemQuery, languagesQuery, approachQuery } from "@/lib/queries";
import { apiFetch } from "@/lib/api";
import type { RunResult, TestResult } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Editor from "@monaco-editor/react";
import { Loader2, GripHorizontal, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createLazyFileRoute("/_authenticated/problemset/$slug")({
  component: ProblemPage,
});

function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function formatTimeLimit(ms: number): string {
  if (ms >= 1000 && ms % 1000 === 0) return `${ms / 1000}s`;
  return `${ms}ms`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getCodeStorageKey(slug: string, languageId: number | null) {
  return `spring:code:${slug}:${languageId ?? "none"}`;
}

function ProblemPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: problem } = useSuspenseQuery(problemQuery(slug));
  const { data: languages } = useSuspenseQuery(languagesQuery);
  const { data: approachData } = useSuspenseQuery(approachQuery(slug));
  const isDark = useIsDark();

  const [activeTab, setActiveTab] = useState<"approach" | "code">(
    approachData.content ? "code" : "approach",
  );

  // Approach state
  const [approach, setApproach] = useState(() => {
    const saved = sessionStorage.getItem(`spring:approach:${slug}`);
    return saved ?? approachData.content ?? "";
  });

  const hasApproach = !!approachData.content;
  const wordCount = countWords(approach);
  const approachValid = wordCount >= 20 && wordCount <= 500;

  // Language state
  const [languageId, setLanguageId] = useState<number | null>(() => {
    const savedLang = localStorage.getItem("spring:lang");
    if (savedLang) {
      const id = Number(savedLang);
      if (languages.some((l) => l.engineLanguageId === id)) return id;
    }
    return languages[0]?.engineLanguageId ?? null;
  });

  // Code state — per language per problem
  const codeKey = getCodeStorageKey(slug, languageId);
  const [sourceCode, setSourceCode] = useState(() => {
    return sessionStorage.getItem(codeKey) ?? "";
  });

  // When language changes, load code for that language from sessionStorage
  const prevCodeKeyRef = useRef(codeKey);
  useEffect(() => {
    if (prevCodeKeyRef.current !== codeKey) {
      setSourceCode(sessionStorage.getItem(codeKey) ?? "");
      prevCodeKeyRef.current = codeKey;
    }
  }, [codeKey]);

  const [showPanel, setShowPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(200);
  const [runResults, setRunResults] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Debounced save: code to sessionStorage
  const codeSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (codeSaveTimerRef.current) clearTimeout(codeSaveTimerRef.current);
    codeSaveTimerRef.current = setTimeout(() => {
      sessionStorage.setItem(codeKey, sourceCode);
      if (languageId !== null) {
        localStorage.setItem("spring:lang", String(languageId));
      }
    }, 1000);
    return () => {
      if (codeSaveTimerRef.current) clearTimeout(codeSaveTimerRef.current);
    };
  }, [sourceCode, codeKey, languageId]);

  // Debounced save: approach to sessionStorage
  const approachSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (approachSaveTimerRef.current) clearTimeout(approachSaveTimerRef.current);
    approachSaveTimerRef.current = setTimeout(() => {
      sessionStorage.setItem(`spring:approach:${slug}`, approach);
    }, 1000);
    return () => {
      if (approachSaveTimerRef.current) clearTimeout(approachSaveTimerRef.current);
    };
  }, [approach, slug]);

  const saveCodeNow = useCallback(() => {
    sessionStorage.setItem(codeKey, sourceCode);
    if (languageId !== null) {
      localStorage.setItem("spring:lang", String(languageId));
    }
  }, [codeKey, sourceCode, languageId]);

  const selectedLanguage = languages.find(
    (l) => l.engineLanguageId === languageId,
  );
  const monacoLanguage = getMonacoLanguage(selectedLanguage?.name ?? "");

  // Save approach mutation
  const approachMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/problemset/${slug}/approach`, {
        method: "POST",
        body: JSON.stringify({ content: approach }),
      }),
    onSuccess: () => {
      queryClient.setQueryData(approachQuery(slug).queryKey, {
        content: approach,
      });
    },
  });

  const runMutation = useMutation({
    mutationFn: () =>
      apiFetch<RunResult>("/run", {
        method: "POST",
        body: JSON.stringify({
          slug,
          engineLanguageId: languageId,
          sourceCode,
        }),
      }),
    onMutate: () => {
      saveCodeNow();
      setRunResults(null);
      setRunError(null);
      setShowPanel(true);
    },
    onSuccess: (data) => setRunResults(data),
    onError: (err) => setRunError(err.message),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ submissionId: string }>("/submit", {
        method: "POST",
        body: JSON.stringify({
          slug,
          engineLanguageId: languageId,
          sourceCode,
        }),
      }),
    onMutate: () => saveCodeNow(),
    onSuccess: (data) => {
      navigate({ to: "/submissions/$id", params: { id: data.submissionId } });
    },
  });

  const isBusy =
    runMutation.isPending ||
    submitMutation.isPending ||
    approachMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Left panel - Problem description */}
      <div className="w-1/2 shrink-0 overflow-y-auto rounded-lg border p-6">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          <span>Time limit: {formatTimeLimit(problem.timeLimitMs)}</span>
          <span>Memory limit: {problem.memoryLimitMb}MB</span>
        </div>
        {problem.tags.length > 0 && (
          <div className="mt-2 flex gap-2">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="prose prose-base dark:prose-invert mt-4 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{problem.description}</ReactMarkdown>
        </div>

        {problem.testCases.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Sample Test Cases</h2>
            {problem.testCases.map((tc, i) => (
              <div key={tc.order} className="space-y-2">
                <h3 className="text-sm font-medium">Example {i + 1}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Input
                    </p>
                    <pre className="rounded bg-muted p-2 text-sm">
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Expected Output
                    </p>
                    <pre className="rounded bg-muted p-2 text-sm">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel - Editor + results */}
      <div className="flex min-w-0 flex-1 flex-col rounded-lg border">
        {/* Tabs */}
        <div className="flex items-center border-b">
          <button
            onClick={() => setActiveTab("approach")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "approach"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Approach
            {!hasApproach && (
              <span className="ml-1.5 inline-block size-1.5 rounded-full bg-destructive" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "code"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Code
          </button>

          {/* Toolbar - right side */}
          <div className="ml-auto flex items-center gap-2 px-4">
            {activeTab === "code" && (
              <Select
                value={languageId?.toString()}
                onValueChange={(val) => setLanguageId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedLanguage
                      ? `${selectedLanguage.name} (${selectedLanguage.version})`
                      : "Select language"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.engineLanguageId}
                      value={lang.engineLanguageId.toString()}
                    >
                      {lang.name} ({lang.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeTab === "approach" && (
              <Button
                variant="outline"
                onClick={() => approachMutation.mutate()}
                disabled={isBusy || !approachValid}
              >
                {approachMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {approachMutation.isPending ? "Saving..." : "Save Approach"}
              </Button>
            )}

            {activeTab === "code" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => runMutation.mutate()}
                  disabled={isBusy || !languageId || !hasApproach}
                >
                  {runMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {runMutation.isPending ? "Running..." : "Run"}
                </Button>
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={isBusy || !languageId || !hasApproach}
                >
                  {submitMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {submitMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Approach tab hint */}
        {activeTab === "code" && !hasApproach && (
          <div className="bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            You must{" "}
            <button
              className="font-medium text-primary underline underline-offset-2"
              onClick={() => setActiveTab("approach")}
            >
              submit an approach
            </button>{" "}
            before you can run or submit code.
          </div>
        )}

        {/* Editor area */}
        <div className="min-h-0 flex-1">
          {activeTab === "approach" ? (
            <div className="flex h-full flex-col">
              <Editor
                language="markdown"
                value={approach}
                onChange={(val) => setApproach(val ?? "")}
                theme={isDark ? "vs-dark" : "vs"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "off",
                }}
              />
              <div className="flex items-center justify-between border-t px-4 py-1.5 text-xs text-muted-foreground">
                <span>
                  Write your approach to solving this problem (20–500 words)
                </span>
                <span
                  className={
                    wordCount < 20 || wordCount > 500
                      ? "text-destructive"
                      : "text-verdict-accepted"
                  }
                >
                  {wordCount}/500 words
                </span>
              </div>
              {approachMutation.isError && (
                <div className="px-4 pb-2 text-sm text-destructive">
                  {approachMutation.error.message}
                </div>
              )}
              {approachMutation.isSuccess && (
                <div className="px-4 pb-2 text-sm text-verdict-accepted">
                  Approach saved successfully
                </div>
              )}
            </div>
          ) : (
            <Editor
              language={monacoLanguage}
              value={sourceCode}
              onChange={(val) => setSourceCode(val ?? "")}
              theme={isDark ? "vs-dark" : "vs"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
              }}
            />
          )}
        </div>

        {/* Resizable results panel */}
        {showPanel && activeTab === "code" && (
          <ResultsPanel
            height={panelHeight}
            onHeightChange={setPanelHeight}
            onClose={() => {
              setShowPanel(false);
              setRunResults(null);
              setRunError(null);
            }}
            isPending={runMutation.isPending}
            results={runResults}
            error={runError}
          />
        )}
      </div>
    </div>
  );
}

function ResultsPanel({
  height,
  onHeightChange,
  onClose,
  isPending,
  results,
  error,
}: {
  height: number;
  onHeightChange: (h: number) => void;
  onClose: () => void;
  isPending: boolean;
  results: RunResult | null;
  error: string | null;
}) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startY.current = e.clientY;
      startHeight.current = height;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";

      const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startY.current - e.clientY;
        const newHeight = Math.max(
          100,
          Math.min(500, startHeight.current + delta),
        );
        onHeightChange(newHeight);
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [height, onHeightChange],
  );

  return (
    <div className="flex flex-col border-t" style={{ height }}>
      {/* Drag handle */}
      <div
        className="flex shrink-0 cursor-row-resize items-center justify-center border-b py-0.5 hover:bg-muted"
        onMouseDown={onMouseDown}
      >
        <GripHorizontal className="size-4 text-muted-foreground" />
      </div>

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-1.5">
        <h3 className="text-sm font-semibold">
          {isPending ? "Running..." : "Run Results"}
        </h3>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        {isPending && (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Running your code...
          </div>
        )}
        {error && (
          <div className="py-2">
            <p className="text-sm text-verdict-failed">{error}</p>
          </div>
        )}
        {results && <RunResultsContent results={results} />}
      </div>
    </div>
  );
}

function RunResultsContent({ results }: { results: RunResult }) {
  if (results.compileOutput) {
    return (
      <div>
        <p className="text-sm font-medium text-verdict-failed">
          Compilation Error
        </p>
        <pre className="mt-1 text-sm text-verdict-failed">
          {results.compileOutput}
        </pre>
      </div>
    );
  }

  const passed = results.testCases.filter(
    (t) => t.status === "accepted",
  ).length;
  const total = results.testCases.length;

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span
          className={
            passed === total ? "text-verdict-accepted" : "text-verdict-failed"
          }
        >
          {passed}/{total} test cases passed
        </span>
      </p>
      {results.testCases.map((tr) => (
        <TestResultRow key={tr.position} result={tr} />
      ))}
    </div>
  );
}

function TestResultRow({ result }: { result: TestResult }) {
  const passed = result.status === "accepted";
  return (
    <div className="space-y-2 rounded border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Test {result.position}</span>
        <span
          className={passed ? "text-verdict-accepted" : "text-verdict-failed"}
        >
          {result.status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="font-medium text-muted-foreground">stdin</p>
          <pre className="rounded bg-muted p-1.5">{result.stdin}</pre>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">expected</p>
          <pre className="rounded bg-muted p-1.5">{result.expectedOutput}</pre>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">stdout</p>
          <pre className="rounded bg-muted p-1.5">{result.stdout}</pre>
        </div>
      </div>
      {result.stderr && (
        <div className="text-xs">
          <p className="font-medium text-muted-foreground">stderr</p>
          <pre className="rounded bg-muted p-1.5 text-verdict-failed">
            {result.stderr}
          </pre>
        </div>
      )}
    </div>
  );
}

function getMonacoLanguage(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("python")) return "python";
  if (lower.includes("java") && !lower.includes("javascript")) return "java";
  if (lower.includes("javascript")) return "javascript";
  if (lower.includes("typescript")) return "typescript";
  if (lower.includes("c++") || lower.includes("cpp")) return "cpp";
  if (lower.includes("c#") || lower.includes("csharp")) return "csharp";
  if (lower.includes("go")) return "go";
  if (lower.includes("rust")) return "rust";
  return "c";
}
