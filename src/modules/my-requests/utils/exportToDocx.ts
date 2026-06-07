import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

import type {
  GetSubmissionDetailsResponse,
  FieldValue,
  TableValueRow,
} from '../../../core/types/getSubmissionDetailsResponse';
import type { GetDropdownListValuesResponse } from '../../../core/types/getDropdownListValuesResponse';

// ─── Control-key constants ────────────────────────────────────────────────────

const CONTROL_KEY_DROPDOWN = 'DROPDOWN';
const CONTROL_KEY_MULTISELECT = 'MULTISELECT';
const CONTROL_KEY_TABLE = 'TABLE';
const CONTROL_KEY_DATEPICKER = 'DATEPICKER';

// ─── Colour palette (hex without #) ──────────────────────────────────────────

const COLORS = {
  primary: '1A6F8E',   // teal blue used for title, headers, table headers
  white: 'FFFFFF',
  lightGrey: 'F2F5F8', // alternating row background
  rowDivider: 'D8E4EC', // thin horizontal rule between field rows
  labelGrey: '4A5568',  // submission info labels
  black: '1A202C',      // body text
  refGrey: '718096',    // reference number under title
} as const;

// ─── Shared border helpers ────────────────────────────────────────────────────

const NO_BORDER = { style: BorderStyle.NIL, size: 0, color: COLORS.white } as const;

const ROW_DIVIDER_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLORS.rowDivider,
} as const;

const TABLE_CELL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLORS.rowDivider,
} as const;

// All-sides NO_BORDER shorthand for table outer borders
const ALL_NO_BORDER = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
} as const;

// ─── Helper: resolve a dropdown code → display label ─────────────────────────

const resolveDropdownLabel = (
  code: string,
  lookupTypeId: number | undefined,
  dropdownData: GetDropdownListValuesResponse,
  isAr: boolean,
): string => {
  if (lookupTypeId === undefined) return code;
  const options = dropdownData[String(lookupTypeId)] ?? [];
  const match = options.find((opt) => opt.code === code || String(opt.lookupValueId) === code);
  if (match === undefined) return code;
  return isAr ? match.nameAr : match.nameEn;
};

// ─── Helper: format a scalar/dropdown/multi field value as text ───────────────

const resolveFieldDisplayValue = (
  fv: FieldValue,
  dropdownData: GetDropdownListValuesResponse,
  isAr: boolean,
): string => {
  const controlKey = fv.controlType.controlKey;
  const lookupTypeId = fv.lookupType?.lookupTypeId;

  if (controlKey === CONTROL_KEY_DROPDOWN) {
    if (fv.value === null || fv.value.trim() === '') return '—';
    return resolveDropdownLabel(fv.value, lookupTypeId, dropdownData, isAr);
  }

  if (controlKey === CONTROL_KEY_MULTISELECT) {
    if (fv.multiSelectValues === null || fv.multiSelectValues.length === 0) return '—';
    return fv.multiSelectValues
      .map((code) => resolveDropdownLabel(code, lookupTypeId, dropdownData, isAr))
      .join(', ');
  }

  if (controlKey === CONTROL_KEY_DATEPICKER) {
    if (fv.value === null || fv.value.trim() === '') return '—';
    try {
      return new Date(fv.value).toLocaleDateString(isAr ? 'ar-JO' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return fv.value;
    }
  }

  if (fv.value === null || fv.value.trim() === '') return '—';
  return fv.value;
};

// ─── Helper: "| Section Title" paragraph (teal, vertical bar prefix) ──────────

const buildSectionHeader = (text: string): Paragraph =>
  new Paragraph({
    spacing: { before: 360, after: 180 },
    children: [
      // The vertical bar accent
      new TextRun({
        text: '| ',
        bold: true,
        color: COLORS.primary,
        size: 24,
      }),
      new TextRun({
        text,
        bold: true,
        color: COLORS.primary,
        size: 24,
      }),
    ],
  });

// ─── Helper: inline "Label: Value" row for submission info ────────────────────

const buildInfoLine = (label: string, value: string): Paragraph =>
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: COLORS.labelGrey, size: 19 }),
      new TextRun({ text: value, color: COLORS.black, size: 19 }),
    ],
  });

// ─── Helper: KPI field row — bordered two-column table row (label | value) ─────

const buildFieldRow = (label: string, value: string, isEvenRow: boolean): TableRow =>
  new TableRow({
    children: [
      // Label cell (~78% width) — light grey background on even rows
      new TableCell({
        width: { size: 78, type: WidthType.PERCENTAGE },
        shading: { fill: isEvenRow ? COLORS.lightGrey : COLORS.white },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: label, color: COLORS.black, size: 18 })],
          }),
        ],
      }),
      // Value cell (~22% width) — slightly lighter shade, right-aligned bold
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        shading: { fill: isEvenRow ? COLORS.lightGrey : COLORS.white },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: value, bold: true, color: COLORS.primary, size: 18 })],
          }),
        ],
      }),
    ],
  });

