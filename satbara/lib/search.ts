import type { LandRecord, SearchFilters, SearchHit } from "./types";
import { MAHARASHTRA_DISTRICTS } from "./maharashtra-geo";

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function includesLoose(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return true;
  return h.includes(n);
}

/** Common English spellings that should match the same place. */
const PLACE_ALIAS_GROUPS: string[][] = [
  ["dombivli", "dombivali", "dombivlii"],
  ["dabhole", "dabhol"],
  ["kalyan", "kalian"],
  ["thane", "thana"],
  ["ahilyanagar", "ahmednagar", "ahmadnagar"],
  ["chhatrapati sambhajinagar", "aurangabad", "sambhajinagar"],
  ["dharashiv", "osmanabad"],
];

function expandPlaceQuery(query: string): string[] {
  const q = normalize(query);
  if (!q) return [];
  for (const group of PLACE_ALIAS_GROUPS) {
    if (group.some((alias) => q.includes(alias) || alias.includes(q))) {
      return group;
    }
  }
  return [q];
}

function placeMatches(haystack: string, query: string): boolean {
  const h = normalize(haystack);
  return expandPlaceQuery(query).some(
    (variant) => h.includes(variant) || variant.includes(h),
  );
}

export function getDistrict(name: string) {
  const n = normalize(name);
  return MAHARASHTRA_DISTRICTS.find(
    (d) =>
      normalize(d.name) === n ||
      d.aliases?.some((a) => normalize(a) === n),
  );
}

export function getTalukas(districtName: string): string[] {
  const district = getDistrict(districtName);
  return district?.talukas.map((t) => t.name) ?? [];
}

export function getVillages(
  districtName: string,
  talukaName: string,
): { name: string; post: string }[] {
  const district = getDistrict(districtName);
  const taluka = district?.talukas.find(
    (t) => normalize(t.name) === normalize(talukaName),
  );
  return (
    taluka?.villages.map((v) => ({
      name: v.name,
      post: v.post ?? v.name,
    })) ?? []
  );
}

export function filterDistrictOptions(query: string): string[] {
  const q = normalize(query);
  return MAHARASHTRA_DISTRICTS.filter((d) => {
    if (!q) return true;
    return (
      includesLoose(d.name, q) ||
      d.aliases?.some((a) => includesLoose(a, q))
    );
  }).map((d) => d.name);
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return Boolean(
    filters.surname.trim() ||
      filters.district.trim() ||
      filters.taluka.trim() ||
      filters.villageOrPost.trim(),
  );
}

/**
 * AND across filled fields; empty fields are ignored ("all or either").
 */
export function searchLandRecords(
  records: LandRecord[],
  filters: SearchFilters,
): SearchHit[] {
  if (!hasActiveFilters(filters)) return [];

  const surnameQ = filters.surname.trim();
  const districtQ = filters.district.trim();
  const talukaQ = filters.taluka.trim();
  const placeQ = filters.villageOrPost.trim();

  const hits: SearchHit[] = [];

  for (const record of records) {
    const matchedOn: SearchHit["matchedOn"] = [];

    if (surnameQ) {
      const ownerHit = record.owners.some(
        (o) =>
          includesLoose(o.surname, surnameQ) ||
          includesLoose(o.fullName, surnameQ),
      );
      if (!ownerHit) continue;
      matchedOn.push("surname");
    }

    if (districtQ) {
      const district = getDistrict(districtQ);
      const ok =
        includesLoose(record.district, districtQ) ||
        (district
          ? normalize(record.district) === normalize(district.name) ||
            district.aliases?.some(
              (a) => normalize(record.district) === normalize(a),
            )
          : false);
      if (!ok) continue;
      matchedOn.push("district");
    }

    if (talukaQ) {
      if (!includesLoose(record.taluka, talukaQ)) continue;
      matchedOn.push("taluka");
    }

    if (placeQ) {
      const villageHit = placeMatches(record.village, placeQ);
      const postHit = placeMatches(record.post, placeQ);
      if (!villageHit && !postHit) continue;
      if (villageHit) matchedOn.push("village");
      if (postHit) matchedOn.push("post");
    }

    hits.push({ ...record, matchedOn });
  }

  return hits.sort((a, b) => {
    const aName = a.owners[0]?.surname ?? "";
    const bName = b.owners[0]?.surname ?? "";
    return (
      aName.localeCompare(bName) ||
      a.village.localeCompare(b.village) ||
      a.surveyNo.localeCompare(b.surveyNo, undefined, { numeric: true })
    );
  });
}

export function formatAreaHa(areaHa: number): string {
  const hectares = Math.floor(areaHa);
  const are = Math.round((areaHa - hectares) * 100);
  return `${hectares} ha ${are.toString().padStart(2, "0")} are`;
}

/** Suggest official-portal location steps from whatever the user typed. */
export function buildOfficialChecklist(filters: SearchFilters): string[] {
  const steps: string[] = [
    "Open MahaBhulekh (often needs an India IP / VPN from the UK).",
    "Choose document type ७/१२ (7/12).",
  ];
  if (filters.district.trim()) {
    steps.push(`Select district: ${filters.district.trim()}.`);
  } else {
    steps.push("Select your district.");
  }
  if (filters.taluka.trim()) {
    steps.push(`Select taluka: ${filters.taluka.trim()}.`);
  } else if (
    placeMatches("Dombivli", filters.villageOrPost) ||
    placeMatches("Dombivali", filters.villageOrPost)
  ) {
    steps.push("Select taluka: Kalyan (Dombivli / Dombivali sits under Kalyan).");
  } else {
    steps.push("Select your taluka.");
  }
  if (filters.villageOrPost.trim()) {
    const place = filters.villageOrPost.trim();
    const canonical = placeMatches("Dombivli", place) ? "Dombivli" : place;
    steps.push(`Select village / city survey area: ${canonical}.`);
  } else {
    steps.push("Select village or city survey area.");
  }
  if (filters.surname.trim()) {
    steps.push(
      `Search by owner name / surname: ${filters.surname.trim()} (or by survey / gat number if you have it).`,
    );
  } else {
    steps.push("Search by survey / gat number or owner name.");
  }
  return steps;
}
