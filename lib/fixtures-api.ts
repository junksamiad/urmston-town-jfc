// API service for fetching fixtures from the PHP endpoint
const API_BASE_URL = "https://pages.urmstontownjfc.co.uk/api/fixtures";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface ApiFixture {
  id: number;
  fixture_date: string; // ISO datetime
  home_team: string;
  away_team: string;
  venue: string | null;
  competition: string;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "completed" | "postponed" | "cancelled";
  age_group: string | null;
  league?: string; // Optional as it might not always be present
  created_at: string;
  updated_at: string;
  is_home: boolean;
  formatted_date: string;
  formatted_time: string;
  date_only: string; // YYYY-MM-DD
  pitch: string | null;
  original_venue: string | null;
}

export interface FixtureGroup {
  date: string; // YYYY-MM-DD
  formatted_date: string; // Display format
  fixtures: ApiFixture[];
}

export interface ApiResponse {
  success: boolean;
  fixtures: ApiFixture[] | FixtureGroup[];
  total?: number;
  error?: string;
  grouped_by_date?: boolean;
}

export interface FixturesFilters {
  team?: string;
  status?: "upcoming" | "completed" | "postponed" | "cancelled";
  from?: string; // YYYY-MM-DD format
  to?: string; // YYYY-MM-DD format
  limit?: number;
  group_by_date?: boolean;
}

// Simple in-memory cache
interface CacheEntry {
  data: ApiResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(filters: FixturesFilters = {}): string {
  return JSON.stringify(filters);
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

async function fetchFromAPI(url: string): Promise<ApiResponse> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("Fixtures API error:", error);
    throw error instanceof Error ? error : new Error("Unknown API error");
  }
}

export async function getFixtures(filters: FixturesFilters = {}): Promise<ApiResponse> {
  const cacheKey = getCacheKey(filters);
  const cachedEntry = cache.get(cacheKey);

  // Return cached data if valid
  if (cachedEntry && isCacheValid(cachedEntry)) {
    return cachedEntry.data;
  }

  // Build query parameters
  const params = new URLSearchParams();

  if (filters.team && filters.team !== "all") {
    params.append("team", filters.team);
  }

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.from) {
    params.append("from", filters.from);
  }

  if (filters.to) {
    params.append("to", filters.to);
  }

  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  if (filters.group_by_date) {
    params.append("group_by_date", "true");
  }

  const url = `${API_BASE_URL}/get-enhanced.php${params.toString() ? `?${params.toString()}` : ""}`;

  const data = await fetchFromAPI(url);

  // Cache the result
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

// Helper functions for common queries
export async function getUpcomingFixtures(team?: string, limit: number = 20): Promise<ApiResponse> {
  return getFixtures({
    status: "upcoming",
    team,
    limit,
    group_by_date: true,
  });
}

export async function getRecentResults(team?: string, limit: number = 20): Promise<ApiResponse> {
  return getFixtures({
    status: "completed",
    team,
    limit,
    group_by_date: true,
  });
}

export async function getTeamFixtures(team: string, limit: number = 50): Promise<ApiResponse> {
  return getFixtures({
    team,
    limit,
  });
}

// Clear cache (useful for force refresh)
export function clearFixturesCache(): void {
  cache.clear();
}