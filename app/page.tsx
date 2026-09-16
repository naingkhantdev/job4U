import {
  EMPLOYMENT_TYPES,
  WORK_ARRANGEMENTS,
  searchJobs,
  type Job,
} from "@/lib/fantastic-jobs";

type SearchParams = {
  title?: string;
  location?: string;
  time_frame?: string;
  employment_type?: string;
  work_arrangement?: string;
  limit?: string;
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contract",
  TEMPORARY: "Temporary",
  INTERN: "Internship",
  VOLUNTEER: "Volunteer",
  PER_DIEM: "Per diem",
  OTHER: "Other",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const title = params.title ?? "";
  const location = params.location ?? "";
  const timeFrame = params.time_frame ?? "24h";
  const employmentType = params.employment_type ?? "";
  const workArrangement = params.work_arrangement ?? "";
  const limit = Number(params.limit ?? "12");

  const result = await searchJobs({
    title,
    location,
    timeFrame,
    employmentType,
    workArrangement,
    limit,
  });

  const activeFilters = [
    title && { key: "title", label: title },
    location && { key: "location", label: location },
    employmentType && {
      key: "employment_type",
      label: EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType,
    },
    workArrangement && { key: "work_arrangement", label: workArrangement },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <div className="hero-glow" aria-hidden="true" />
      <main>
        <div className="page-header">
          <div className="logo-mark">FJ</div>
          <div>
            <h1>Fantastic Jobs Search</h1>
            <p className="subtitle">
              Live query against <code>data.fantastic.jobs/v1/active-ats</code>
            </p>
          </div>
        </div>

        <form className="search-form" action="/" method="GET">
          <div className="field field-lg">
            <SearchIcon />
            <input
              type="text"
              name="title"
              placeholder="Job title, e.g. Software Engineer"
              defaultValue={title}
            />
          </div>
          <div className="field-divider" />
          <div className="field">
            <PinIcon />
            <input
              type="text"
              name="location"
              placeholder="Location"
              defaultValue={location}
            />
          </div>
          <div className="field-divider" />
          <select name="employment_type" defaultValue={employmentType}>
            <option value="">Any job type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <select name="work_arrangement" defaultValue={workArrangement}>
            <option value="">Any location type</option>
            {WORK_ARRANGEMENTS.map((arrangement) => (
              <option key={arrangement} value={arrangement}>
                {arrangement}
              </option>
            ))}
          </select>
          <select name="time_frame" defaultValue={timeFrame}>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="6m">Last 6 months</option>
          </select>
          <button type="submit" className="submit-btn">
            Search
          </button>
        </form>

        {activeFilters.length > 0 && (
          <div className="filter-chips">
            {activeFilters.map((f) => (
              <span className="chip" key={f.key}>
                {f.label}
              </span>
            ))}
            <a className="chip chip-clear" href="/">
              Clear all
            </a>
          </div>
        )}

        {result.ok ? (
          <>
            <p className="status-line">
              {result.jobs.length} result{result.jobs.length === 1 ? "" : "s"}
            </p>
            {result.jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                No jobs matched. Try a broader query.
              </div>
            ) : (
              <div className="job-list">
                {result.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="error-box">
            <span>⚠️</span>
            <span>
              Request failed ({result.status}): {result.message}
            </span>
          </div>
        )}

        <footer className="page-footer">
          Powered by the Fantastic Jobs API &middot; data refreshes hourly
        </footer>
      </main>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="field-icon"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="field-icon"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="job-arrow"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);
  const initials = (job.organization ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <a
      className={`job-card ${accentClass(job.ai_work_arrangement)}`}
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {job.organization_logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="job-avatar"
          src={job.organization_logo}
          alt=""
          loading="lazy"
        />
      ) : (
        <div className="job-avatar">{initials}</div>
      )}
      <div className="job-body">
        <div className="job-card-top">
          <div>
            <div className="job-title">{job.title}</div>
            <div className="job-org">
              {job.organization ?? "Unknown organization"}
            </div>
          </div>
          <div className="job-date">{formatDate(job.date_posted)}</div>
        </div>
        <div className="job-meta">
          {job.locations_derived?.[0] && (
            <span className="badge">{job.locations_derived[0]}</span>
          )}
          {job.ai_work_arrangement && (
            <span
              className={`badge ${workArrangementBadgeClass(job.ai_work_arrangement)}`}
            >
              {job.ai_work_arrangement}
            </span>
          )}
          {job.employment_type?.[0] && (
            <span className="badge">{job.employment_type[0]}</span>
          )}
          {salary && <span className="badge badge-salary">{salary}</span>}
        </div>
      </div>
      <ArrowIcon />
    </a>
  );
}

function workArrangementBadgeClass(arrangement: string) {
  const value = arrangement.toLowerCase();
  if (value.includes("remote")) return "badge-remote";
  if (value.includes("hybrid")) return "badge-hybrid";
  return "";
}

function accentClass(arrangement: string | null) {
  if (!arrangement) return "";
  const value = arrangement.toLowerCase();
  if (value.includes("remote")) return "accent-remote";
  if (value.includes("hybrid")) return "accent-hybrid";
  return "accent-onsite";
}

function formatSalary(job: Job) {
  if (!job.ai_salary_min_value && !job.ai_salary_max_value) return null;
  const currency = job.ai_salary_currency ?? "";
  const unit = job.ai_salary_unit_text?.toLowerCase() ?? "";
  const min = job.ai_salary_min_value;
  const max = job.ai_salary_max_value;
  const range =
    min && max
      ? `${min.toLocaleString()}–${max.toLocaleString()}`
      : (min ?? max)?.toLocaleString();
  return `${currency} ${range}${unit ? `/${unit}` : ""}`.trim();
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 14) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
