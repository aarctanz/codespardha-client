import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "./api";
import type {
  Problem,
  ProblemDetail,
  Contest,
  ContestDetail,
  Language,
  Submission,
  SubmissionDetail,
  PaginatedResponse,
  ProfileStats,
  PublicProfile,
  Leaderboard,
  ServerTime,
} from "./types";

export const problemsetQuery = queryOptions({
  queryKey: ["problemset"],
  queryFn: () => apiFetch<Problem[]>("/problemset/"),
});

export const problemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["problem", slug],
    queryFn: () => apiFetch<ProblemDetail>(`/problemset/${slug}`),
  });

export const contestsQuery = queryOptions({
  queryKey: ["contests"],
  queryFn: () => apiFetch<Contest[]>("/contests/"),
});

export const contestQuery = (contestNumber: string) =>
  queryOptions({
    queryKey: ["contest", contestNumber],
    queryFn: () => apiFetch<ContestDetail>(`/contests/${contestNumber}`),
    staleTime: 1000 * 60 * 5,
  });

export const languagesQuery = queryOptions({
  queryKey: ["languages"],
  queryFn: () => apiFetch<Language[]>("/languages/"),
  staleTime: Infinity,
});

export const submissionsQuery = (page: number = 1) =>
  queryOptions({
    queryKey: ["submissions", page],
    queryFn: () =>
      apiFetch<PaginatedResponse<Submission>>(
        `/submissions/?page=${page}`,
      ),
  });

export const submissionQuery = (id: string) =>
  queryOptions({
    queryKey: ["submission", id],
    queryFn: () => apiFetch<SubmissionDetail>(`/submissions/${id}`),
  });

export const profileStatsQuery = queryOptions({
  queryKey: ["profileStats"],
  queryFn: () => apiFetch<ProfileStats>("/profile/stats"),
});

export const publicProfileQuery = (rollNumber: string) =>
  queryOptions({
    queryKey: ["profile", rollNumber],
    queryFn: () => apiFetch<PublicProfile>(`/profile/${rollNumber}`),
  });

export const leaderboardQuery = (contestNumber: string, page: number = 1) =>
  queryOptions({
    queryKey: ["leaderboard", contestNumber, page],
    queryFn: () =>
      apiFetch<Leaderboard>(
        `/contests/${contestNumber}/leaderboard?page=${page}&pageSize=50`,
      ),
  });

export const approachQuery = (slug: string) =>
  queryOptions({
    queryKey: ["approach", slug],
    queryFn: () =>
      apiFetch<{ content: string }>(`/problemset/${slug}/approach`).catch(
        () => ({ content: "" }),
      ),
  });

export const serverTimeQuery = queryOptions({
  queryKey: ["serverTime"],
  queryFn: () => apiFetch<ServerTime>("/time"),
  staleTime: 1000 * 30,
});
