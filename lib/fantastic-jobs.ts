import "server-only";

const API_BASE = "https://data.fantastic.jobs/v1";

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
  "INTERN",
  "VOLUNTEER",
  "PER_DIEM",
  "OTHER",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_ARRANGEMENTS = [
  "On-site",
  "Hybrid",
  "Remote OK",
  "Remote Solely",
] as const;

export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];

export type JobSearchParams = {
  title?: string;
  location?: string;
  timeFrame?: string;
  employmentType?: string;
  workArrangement?: string;
  limit?: number;
};

export type Job = {
  id: number;
  title: string;
  organization: string | null;
  organization_logo: string | null;
  url: string;
  date_posted: string;
  employment_type: string[] | null;
  locations_derived: string[] | null;
  ai_work_arrangement: string | null;
  ai_salary_currency: string | null;
  ai_salary_min_value: number | null;
  ai_salary_max_value: number | null;
  ai_salary_unit_text: string | null;
};

export type JobSearchResult =
  | { ok: true; jobs: Job[] }
  | { ok: false; status: number; message: string };

export async function searchJobs({
  title,
  location,
  timeFrame = "24h",
  employmentType,
  workArrangement,
  limit = 10,
}: JobSearchParams): Promise<JobSearchResult> {
  const apiKey = process.env.FANTASTIC_JOBS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message:
        "Missing FANTASTIC_JOBS_API_KEY. Copy .env.example to .env and set your key.",
    };
  }

  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (location) params.set("location", location);
  if (employmentType) params.set("ai_employment_type", employmentType);
  if (workArrangement) params.set("ai_work_arrangement", workArrangement);
  params.set("time_frame", timeFrame);
  params.set("limit", String(limit));

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/active-ats?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network request failed";
    return { ok: false, status: 0, message: `Could not reach API: ${message}` };
  }

  const bodyText = await res.text();

  if (!res.ok) {
    let message = bodyText;
    try {
      message = JSON.parse(bodyText).message ?? bodyText;
    } catch {
      // keep raw text
    }
    return { ok: false, status: res.status, message };
  }

  const jobs = JSON.parse(bodyText) as Job[];
  return { ok: true, jobs };
}
