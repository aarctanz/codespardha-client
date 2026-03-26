export interface Problem {
  slug: string;
  label: string;
  title: string;
  description?: string;
  difficulty: number;
  score: number;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  visibleFrom?: string;
  solved: boolean;
  tags: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  order: number;
}

export interface ProblemDetail extends Problem {
  description: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  visibleFrom: string;
  testCases: TestCase[];
}

export interface Contest {
  contestNumber: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface ContestDetail extends Contest {
  problems: Problem[];
}

export interface Language {
  engineLanguageId: number;
  name: string;
  version: string;
}

export interface Submission {
  id: string;
  slug: string;
  problemTitle: string;
  languageName: string;
  engineLanguageId: number;
  status: string;
  score: number;
  timeSec: number | null;
  memoryKb: number | null;
  createdAt: string;
}

export interface TestResult {
  position: number;
  status: string;
  timeSec?: number;
  memoryKb?: number;
  stdin?: string;
  expectedOutput?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}

export interface SubmissionDetail extends Submission {
  sourceCode: string;
  compileOutput: string | null;
  testResults: TestResult[];
}

export interface RunResult {
  status: string;
  time: number;
  memory: number;
  compileOutput: string | null;
  testCases: TestResult[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ServerTime {
  serverTime: string;
}

export interface ProfileStats {
  solved: { easy: number; medium: number; hard: number; total: number };
  total: { easy: number; medium: number; hard: number; total: number };
  submissions: number;
  accepted: number;
  acceptanceRate: number;
}

export interface PublicProfile extends ProfileStats {
  name: string;
  image: string;
  rollNumber: string;
}

export interface ProblemBreakdown {
  label: string;
  slug: string;
  solved: boolean;
  score: number;
  wrongAttempts: number;
  attempts: number;
  firstAcTime: string | null;
}

export interface StandingEntry {
  rank: number;
  name: string;
  rollNumber: string;
  image: string | null;
  totalScore: number;
  penalty: number;
  problemsSolved: number;
  lastAcceptedAt: string | null;
  breakdown: ProblemBreakdown[];
}

export interface Leaderboard {
  ended: boolean;
  currentUser: StandingEntry | null;
  standings: StandingEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Session {
  session: {
    id: string;
    expiresAt: string;
    token: string;
    userId: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    role: string;
    rollNumber: string;
  };
}
