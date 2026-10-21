#!/usr/bin/env node
/**
 * scripts/fetch-github-data.mjs
 *
 * Fetches open source contribution data from GitHub API.
 * Reads GITHUB_TOKEN from the environment.
 * If GITHUB_TOKEN is not set, exits cleanly without failing or overwriting seed data.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, "../apps/web/src/data/github.json");

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.log(
    "[fetch-github-data] GITHUB_TOKEN not found in environment. Preserving verified seed data in github.json."
  );
  process.exit(0);
}

console.log("[fetch-github-data] GITHUB_TOKEN detected. Fetching live GitHub statistics...");

async function fetchGitHubData() {
  const username = "d1vyanshu-kumar";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-build-script",
  };

  try {
    // Search for PRs authored by user
    const prsRes = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=100`,
      { headers }
    );

    if (!prsRes.ok) {
      throw new Error(`GitHub API returned status ${prsRes.status}: ${prsRes.statusText}`);
    }

    const prsData = await prsRes.json();
    const items = prsData.items || [];

    const mergedPrs = items.filter((pr) => pr.pull_request?.merged_at || pr.state === "closed");
    const orgsSet = new Set();
    const reposSet = new Set();

    items.forEach((item) => {
      const parts = item.repository_url.split("/");
      const owner = parts[parts.length - 2];
      const repo = parts[parts.length - 1];
      orgsSet.add(owner);
      reposSet.add(`${owner}/${repo}`);
    });

    const output = {
      _source: "api",
      _fetchedAt: new Date().toISOString(),
      username,
      totalPRs: items.length,
      mergedPRs: mergedPrs.length,
      totalRepos: reposSet.size,
      totalOrgs: orgsSet.size,
      languages: ["Java", "TypeScript", "JavaScript", "Python", "Go"],
      repos: Array.from(reposSet),
      orgs: Array.from(orgsSet).map((name) => ({ name })),
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
    console.log(`[fetch-github-data] Successfully updated ${outputPath}`);
  } catch (err) {
    console.warn(`[fetch-github-data] Failed to refresh live data: ${err.message}. Retaining seed.`);
  }
}

fetchGitHubData();
