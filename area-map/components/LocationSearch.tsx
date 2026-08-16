"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { brand } from "@areamap/config/brand.config";
import type { GeocodeResult } from "@areamap/lib/geocode";

type LocationSearchProps = {
  onSelect: (result: GeocodeResult) => void;
};

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (value: string) => {
    abortRef.current?.abort();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${brand.geocodePath}?q=${encodeURIComponent(trimmed)}`,
        { signal: controller.signal },
      );
      const data = (await res.json()) as {
        results?: GeocodeResult[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }
      setResults(data.results ?? []);
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setResults([]);
      setError("Could not search right now.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const t = setTimeout(() => runSearch(trimmed), 400);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const pick = (result: GeocodeResult) => {
    setQuery(result.label);
    setOpen(false);
    setResults([]);
    onSelect(result);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="areamap-search">
      <label className="areamap-search__label" htmlFor={`${listId}-input`}>
        Find place
      </label>
      <div className="areamap-search__field">
        <input
          id={`${listId}-input`}
          type="search"
          className="areamap-search__input"
          placeholder="Address or postcode…"
          value={query}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            if (results.length) setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={onKeyDown}
        />
        {loading ? (
          <span className="areamap-search__status" aria-live="polite">
            …
          </span>
        ) : null}
      </div>

      {error ? <p className="areamap-search__error">{error}</p> : null}

      {open && results.length > 0 ? (
        <ul id={listId} className="areamap-search__list" role="listbox">
          {results.map((result, index) => (
            <li key={result.id} role="presentation">
              <button
                type="button"
                id={`${listId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`areamap-search__option${index === activeIndex ? " is-active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(result)}
              >
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && !error ? (
        <p className="areamap-search__empty">No matches</p>
      ) : null}
    </div>
  );
}
