// real GitHub contribution count, cached for a day
const FALLBACK = 3770; // last verified count, shown if the API is down

export async function getCommitCount(): Promise<number> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/nparashar150?y=last",
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    return data?.total?.lastYear ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}
