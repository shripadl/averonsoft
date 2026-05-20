import {
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ResumeData } from "@/lib/resume";
import {
  resolveDocxPalette,
  type DocxPalette,
} from "@/lib/docx-template-themes";
import type { ResumeTemplateId } from "@/lib/resume-templates";

export type { DocxPalette, DocxTheme } from "@/lib/docx-template-themes";
export {
  resolveDocxPalette,
  resolveDocxTheme,
  getResumeDocxDocumentOptions,
} from "@/lib/docx-template-themes";

export type DocxBlock = Paragraph | Table;

type DocxContent = Paragraph | Table;

function blankPara() {
  return new Paragraph({ children: [] });
}

function run(
  p: DocxPalette,
  text: string,
  opts?: { bold?: boolean; italics?: boolean; color?: string; size?: number }
) {
  return new TextRun({
    text,
    bold: opts?.bold,
    italics: opts?.italics,
    color: opts?.color ?? p.text,
    size: opts?.size ?? p.bodySize,
    font: p.bodyFont,
  });
}

function bodyPara(
  p: DocxPalette,
  text: string,
  opts?: { bold?: boolean; color?: string; after?: number }
) {
  return new Paragraph({
    spacing: { after: opts?.after ?? 80 },
    children: [run(p, text, { bold: opts?.bold, color: opts?.color })],
  });
}

function sectionHeading(
  p: DocxPalette,
  title: string,
  style: "rule" | "plain" | "underline" = "rule"
) {
  const label = p.headingUppercase ? title.toUpperCase() : title;
  const border =
    style === "underline"
      ? {
          bottom: {
            color: p.accent,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 10,
          },
        }
      : style === "rule"
        ? {
            bottom: {
              color: p.accent,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          }
        : undefined;

  return new Paragraph({
    spacing: { before: style === "plain" ? 200 : 0, after: 100 },
    border,
    children: [
      new TextRun({
        text: label,
        bold: true,
        size: p.headingSize,
        color: p.accent,
        font: p.bodyFont,
      }),
    ],
  });
}

/** Dark/light panel matching `.sec` cards on web (creative, etc.). */
function sectionPanel(p: DocxPalette, title: string, inner: DocxContent[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            shading: p.sectionBg
              ? { fill: p.sectionBg, type: ShadingType.CLEAR }
              : undefined,
            borders: {
              left: {
                style: BorderStyle.SINGLE,
                size: 24,
                color: p.accent,
              },
              top: { style: BorderStyle.SINGLE, size: 4, color: "334155" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "334155" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "334155" },
            },
            children: [sectionHeading(p, title, "plain"), ...inner],
          }),
        ],
      }),
    ],
  });
}

function chipCell(p: DocxPalette, label: string): TableCell {
  const has = Boolean(label.trim());
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    shading: has ? { fill: p.chipBg, type: ShadingType.CLEAR } : undefined,
    borders: has
      ? {
          top: { style: BorderStyle.SINGLE, size: 4, color: p.chipBorder },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: p.chipBorder },
          left: { style: BorderStyle.SINGLE, size: 4, color: p.chipBorder },
          right: { style: BorderStyle.SINGLE, size: 4, color: p.chipBorder },
        }
      : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: label || " ",
            size: Math.max(18, p.bodySize - 2),
            color: has ? p.chipText : p.text,
            font: p.bodyFont,
          }),
        ],
      }),
    ],
  });
}

function skillsChipTable(p: DocxPalette, skills: string[]): Table {
  const cols = p.skillsCols;
  const rows: TableRow[] = [];
  for (let i = 0; i < skills.length; i += cols) {
    const cells: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      cells.push(chipCell(p, skills[i + c] ?? ""));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows,
  });
}

