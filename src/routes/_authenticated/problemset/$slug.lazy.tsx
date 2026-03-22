import { useState, useEffect, useCallback, useRef } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { problemQuery, languagesQuery } from "@/lib/queries";
import { apiFetch } from "@/lib/api";
import type { RunResult, TestResult } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";
import { Loader2, GripHorizontal, X } from "lucide-react";
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

function ProblemPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: problem } = useSuspenseQuery(problemQuery(slug));
  const { data: languages } = useSuspenseQuery(languagesQuery);
  const isDark = useIsDark();

  const storageKey = `spring:code:${slug}`;

  const [sourceCode, setSourceCode] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.code ?? "";
      }
    } catch {}
    return "";
  });
  const [languageId, setLanguageId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.languageId &&
          languages.some((l) => l.engineLanguageId === parsed.languageId)
        ) {
          return parsed.languageId;
        }
      }
    } catch {}
    return languages[0]?.engineLanguageId ?? null;
  });
  const [showPanel, setShowPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(200);
  const [runResults, setRunResults] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Save code to localStorage (throttled on change)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ code: sourceCode, languageId }),
    );
  }, [storageKey, sourceCode, languageId]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveToStorage, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [saveToStorage]);

  const selectedLanguage = languages.find(
    (l) => l.engineLanguageId === languageId,
  );

  const monacoLanguage = getMonacoLanguage(selectedLanguage?.name ?? "");

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
      saveToStorage();
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
    onMutate: () => saveToStorage(),
    onSuccess: (data) => {
      navigate({ to: "/submissions/$id", params: { id: data.submissionId } });
    },
  });

  const isBusy = runMutation.isPending || submitMutation.isPending;

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
        <div className="prose prose-sm dark:prose-invert mt-4 max-w-none">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
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
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => runMutation.mutate()}
              disabled={isBusy || !languageId}
            >
              {runMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {runMutation.isPending ? "Running..." : "Run"}
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={isBusy || !languageId}
            >
              {submitMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="min-h-0 flex-1">
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
        </div>

        {/* Resizable results panel */}
        {showPanel && (
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
        const newHeight = Math.max(100, Math.min(500, startHeight.current + delta));
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
            <p className="text-sm text-red-500">{error}</p>
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
        <p className="text-sm font-medium text-red-500">Compilation Error</p>
        <pre className="mt-1 text-sm text-red-400">{results.compileOutput}</pre>
      </div>
    );
  }

  const passed = results.testCases.filter((t) => t.status === "accepted").length;
  const total = results.testCases.length;

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className={passed === total ? "text-green-500" : "text-red-500"}>
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
        <span className={passed ? "text-green-500" : "text-red-500"}>
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
          <pre className="rounded bg-muted p-1.5 text-red-400">
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
