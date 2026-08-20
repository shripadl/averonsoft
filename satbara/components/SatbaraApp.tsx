"use client";

import { useEffect, useId, useMemo, useState, useTransition, type FormEvent } from "react";
import { brand } from "@satbara/config/brand.config";
import { trackEvent } from "@satbara/lib/analytics";
import { SAMPLE_LAND_RECORDS } from "@satbara/lib/records";
import {
  buildOfficialChecklist,
  filterDistrictOptions,
  formatAreaHa,
  getTalukas,
  getVillages,
  hasActiveFilters,
  searchLandRecords,
} from "@satbara/lib/search";
import type { SearchFilters, SearchHit } from "@satbara/lib/types";

type SatbaraAppProps = {
  embedded?: boolean;
};

const emptyFilters: SearchFilters = {
  surname: "",
  district: "",
  taluka: "",
  villageOrPost: "",
};

const INDEX_SIZE = SAMPLE_LAND_RECORDS.length;

export function SatbaraApp({ embedded = false }: SatbaraAppProps) {
  const titleId = useId();
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [submitted, setSubmitted] = useState<SearchFilters | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("satbara_open");
  }, []);

  const districtOptions = useMemo(
    () => filterDistrictOptions(filters.district),
    [filters.district],
  );

  const talukaOptions = useMemo(() => {
    if (!filters.district.trim()) return [];
    const all = getTalukas(filters.district);
    const q = filters.taluka.trim().toLowerCase();
    if (!q) return all;
    return all.filter((t) => t.toLowerCase().includes(q));
  }, [filters.district, filters.taluka]);

  const villageOptions = useMemo(() => {
    if (!filters.district.trim() || !filters.taluka.trim()) return [];
    const all = getVillages(filters.district, filters.taluka);
    const q = filters.villageOrPost.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.post.toLowerCase().includes(q) ||
        // Dombivali ↔ Dombivli
        (q.includes("dombi") &&
          (v.name.toLowerCase().includes("dombi") ||
            v.post.toLowerCase().includes("dombi"))),
    );
  }, [filters.district, filters.taluka, filters.villageOrPost]);

  const results: SearchHit[] = useMemo(() => {
    if (!submitted) return [];
    return searchLandRecords(SAMPLE_LAND_RECORDS, submitted);
  }, [submitted]);

  const checklist = useMemo(
    () => buildOfficialChecklist(submitted ?? filters),
    [submitted, filters],
  );

  function patchFilter<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "district") {
        next.taluka = "";
        next.villageOrPost = "";
      }
      if (key === "taluka") {
        next.villageOrPost = "";
      }
      return next;
    });
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!hasActiveFilters(filters)) return;
    startTransition(() => {
      setSubmitted({ ...filters });
      trackEvent("satbara_search", {
        has_surname: Boolean(filters.surname.trim()),
        has_district: Boolean(filters.district.trim()),
        has_taluka: Boolean(filters.taluka.trim()),
        has_place: Boolean(filters.villageOrPost.trim()),
      });
    });
  }

  function onClear() {
    setFilters(emptyFilters);
    setSubmitted(null);
  }

  const canSearch = hasActiveFilters(filters);

  return (
    <div
      className={`satbara-root ${embedded ? "satbara-root--embedded" : "satbara-root--standalone"}`}
    >
      <div className="satbara-stage">
        <header className="satbara-hero">
          <p className="satbara-brand">{brand.logoText}</p>
          <h1 id={titleId} className="satbara-title">
            7/12 location helper
          </h1>
          <p className="satbara-lede">{brand.tagline}</p>
          <p className="satbara-banner" role="note">
            Demo index: {INDEX_SIZE} sample plots only. Real Limaye holdings,
            your Thane / Dombivali 7/12, and statewide records live on MahaBhulekh
            — Satbara cannot pull that database from here (and the portal often
            blocks or times out outside India).
          </p>
        </header>

        <form
          className="satbara-panel"
          onSubmit={onSearch}
          aria-labelledby={titleId}
        >
          <p className="satbara-hint">
            Fill any combination to filter the demo index and build an official
            portal checklist. Empty fields are ignored.
          </p>

          <div className="satbara-grid">
            <label className="satbara-field">
              <span>Surname / owner name</span>
              <input
                type="search"
                name="surname"
                autoComplete="family-name"
                placeholder="e.g. Limaye, Patil"
                value={filters.surname}
                onChange={(e) => patchFilter("surname", e.target.value)}
              />
            </label>

            <label className="satbara-field">
              <span>District</span>
              <input
                type="search"
                name="district"
                list="satbara-districts"
                placeholder="e.g. Thane, Sindhudurg"
                value={filters.district}
                onChange={(e) => patchFilter("district", e.target.value)}
              />
              <datalist id="satbara-districts">
                {districtOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

            <label className="satbara-field">
              <span>Taluka</span>
              <input
                type="search"
                name="taluka"
                list="satbara-talukas"
                placeholder={
                  filters.district.trim()
                    ? "e.g. Kalyan (for Dombivali)"
                    : "Pick a district first (optional)"
                }
                value={filters.taluka}
                onChange={(e) => patchFilter("taluka", e.target.value)}
              />
              <datalist id="satbara-talukas">
                {talukaOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

            <label className="satbara-field">
              <span>Post / village</span>
              <input
                type="search"
                name="villageOrPost"
                list="satbara-villages"
                placeholder="e.g. Dombivali / Dombivli"
                value={filters.villageOrPost}
                onChange={(e) => patchFilter("villageOrPost", e.target.value)}
              />
              <datalist id="satbara-villages">
                {villageOptions.map((v) => (
                  <option key={`${v.name}-${v.post}`} value={v.name}>
                    {v.post !== v.name ? `Post: ${v.post}` : undefined}
                  </option>
                ))}
              </datalist>
            </label>
          </div>

          <div className="satbara-actions">
            <button
              type="submit"
              className="satbara-btn satbara-btn--primary"
              disabled={!canSearch || pending}
            >
              {pending ? "Searching…" : "Search demo index"}
            </button>
            <button
              type="button"
              className="satbara-btn satbara-btn--ghost"
              onClick={onClear}
            >
              Clear
            </button>
            <a
              className="satbara-btn satbara-btn--link"
              href={brand.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("satbara_official_portal")}
            >
              Official MahaBhulekh
            </a>
          </div>
        </form>

        <section className="satbara-results" aria-live="polite">
          {!submitted ? (
            <div className="satbara-empty">
              <h2>What this tool can and cannot do</h2>
              <ol>
                <li>
                  <strong>Can:</strong> help you pick district / taluka / village
                  spellings and prepare steps for MahaBhulekh.
                </li>
                <li>
                  <strong>Can:</strong> filter a small demo index ({INDEX_SIZE}{" "}
                  plots) so the UI is usable offline.
                </li>
                <li>
                  <strong>Cannot:</strong> list every Limaye 7/12 in Maharashtra,
                  or your personal Thane plot — those exist only on the
                  government system.
                </li>
              </ol>
            </div>
          ) : (
            <>
              <div className="satbara-results-head">
                <h2>
                  {results.length} demo match
                  {results.length === 1 ? "" : "es"}
                  <span className="satbara-index-count">
                    {" "}
                    · index size {INDEX_SIZE}
                  </span>
                </h2>
                <p>
                  Few or zero hits is expected for real surnames and villages.
                  Use the checklist below for the live portal.
                </p>
              </div>

              {results.length === 0 ? (
                <div className="satbara-empty satbara-empty--compact">
                  <p>
                    No demo rows for this filter (e.g. your Thane / Dombivali
                    7/12 is not in the sample set). That does not mean the plot
                    is missing from MahaBhulekh.
                  </p>
                </div>
              ) : (
                <ul className="satbara-list">
                  {results.map((hit, index) => (
                    <li
                      key={hit.id}
                      className="satbara-card"
                      style={{
                        animationDelay: `${Math.min(index, 8) * 40}ms`,
                      }}
                    >
                      <div className="satbara-card-top">
                        <p className="satbara-survey">
                          Survey / Gat {hit.surveyNo}
                        </p>
                        <p className="satbara-area">
                          {formatAreaHa(hit.areaHa)}
                        </p>
                      </div>
                      <p className="satbara-owners">
                        {hit.owners.map((o) => o.fullName).join(" · ")}
                      </p>
                      <p className="satbara-place">
                        {hit.village}
                        {hit.post && hit.post !== hit.village
                          ? ` (Post: ${hit.post})`
                          : ""}
                        {" · "}
                        {hit.taluka} taluka
                        {" · "}
                        {hit.district}
                      </p>
                      <div className="satbara-meta">
                        <span>{hit.landType}</span>
                        {hit.crop ? <span>{hit.crop}</span> : null}
                        {hit.khataNo ? <span>Khata {hit.khataNo}</span> : null}
                        <span className="satbara-matched">
                          Matched: {hit.matchedOn.join(", ")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <aside className="satbara-checklist">
                <h2>Open these on MahaBhulekh</h2>
                <ol>
                  {checklist.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <a
                  className="satbara-btn satbara-btn--primary"
                  href={brand.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("satbara_checklist_portal")}
                >
                  Open MahaBhulekh
                </a>
              </aside>
            </>
          )}
        </section>

        <footer className="satbara-footer">
          <p>
            Maharashtra 7/12 (गाव नमुना ७/१२) helper. Not a substitute for
            certified land records, and not connected to the live Bhulekh
            database.
          </p>
          <div className="satbara-footer-links">
            {brand.footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {link.label}
              </a>
            ))}
            {brand.parentCredit && brand.parentUrl ? (
              <a href={brand.parentUrl}>{brand.parentCredit}</a>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