function timelineSkillRows(p: DocxPalette, skills: string[]): Table {
  const rows = skills.map(
    (s) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            shading: { fill: p.chipBg, type: ShadingType.CLEAR },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 8, color: p.accent },
            },
            children: [
              new Paragraph({
                children: [run(p, s, { color: p.chipText })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  run(p, "████████████████", {
                    color: p.chipBorder,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows,
  });
}

function experienceParagraphs(p: DocxPalette, data: ResumeData): Paragraph[] {
  const out: Paragraph[] = [];
  for (const e of data.experience ?? []) {
    const title = [e.role, e.company].filter(Boolean).join(" — ");
    const border = p.expLeftBorder
      ? {
          left: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: p.accent,
            space: 4,
          },
        }
      : undefined;
    out.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        border,
        indent: p.expLeftBorder ? { left: 180 } : undefined,
        children: [
          run(p, title, { bold: true, color: p.textStrong }),
        ],
      })
    );
    const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
    if (dates) {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: p.expLeftBorder ? { left: 180 } : undefined,
          children: [run(p, dates, { color: p.textMuted })],
        })
      );
    }
    if (e.description?.trim()) {
      out.push(
        new Paragraph({
          spacing: { after: 120 },
          indent: p.expLeftBorder ? { left: 180 } : undefined,
          children: [run(p, e.description.trim())],
        })
      );
    }
  }
  return out;
}

function educationParagraphs(p: DocxPalette, data: ResumeData): Paragraph[] {
  const out: Paragraph[] = [];
  for (const e of data.education ?? []) {
    out.push(
      new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [run(p, e.degree, { bold: true, color: p.textStrong })],
      })
    );
    if (e.institution) out.push(bodyPara(p, e.institution));
    const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
    if (dates) out.push(bodyPara(p, dates, { color: p.textMuted }));
  }
  return out;
}

function educationGrid(p: DocxPalette, data: ResumeData): Table {
  const items = data.education ?? [];
  const rows: TableRow[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const mk = (e: (typeof items)[0]) =>
      new TableCell({
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        shading: { fill: "FAF5FF", type: ShadingType.CLEAR },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: "E9D5FF" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "E9D5FF" },
          left: { style: BorderStyle.SINGLE, size: 4, color: "E9D5FF" },
          right: { style: BorderStyle.SINGLE, size: 4, color: "E9D5FF" },
        },
        children: [
          new Paragraph({
            children: [
              run(p, e.degree, { bold: true, color: p.textStrong }),
            ],
          }),
          bodyPara(p, e.institution),
          bodyPara(
            p,
            [e.startDate, e.endDate].filter(Boolean).join(" – "),
            { color: p.textMuted }
          ),
        ],
      });
    const a = items[i];
    const b = items[i + 1];
    rows.push(
      new TableRow({
        children: [mk(a), b ? mk(b) : new TableCell({ children: [blankPara()] })],
      })
    );
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows,
  });
}

function headerBlock(p: DocxPalette, data: ResumeData): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: p.titleSpacingAfter },
      border: p.headerBottomRule
        ? {
            bottom: {
              color: p.accent,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 18,
            },
          }
        : undefined,
      children: [
        new TextRun({
          text: data.fullName || "Resume",
          bold: true,
          size: p.titleSize,
          color: p.accent,
          font: p.titleFont,
        }),
      ],
    }),
  ];
  if (data.headline?.trim()) {
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          run(p, data.headline.trim(), {
            color: p.layout === "boxed" ? "94A3B8" : p.textMuted,
            italics: p.id === "minimal",
          }),
        ],
      })
    );
  }
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(" · ");
  if (contact) {
    out.push(bodyPara(p, contact, { color: p.textMuted, after: 120 }));
  }
  return out;
}

function bannerHeader(p: DocxPalette, data: ResumeData): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: p.bannerBg!, type: ShadingType.CLEAR },
            margins: { top: 280, bottom: 280, left: 360, right: 360 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: (data.fullName || "Resume").toUpperCase(),
                    bold: true,
                    size: p.titleSize,
                    color: p.bannerText,
                    font: p.titleFont,
                  }),
                ],
              }),
              ...(data.headline?.trim()
                ? [
                    new Paragraph({
                      spacing: { before: 80 },
                      children: [
                        new TextRun({
                          text: data.headline.trim(),
                          size: p.bodySize,
                          color: p.bannerText,
                          font: p.bodyFont,
                        }),
                      ],
                    }),
                  ]
                : []),
              ...((): Paragraph[] => {
                const contact = [data.email, data.phone, data.location]
                  .filter(Boolean)
                  .join(" · ");
                return contact
                  ? [
                      new Paragraph({
                        spacing: { before: 120 },
                        children: [
                          new TextRun({
                            text: contact,
                            size: p.bodySize,
                            color: p.bannerText,
                            font: p.bodyFont,
                          }),
                        ],
                      }),
                    ]
                  : [];
              })(),
            ],
          }),
        ],
      }),
    ],
  });
}

