"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@passphoto/config/brand.config";
import { trackEvent } from "@passphoto/lib/analytics";
import { DEFAULT_NUDGE, type CropNudge } from "@passphoto/lib/crop";
import { downloadBlob, fileToImage, MAX_UPLOAD_MB } from "@passphoto/lib/image";
import { PROCESS_STEPS, processPassportPhoto } from "@passphoto/lib/process";
import type { GovAudit, PhotoCheck } from "@passphoto/lib/types";
import {
  BACKGROUND_PRESETS,
  DEFAULT_BACKGROUND,
  UK_DIGITAL_PX,
} from "@passphoto/lib/uk-spec";

type PassPhotoAppProps = {
  embedded?: boolean;
};

export function PassPhotoApp({ embedded = false }: PassPhotoAppProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const [jpeg, setJpeg] = useState<Blob | null>(null);
  const [printSheet, setPrintSheet] = useState<Blob | null>(null);
  const [checks, setChecks] = useState<PhotoCheck[]>([]);
  const [audit, setAudit] = useState<GovAudit | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replaceBackground, setReplaceBackground] = useState(true);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [nudge, setNudge] = useState<CropNudge>(DEFAULT_NUDGE);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    trackEvent("passphoto_open");
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (printUrl) URL.revokeObjectURL(printUrl);
    };
  }, [originalUrl, resultUrl, printUrl]);

  const resetOutput = useCallback(() => {
    setResultUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setPrintUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setJpeg(null);
    setPrintSheet(null);
    setChecks([]);
    setAudit(null);
    setStepIndex(-1);
    setError(null);
  }, []);

  const onPick = useCallback(
    (f: File | null) => {
      if (!f) return;
      if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
        setError(`Image must be under ${MAX_UPLOAD_MB} MB.`);
        return;
      }
      resetOutput();
      setFile(f);
      setOriginalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      setNudge(DEFAULT_NUDGE);
    },
    [resetOutput],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setStepIndex(0);
    trackEvent("passphoto_process");
    try {
      const image = await fileToImage(file);
      const out = await processPassportPhoto(image, {
        replaceBackground,
        background,
        nudge,
        onStep: setStepIndex,
      });
      setJpeg(out.jpeg);
      setPrintSheet(out.printSheet);
      setChecks(out.checks);
      setAudit(out.audit);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return out.jpeg ? URL.createObjectURL(out.jpeg) : null;
      });
      setPrintUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return out.printSheet ? URL.createObjectURL(out.printSheet) : null;
      });
      setStepIndex(out.processed ? PROCESS_STEPS.length : 2);
      trackEvent(out.processed ? "passphoto_ready" : "passphoto_reject", {
        faces: out.face.faceCount,
        verdict: out.audit.verdict,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed.");
      trackEvent("passphoto_error");
    } finally {
      setBusy(false);
    }
  }, [file, replaceBackground, background, nudge]);

  return (
    <div
      className={`passphoto-root ${embedded ? "passphoto-root--embedded" : "passphoto-root--standalone"}`}
    >
      <div className="passphoto-stage">
        <header className="passphoto-hero">
          <p className="passphoto-brand">{brand.logoText}</p>
          <h1 id="passphoto-title" className="passphoto-title">
            UK passport photo formatter
          </h1>
          <p className="passphoto-lede">{brand.tagline}</p>
          <div className="passphoto-banner" role="note">
            This tool checks published GOV.UK photo rules first. Soft or badly
            lit photos are not exported. It is not affiliated with HM Passport
            Office.{" "}
            <a href={brand.govPhotoGuideUrl} target="_blank" rel="noreferrer">
              Read the official photo rules
            </a>
            .
          </div>
        </header>

        <div className="passphoto-layout">
          <section className="passphoto-panel" aria-labelledby="passphoto-title">
            <h2 className="passphoto-panel__title">1. Upload a portrait</h2>
            <p className="passphoto-hint">
              Front-facing, even light, shoulders visible, no glasses. JPEG, PNG,
              or WebP. Processing stays on this device.
            </p>
            <div className="passphoto-file-row">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="passphoto-file-input"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="passphoto-btn"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                Choose photo
              </button>
              <span className="passphoto-file-name">
                {file ? file.name : "No file selected"}
              </span>
            </div>

            <label className="passphoto-check">
              <input
                type="checkbox"
                checked={replaceBackground}
                onChange={(e) => setReplaceBackground(e.target.checked)}
              />
              Replace background with plain cream (runs locally, first use
              downloads a model)
            </label>

            {replaceBackground ? (
              <label className="passphoto-field">
                Background
                <select
                  className="passphoto-select"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                >
                  {BACKGROUND_PRESETS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <h2 className="passphoto-panel__title">2. Fine-tune crop</h2>
            <div className="passphoto-sliders">
              <label className="passphoto-field">
                Zoom
                <input
                  type="range"
                  min="0.85"
                  max="1.18"
                  step="0.01"
                  value={nudge.zoom}
                  onChange={(e) =>
                    setNudge((n) => ({ ...n, zoom: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="passphoto-field">
                Horizontal
                <input
                  type="range"
                  min="-0.12"
                  max="0.12"
                  step="0.005"
                  value={nudge.panX}
                  onChange={(e) =>
                    setNudge((n) => ({ ...n, panX: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="passphoto-field">
                Vertical
                <input
                  type="range"
                  min="-0.12"
                  max="0.12"
                  step="0.005"
                  value={nudge.panY}
                  onChange={(e) =>
                    setNudge((n) => ({ ...n, panY: Number(e.target.value) }))
                  }
                />
              </label>
            </div>

            <div className="passphoto-actions">
              <button
                type="button"
                className="passphoto-btn passphoto-btn--primary"
                disabled={!file || busy}
                onClick={() => void run()}
              >
                {busy ? "Checking…" : "Check photo"}
              </button>
              <button
                type="button"
                className="passphoto-btn"
                disabled={!file || busy}
                onClick={() => {
                  setFile(null);
                  setOriginalUrl((u) => {
                    if (u) URL.revokeObjectURL(u);
                    return null;
                  });
                  resetOutput();
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Clear
              </button>
            </div>
            {error ? (
              <p className="passphoto-error" role="alert">
                {error}
              </p>
            ) : null}

            {(busy || stepIndex >= 0) && (
              <ol className="passphoto-steps">
                {PROCESS_STEPS.map((step, i) => {
                  const state =
                    i < stepIndex ? "done" : i === stepIndex && busy ? "active" : "todo";
                  return (
                    <li key={step.id} className={`passphoto-step is-${state}`}>
                      <span className="passphoto-step__mark" aria-hidden>
                        {state === "done" ? "✓" : i + 1}
                      </span>
                      <span>{step.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="passphoto-preview">
            <div className="passphoto-frames">
              <figure className="passphoto-frame">
                <figcaption>Original</figcaption>
                {originalUrl ? (
                  <img src={originalUrl} alt="Original upload" />
                ) : (
                  <div className="passphoto-placeholder">No photo yet</div>
                )}
              </figure>
              <figure className="passphoto-frame">
                <figcaption>
                  Prepared · {UK_DIGITAL_PX.width}×{UK_DIGITAL_PX.height} px
                </figcaption>
                {resultUrl ? (
                  <img src={resultUrl} alt="Prepared passport photo" />
                ) : audit?.verdict === "reject" ? (
                  <div className="passphoto-placeholder">
                    Not exported — retake the photo
                  </div>
                ) : (
                  <div className="passphoto-placeholder">Result appears here</div>
                )}
              </figure>
            </div>

            {showPrint && printUrl ? (
              <figure className="passphoto-frame passphoto-frame--sheet">
                <figcaption>Print sheet · 4×6 in · 2×3 copies of the 600×750 photo</figcaption>
                <img src={printUrl} alt="Print sheet with six copies" />
              </figure>
            ) : null}

            {jpeg && printSheet ? (
              <div className="passphoto-actions">
                <button
                  type="button"
                  className="passphoto-btn passphoto-btn--primary"
                  onClick={() => {
                    downloadBlob(jpeg, "uk-passport-photo-600x750.jpg");
                    trackEvent("passphoto_download");
                  }}
                >
                  Download JPEG
                </button>
                <button
                  type="button"
                  className="passphoto-btn"
                  onClick={() => {
                    downloadBlob(printSheet, "uk-passport-photo-6up-4x6.jpg");
                    trackEvent("passphoto_print_download");
                  }}
                >
                  Download 6-up sheet
                </button>
                <button
                  type="button"
                  className="passphoto-btn"
                  onClick={() => setShowPrint((v) => !v)}
                >
                  {showPrint ? "Hide print sheet" : "Preview print sheet"}
                </button>
              </div>
            ) : null}

            {audit ? (
              <div className={`passphoto-verdict is-${audit.verdict}`}>
                <h2>{audit.headline}</h2>
                <p>{audit.summary}</p>
              </div>
            ) : null}

            {checks.length > 0 ? (
              <div className="passphoto-checks">
                <h2 className="passphoto-panel__title">GOV.UK rule checks</h2>
                <p className="passphoto-hint">
                  These follow the published digital photo rules (focus, lighting,
                  pose, background, expression). They are not the live HM Passport
                  Office checker.
                </p>
                <ul>
                  {checks.map((c) => (
                    <li key={c.id} className={`passphoto-check-row is-${c.status}`}>
                      <strong>{c.label}</strong>
                      <span>{c.detail}</span>
                      {c.status !== "pass" ? (
                        <em className="passphoto-fix">
                          {c.canImprove
                            ? "This tool can try to improve this."
                            : "Cannot be fixed here — take a new photo."}
                        </em>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        <section className="passphoto-legal" aria-labelledby="passphoto-legal-title">
          <h2 id="passphoto-legal-title">Privacy and limits</h2>
          <p>
            Photos are processed in your browser on this device. They are not
            uploaded to Averonsoft, stored on our servers, or used to train
            models. We do not create an account from this tool, and we do not
            collect passport portraits or face measurements.
          </p>
          <p>
            Optional background replacement downloads a model to your browser
            cache only. Analytics, if enabled on a deployed site, record page
            events without the image.
          </p>
          <p>
            PhotoSpec is not HM Passport Office and does not guarantee
            acceptance. Checks follow the published GOV.UK photo rules in the
            browser; they are not the same as the live government checker.
            Soft, dark, or badly posed photos cannot be repaired here — retake
            them. Background replacement may still be treated as an alteration.
          </p>
        </section>

        <footer className="passphoto-footer">
          {brand.parentCredit && brand.parentUrl ? (
            <>
              <a className="passphoto-footer__link" href={brand.parentUrl}>
                {brand.parentCredit}
              </a>
              <span className="passphoto-footer__sep">·</span>
            </>
          ) : null}
          {brand.footerLinks.map((link, i) => (
            <span key={link.href}>
              {i > 0 ? <span className="passphoto-footer__sep">·</span> : null}
              <a className="passphoto-footer__link" href={link.href}>
                {link.label}
              </a>
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}
