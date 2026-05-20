import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { CoverLetterData } from "@/lib/cover-letter";
import type { ResumeData } from "@/lib/resume";
import {
  buildResumeDocxChildren,
  resolveDocxTheme,
  type DocxTheme,
} from "@/lib/docx-resume-builders";
import {
  getResumeDocxDocumentOptions,
  resolveDocxPalette,
} from "@/lib/docx-template-themes";
import { isResumeTemplateId, type ResumeTemplateId } from "@/lib/resume-templates";

export type { DocxTheme };
export { resolveDocxTheme };

function bodyPara(
  theme: DocxTheme,
  text: string,
  opts?: { bold?: boolean; color?: string },
  defaultColor = "0F172A"
) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        color: opts?.color ?? defaultColor,
        size: theme.bodySize,
        font: theme.bodyFont,
      }),
    ],
  });
}

function blankPara() {
  return new Paragraph({ children: [] });
}

function coverLetterFlow(
  theme: DocxTheme,
  data: CoverLetterData,
  defaultTextColor = "0F172A"
): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];
  const para = (
    text: string,
    opts?: { bold?: boolean; color?: string }
  ) => bodyPara(theme, text, opts, defaultTextColor);

  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.date,
          size: theme.bodySize,
          font: theme.bodyFont,
          color: "64748B",
        }),
      ],
    })
  );
  children.push(blankPara());
  children.push(para(data.applicantName || "Applicant", { bold: true }));
  if (data.applicantEmail) children.push(para(data.applicantEmail));
  if (data.applicantPhone) children.push(para(data.applicantPhone));
  if (data.applicantAddress) children.push(para(data.applicantAddress));
  children.push(blankPara());

  const reLine = data.roleAppliedFor
    ? `Re: ${data.roleAppliedFor}${data.companyName ? ` at ${data.companyName}` : ""}`
    : "";
  if (reLine) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: reLine,
            bold: true,
            size: theme.bodySize,
            color: theme.accent,
            font: theme.bodyFont,
          }),
        ],
      })
    );
  }

  for (const block of data.body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)) {
    children.push(para(block));
    children.push(blankPara());
  }

  if (data.applicantName) {
    children.push(
      new Paragraph({
        spacing: { before: 160 },
        children: [
          new TextRun({
            text: data.applicantName,
            size: theme.bodySize,
            font: theme.bodyFont,
            color: defaultTextColor,
          }),
        ],
      })
    );
  }

  return children;
}

export async function buildResumeDocx(
  data: ResumeData,
  templateId = "modern"
): Promise<Blob> {
  const id: ResumeTemplateId = isResumeTemplateId(templateId) ? templateId : "modern";
  const theme = resolveDocxTheme(id);
  const children = buildResumeDocxChildren(theme, id, data);
  const doc = new Document({
    ...getResumeDocxDocumentOptions(id),
    sections: [{ children }],
  });
  return Packer.toBlob(doc);
}

export async function buildCoverLetterDocx(
  data: CoverLetterData,
  templateId = "modern"
): Promise<Blob> {
  const id: ResumeTemplateId = isResumeTemplateId(templateId) ? templateId : "modern";
  const theme = resolveDocxTheme(id);
  const palette = resolveDocxPalette(id);
  const letterText = palette.pageBg ? palette.text : "0F172A";

  let inner: (Paragraph | Table)[] = coverLetterFlow(theme, data, letterText);

  if (id === "corporate" || id === "grid") {
    inner = [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: theme.accent },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                },
                children: coverLetterFlow(theme, data, letterText),
              }),
            ],
          }),
        ],
      }),
    ];
  } else if (id === "sidebar") {
    const paras = coverLetterFlow(theme, data);
    const split = Math.min(3, paras.length);
    const left = paras.slice(0, split);
    const right = paras.slice(split);
    inner = [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                margins: { top: 0, bottom: 120, left: 0, right: 120 },
                children: left.length ? left : [blankPara()],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                margins: { top: 0, bottom: 120, left: 80, right: 0 },
                children: right.length ? right : [blankPara()],
              }),
            ],
          }),
        ],
      }),
    ];
  }

  const doc = new Document({
    ...getResumeDocxDocumentOptions(id),
    sections: [{ children: inner }],
  });
  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