function appendFlowSections(
  p: DocxPalette,
  data: ResumeData,
  out: DocxBlock[],
  headingStyle: "rule" | "plain" | "underline" = "rule"
) {
  if (data.summary?.trim()) {
    out.push(sectionHeading(p, "Summary", headingStyle));
    out.push(bodyPara(p, data.summary.trim()));
    out.push(blankPara());
  }
  if (data.skills?.length) {
    out.push(sectionHeading(p, "Skills", headingStyle));
    if (p.id === "timeline" || p.id === "executive") {
      out.push(timelineSkillRows(p, data.skills));
    } else {
      out.push(skillsChipTable(p, data.skills));
    }
    out.push(blankPara());
  }
  if (data.experience?.length) {
    out.push(sectionHeading(p, "Experience", headingStyle));
    out.push(...experienceParagraphs(p, data));
    out.push(blankPara());
  }
  if (data.education?.length) {
    out.push(sectionHeading(p, "Education", headingStyle));
    if (p.layout === "grid-edu") {
      out.push(educationGrid(p, data));
    } else {
      out.push(...educationParagraphs(p, data));
    }
    out.push(blankPara());
  }
  if (data.links?.length) {
    out.push(sectionHeading(p, "Links", headingStyle));
    for (const l of data.links) {
      if (l.label && l.url) out.push(bodyPara(p, `${l.label}: ${l.url}`));
    }
  }
}

function appendBoxedSections(p: DocxPalette, data: ResumeData, out: DocxBlock[]) {
  if (data.summary?.trim()) {
    out.push(sectionPanel(p, "Summary", [bodyPara(p, data.summary.trim())]));
    out.push(blankPara());
  }
  if (data.skills?.length) {
    out.push(sectionPanel(p, "Skills", [skillsChipTable(p, data.skills)]));
    out.push(blankPara());
  }
  if (data.experience?.length) {
    out.push(sectionPanel(p, "Experience", experienceParagraphs(p, data)));
    out.push(blankPara());
  }
  if (data.education?.length) {
    out.push(sectionPanel(p, "Education", educationParagraphs(p, data)));
    out.push(blankPara());
  }
  if (data.links?.length) {
    const linkParas = data.links
      .filter((l) => l.label && l.url)
      .map((l) => bodyPara(p, `${l.label}: ${l.url}`));
    if (linkParas.length) {
      out.push(sectionPanel(p, "Links", linkParas));
    }
  }
}