// ─── Helper: KPI fields wrapped in a bordered two-column table with a header ──

const buildFieldsTable = (rows: Array<[string, string]>, isAr: boolean): Table => {
  // Column header row — teal background, white text
  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 78, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.primary },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'المؤشر' : 'Indicator',
                bold: true,
                color: COLORS.white,
                size: 18,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.primary },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'القيمة' : 'Value',
                bold: true,
                color: COLORS.white,
                size: 18,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: ALL_NO_BORDER,
    rows: [
      headerRow,
      ...rows.map(([label, value], idx) => buildFieldRow(label, value, idx % 2 === 0)),
    ],
  });
};

// ─── Helper: "Table / Grid Data" full-width teal banner paragraph ─────────────

const buildTableSectionBanner = (isAr: boolean): Paragraph =>
  new Paragraph({
    spacing: { before: 280, after: 0 },
    shading: { fill: COLORS.primary, type: 'clear', color: 'auto' },
    children: [
      new TextRun({
        text: isAr ? 'بيانات الجدول / الشبكة' : 'Table / Grid Data',
        bold: true,
        color: COLORS.white,
        size: 20,
      }),
    ],
  });

// ─── Helper: build a styled data table for a TABLE-type field ────────────────

const buildTableControl = (
  fv: FieldValue,
  dropdownData: GetDropdownListValuesResponse,
  isAr: boolean,
): Table | null => {
  if (fv.columns === null || fv.tableValues === null || fv.tableValues.length === 0) return null;

  const colDefs = fv.columns;

  // Column widths distributed equally
  const colWidthPct = Math.floor(100 / colDefs.length);

  // Header row — teal background, white bold text
  const headerRow = new TableRow({
    children: colDefs.map((col) =>
      new TableCell({
        width: { size: colWidthPct, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.primary },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: isAr ? col.labelAr : col.labelEn,
                bold: true,
                color: COLORS.white,
                size: 18,
              }),
            ],
          }),
        ],
      })
    ),
  });

  // Data rows — alternating background for readability
  const dataRows = fv.tableValues.map((row: TableValueRow, rowIdx: number) => {
    const bgColor = rowIdx % 2 === 0 ? COLORS.white : COLORS.lightGrey;

    const cells = colDefs.map((col) => {
      const rawValue = row.columns[col.columnKey];
      let cellText = rawValue !== undefined ? String(rawValue) : '—';

      // Resolve dropdown labels inside table cells
      if (col.controlType.controlKey === CONTROL_KEY_DROPDOWN && col.lookupType !== null) {
        cellText = resolveDropdownLabel(cellText, col.lookupType.lookupTypeId, dropdownData, isAr);
      }

      return new TableCell({
        width: { size: colWidthPct, type: WidthType.PERCENTAGE },
        shading: { fill: bgColor },
        borders: {
          top: TABLE_CELL_BORDER,
          bottom: TABLE_CELL_BORDER,
          left: TABLE_CELL_BORDER,
          right: TABLE_CELL_BORDER,
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: cellText, size: 18, color: COLORS.black })],
          }),
        ],
      });
    });

    return new TableRow({ children: cells });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
};

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Generates and triggers a DOCX download for a single KPI submission,
 * styled to match the ASEZA design — teal section headers with | prefix,
 * two-column KPI field rows, and teal-header data tables.
 *
 * @param detail       Full submission detail from the API
 * @param dropdownData Resolved dropdown map (lookupTypeId string → options[])
 * @param isAr         Whether to render Arabic labels
 * @param locale       Locale string for date formatting (e.g. 'en-GB' or 'ar-JO')
 */