export function buildResumeDocxChildren(
  _theme: unknown,
  templateId: ResumeTemplateId,
  data: ResumeData
): DocxBlock[] {
  const p = resolveDocxPalette(templateId);
  const out: DocxBlock[] = [];

  switch (p.layout) {
    case "banner": {
      out.push(bannerHeader(p, data));
      out.push(blankPara());
      appendFlowSections(p, data, out, "underline");
      break;
    }
    case "sidebar": {
      const left: Paragraph[] = headerBlock(p, data);
      const right: DocxBlock[] = [];
      appendFlowSections(p, data, right, "plain");
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: TableBorders.NONE,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  shading: { fill: p.sectionBg!, type: ShadingType.CLEAR },
                  margins: { top: 200, bottom: 200, left: 200, right: 200 },
                  borders: {
                    bottom: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "E2E8F0",
                    },
                  },
                  children: left,
                }),
                new TableCell({
                  width: { size: 66, type: WidthType.PERCENTAGE },
                  margins: { top: 200, bottom: 200, left: 240, right: 200 },
                  children: right.length ? right : [blankPara()],
                }),
              ],
            }),
          ],
        })
      );
      break;
    }
    case "boxed": {
      out.push(...headerBlock(p, data));
      out.push(blankPara());
      appendBoxedSections(p, data, out);
      break;
    }
    case "grid-edu": {
      out.push(...headerBlock(p, data));
      out.push(blankPara());
      appendFlowSections(p, data, out, "plain");
      break;
    }
    case "flow":
    default: {
      if (p.id === "compact") {
        out.push(...headerBlock(p, data));
        if (data.summary?.trim()) {
          out.push(sectionHeading(p, "Summary", "plain"));
          out.push(bodyPara(p, data.summary.trim(), { after: 60 }));
        }
        if (data.skills?.length) {
          out.push(sectionHeading(p, "Skills", "plain"));
          out.push(bodyPara(p, data.skills.join(" · "), { after: 60 }));
        }
        if (data.experience?.length) {
          out.push(sectionHeading(p, "Experience", "plain"));
          for (const e of data.experience) {
            const line = [e.role, e.company, [e.startDate, e.endDate].filter(Boolean).join("–")]
              .filter(Boolean)
              .join(" — ");
            out.push(bodyPara(p, line, { bold: true, after: 60 }));
            if (e.description?.trim()) {
              out.push(bodyPara(p, e.description.trim(), { after: 60 }));
            }
          }
        }
        if (data.education?.length) {
          out.push(sectionHeading(p, "Education", "plain"));
          out.push(...educationParagraphs(p, data));
        }
        if (data.links?.length) {
          out.push(sectionHeading(p, "Links", "plain"));
          for (const l of data.links) {
            if (l.label && l.url) out.push(bodyPara(p, `${l.label}: ${l.url}`));
          }
        }
        break;
      }
      if (p.id === "classic") {
        out.push(...headerBlock(p, data));
        out.push(blankPara());
        if (data.summary?.trim()) {
          out.push(sectionHeading(p, "Summary", "plain"));
          out.push(bodyPara(p, data.summary.trim()));
          out.push(blankPara());
        }
        if (data.skills?.length) {
          out.push(sectionHeading(p, "Skills", "plain"));
          for (const s of data.skills) {
            out.push(
              new Paragraph({
                spacing: { after: 40 },
                bullet: { level: 0 },
                children: [run(p, s)],
              })
            );
          }
          out.push(blankPara());
        }
        if (data.experience?.length) {
          out.push(sectionHeading(p, "Experience", "plain"));
          out.push(...experienceParagraphs(p, data));
          out.push(blankPara());
        }
        if (data.education?.length) {
          out.push(sectionHeading(p, "Education", "plain"));
          out.push(...educationParagraphs(p, data));
        }
        if (data.links?.length) {
          out.push(sectionHeading(p, "Links", "plain"));
          for (const l of data.links) {
            if (l.label && l.url) out.push(bodyPara(p, `${l.label}: ${l.url}`));
          }
        }
        break;
      }
      if (p.id === "portfolio" && data.experience?.length) {
        out.push(...headerBlock(p, data));
        out.push(blankPara());
        if (data.summary?.trim()) {
          out.push(sectionHeading(p, "Summary", "plain"));
          out.push(bodyPara(p, data.summary.trim()));
          out.push(blankPara());
        }
        if (data.skills?.length) {
          out.push(sectionHeading(p, "Skills", "plain"));
          out.push(skillsChipTable(p, data.skills));
          out.push(blankPara());
        }
        out.push(sectionHeading(p, "Experience", "plain"));
        const rows = (data.experience ?? []).map(
          (e) =>
            new TableRow({
              children: [
                new TableCell({
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  shading: { fill: "FFF7ED", type: ShadingType.CLEAR },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "FED7AA" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "FED7AA" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "FED7AA" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "FED7AA" },
                  },
                  children: [
                    bodyPara(
                      p,
                      [e.role, e.company].filter(Boolean).join(" — "),
                      { bold: true, color: p.textStrong }
                    ),
                    bodyPara(
                      p,
                      [e.startDate, e.endDate].filter(Boolean).join(" – "),
                      { color: p.textMuted }
                    ),
                    ...(e.description?.trim()
                      ? [bodyPara(p, e.description.trim())]
                      : []),
                  ],
                }),
              ],
            })
        );
        out.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: TableBorders.NONE,
            rows,
          })
        );
        out.push(blankPara());
        if (data.education?.length) {
          out.push(sectionHeading(p, "Education", "plain"));
          out.push(...educationParagraphs(p, data));
        }
        if (data.links?.length) {
          out.push(sectionHeading(p, "Links", "plain"));
          for (const l of data.links) {
            if (l.label && l.url) out.push(bodyPara(p, `${l.label}: ${l.url}`));
          }
        }
        break;
      }
      out.push(...headerBlock(p, data));
      out.push(blankPara());
      appendFlowSections(
        p,
        data,
        out,
        p.id === "modern" ? "underline" : "rule"
      );
    }
  }

  return out;
}