export const exportSubmissionToDocx = async (
  detail: GetSubmissionDetailsResponse,
  dropdownData: GetDropdownListValuesResponse,
  isAr: boolean,
  locale: string,
): Promise<void> => {
  // ── Date format helper ───────────────────────────────────────────────────

  const formatDate = (iso: string | null): string => {
    if (iso === null) return '—';
    try {
      return new Date(iso).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const periodLabel = new Date(detail.reportingDate).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  // ── Title block ──────────────────────────────────────────────────────────

  // Large centered teal form name
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({
        text: isAr ? detail.formNameAr : detail.formNameEn,
        bold: true,
        color: COLORS.primary,
        size: 44,
      }),
    ],
  });

  // Gray centered reference number beneath the title
  const refParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 },
    children: [
      new TextRun({
        text: detail.referenceNumber,
        color: COLORS.refGrey,
        size: 20,
        italics: true,
      }),
    ],
  });

  // ── Submission Information section ───────────────────────────────────────

  const metaHeader = buildSectionHeader(isAr ? 'معلومات التقديم' : 'Submission Information');

  // Conditionally-included info lines
  const approvalLines: Paragraph[] =
    detail.approvedByUserName !== null
      ? [
          buildInfoLine(isAr ? 'اعتمد بواسطة' : 'Approved By', detail.approvedByUserName),
          buildInfoLine(isAr ? 'تاريخ الاعتماد' : 'Approved At', formatDate(detail.approvedAt)),
        ]
      : [];

  const rejectionLine: Paragraph[] =
    detail.rejectionReason !== null && detail.rejectionReason.length > 0
      ? [buildInfoLine(isAr ? 'سبب الرفض' : 'Rejection Reason', detail.rejectionReason)]
      : [];

  const notesLine: Paragraph[] =
    detail.notes !== null && detail.notes.length > 0
      ? [buildInfoLine(isAr ? 'ملاحظات' : 'Notes', detail.notes)]
      : [];

  const metaLines: Paragraph[] = [
    buildInfoLine(isAr ? 'رقم المرجع' : 'Reference Number', detail.referenceNumber),
    buildInfoLine(isAr ? 'الحالة' : 'Status', detail.submissionStatus),
    buildInfoLine(isAr ? 'نموذج المؤشرات' : 'KPI Form', isAr ? detail.formNameAr : detail.formNameEn),
    buildInfoLine(isAr ? 'المديرية' : 'Directorate', isAr ? detail.directorateNameAr : detail.directorateNameEn),
    buildInfoLine(isAr ? 'الفترة' : 'Period', periodLabel),
    buildInfoLine(isAr ? 'أدخل بواسطة' : 'Submitted By', detail.enteredByUserName),
    buildInfoLine(isAr ? 'تاريخ الإنشاء' : 'Created At', formatDate(detail.createdAt)),
    buildInfoLine(isAr ? 'تاريخ التقديم' : 'Submitted At', formatDate(detail.submittedAt)),
    ...approvalLines,
    ...rejectionLine,
    ...notesLine,
  ];

  const spacerAfterMeta = new Paragraph({ spacing: { after: 240 }, children: [] });

  // ── KPI Field Values section ─────────────────────────────────────────────

  const fieldsHeader = buildSectionHeader(isAr ? 'قيم المؤشرات' : 'KPI Field Values');

  const visibleFields = detail.fieldValues.filter((fv) => fv.isVisible);

  // Separate non-table fields (two-column rows) from TABLE fields
  const scalarRows: Array<[string, string]> = [];
  // Collect table fields to render after the scalar block
  const tableFields: FieldValue[] = [];

  for (const fv of visibleFields) {
    if (fv.controlType.controlKey === CONTROL_KEY_TABLE) {
      tableFields.push(fv);
    } else {
      const label = isAr ? fv.labelAr : fv.labelEn;
      const value = resolveFieldDisplayValue(fv, dropdownData, isAr);
      scalarRows.push([label, value]);
    }
  }

  // Bordered two-column table (Indicator | Value) for scalar/dropdown/multiselect/datepicker fields
  const scalarFieldsBlock: Array<Paragraph | Table> = scalarRows.length > 0
    ? [buildFieldsTable(scalarRows, isAr)]
    : [];

  // Table/Grid blocks — each preceded by the teal banner + label
  const tableBlocks: Array<Paragraph | Table> = [];
  for (const fv of tableFields) {
    const label = isAr ? fv.labelAr : fv.labelEn;
    const tableBlock = buildTableControl(fv, dropdownData, isAr);

    // Full-width teal "Table / Grid Data" banner
    tableBlocks.push(buildTableSectionBanner(isAr));

    // Field label paragraph underneath the banner
    tableBlocks.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: label, bold: false, color: COLORS.labelGrey, size: 18 })],
      })
    );

    if (tableBlock !== null) {
      tableBlocks.push(tableBlock);
    } else {
      tableBlocks.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: '—', color: COLORS.refGrey, size: 18 })],
        })
      );
    }

    // Spacer after each table block
    tableBlocks.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // ── Footer ───────────────────────────────────────────────────────────────

  const footerParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.rowDivider } },
    children: [
      new TextRun({
        text: isAr
          ? `تم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-JO', { day: 'numeric', month: 'long', year: 'numeric' })}`
          : `Exported on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        color: COLORS.refGrey,
        size: 16,
      }),
    ],
  });

  // ── Assemble document ────────────────────────────────────────────────────

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          titleParagraph,
          refParagraph,
          metaHeader,
          ...metaLines,
          spacerAfterMeta,
          fieldsHeader,
          ...scalarFieldsBlock,
          ...tableBlocks,
          footerParagraph,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `ASEZA-${detail.referenceNumber}.docx`);
};
