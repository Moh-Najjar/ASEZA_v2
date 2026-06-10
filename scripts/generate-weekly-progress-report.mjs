/**
 * One-off generator: ASEZA weekly progress report as a Word (.docx) file.
 * Run: node scripts/generate-weekly-progress-report.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'ASEZA_Weekly_Progress_Report_Week_Jun2-9_2026.docx',
);

const COLORS = {
  primary: '1A6F8E',
  white: 'FFFFFF',
  lightGrey: 'F2F5F8',
  rowDivider: 'D8E4EC',
  labelGrey: '4A5568',
  black: '1A202C',
  warning: 'B7791F',
};

const CELL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLORS.rowDivider,
};

const ALL_CELL_BORDER = {
  top: CELL_BORDER,
  bottom: CELL_BORDER,
  left: CELL_BORDER,
  right: CELL_BORDER,
};

/** @param {string} text */
const heading1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: COLORS.primary })],
  });

/** @param {string} text */
const heading2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 26, color: COLORS.black })],
  });

/** @param {string} text */
const heading3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 22, color: COLORS.labelGrey })],
  });

/** @param {string} text */
const body = (text) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, color: COLORS.black })],
  });

/** @param {string} text */
const bullet = (text) =>
  new Paragraph({
    spacing: { after: 80 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 22, color: COLORS.black })],
  });

/** @param {string[][]} rows @param {number[]} colWidthsPct */
const buildTable = (rows, colWidthsPct) => {
  const tableRows = rows.map((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    const bgColor = isHeader ? COLORS.primary : rowIdx % 2 === 0 ? COLORS.white : COLORS.lightGrey;

    return new TableRow({
      children: row.map((cellText, colIdx) =>
        new TableCell({
          width: { size: colWidthsPct[colIdx] ?? 25, type: WidthType.PERCENTAGE },
          shading: { fill: bgColor },
          borders: ALL_CELL_BORDER,
          children: [
            new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader,
                  size: 20,
                  color: isHeader ? COLORS.white : COLORS.black,
                }),
              ],
            }),
          ],
        }),
      ),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
};

const spacer = () => new Paragraph({ spacing: { after: 160 }, children: [] });

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: 'ASEZA Project — Weekly Progress Report',
              bold: true,
              size: 36,
              color: COLORS.primary,
            }),
          ],
        }),
        body('Reporting Period: Week of 2–9 June 2026'),
        body('Prepared by: Muhammad'),
        body('Project: ASEZA KPI Data Submission Portal (Frontend)'),
        spacer(),

        heading1('1. Executive Summary'),
        body(
          'Frontend development for the ASEZA portal is ongoing. Core modules (Login, Home, My Requests, New Request) are in place, but several planned enhancements are still in progress and not yet completed. This week\'s focus is on the new request flow, form controls, data mapping, export, navigation/validation, and user onboarding.',
        ),
        body('Overall frontend status: ~75–80% complete (core journey functional; enhancements below pending).'),
        spacer(),

        heading1('2. Work Items — Status'),
        buildTable(
          [
            ['#', 'Work Item', 'Status', 'Notes'],
            [
              '1',
              'New Request Flow — Review & Confirm Step',
              'In Progress — Not Done',
              'Final review step, read-only summary, edit sections, confirmation checkbox',
            ],
            [
              '2',
              'New Form Controls',
              'In Progress — Not Done',
              '10 control types — see Section 3',
            ],
            [
              '3',
              'DOCX Export Enhancement',
              'In Progress — Not Done',
              'RAW_TABLE AR/EN support, improved field spacing',
            ],
            [
              '4',
              'Stepper Navigation & Validation',
              'In Progress — Not Done',
              'Per-page validation, review-step gating, post-submit flow',
            ],
            [
              '5',
              'User Guide + Interactive Tour',
              'In Progress — Not Done',
              'Bilingual guide + Joyride tour across app routes',
            ],
            [
              '6',
              'Rework All Data Mapping for Fields',
              'In Progress — Not Done',
              'Submit, read, validation, and export mapping alignment',
            ],
          ],
          [8, 32, 22, 38],
        ),
        spacer(),

        heading1('3. Form Controls (New / Enhanced)'),
        body(
          'Dynamic form controls used across New Request, Review, My Requests detail, and DOCX export:',
        ),
        buildTable(
          [
            ['Control Key', 'Component', 'Purpose', 'Status'],
            ['TEXT', 'InputField', 'Text input fields', 'In use — mapping/validation rework pending'],
            ['NUMBER', 'InputField', 'Numeric input fields', 'In use — mapping/validation rework pending'],
            ['PERCENTAGE', 'PercentageField', 'Percentage values with formatting', 'In use — mapping/validation rework pending'],
            ['DATEPICKER', 'Date', 'Date selection (ISO format)', 'In use — mapping/validation rework pending'],
            ['DROPDOWN', 'DropDown', 'Single-select lookup fields', 'In use — mapping/validation rework pending'],
            ['MULTISELECT', 'MultiSelect', 'Multi-select lookup fields', 'In use — mapping/validation rework pending'],
            ['TABLE', 'TableGrid', 'Dynamic row-based data tables', 'In use — mapping/validation rework pending'],
            [
              'RAW_TABLE',
              'RawTable',
              'Fixed grid tables with row labels & label columns',
              'New/Enhanced — AR/EN export & mapping still pending',
            ],
            ['LABEL', 'Label', 'Display-only labels (incl. RAW_TABLE row labels)', 'In use — mapping rework pending'],
            [
              'CALCULATED_FIELD',
              'CalculatedField',
              'Auto-calculated fields from inputs',
              'In use — validation & mapping rework pending',
            ],
          ],
          [22, 18, 35, 25],
        ),
        body('Total controls: 10 control types across 11 UI components.'),
        spacer(),

        heading1('4. Detailed Progress by Area'),

        heading2('4.1 New Request Flow — Review & Confirm Step'),
        body('Status: In Progress — Not Done'),
        heading3('Planned scope'),
        bullet('Add final Review & Confirm step at end of stepper'),
        bullet('Show read-only summary of all entered data, grouped by section/page'),
        bullet('Edit button per section to jump back to that step'),
        bullet('Run full-form validation before entering review step'),
        bullet('Show missing/invalid required fields on review screen'),
        bullet('Confirmation checkbox: "I confirm that the information is correct"'),
        bullet('Disable submit until checkbox is checked and all validations pass'),
        bullet('Move API submission to execute only from Review step'),
        bullet('AR/EN translations for all new strings'),
        heading3('Remaining work'),
        body('Implementation, QA across all control types, post-submit navigation fix, UAT.'),
        spacer(),

        heading2('4.2 DOCX Export Enhancement'),
        body('Status: In Progress — Not Done'),
        heading3('Planned scope'),
        bullet('RAW_TABLE bilingual export (row labels rowLabelEn / rowLabelAr, LABEL columns)'),
        bullet('Locale-aware dropdown and date formatting in exported tables'),
        bullet('Increased vertical spacing between fields, sections, and table blocks'),
        bullet('Align export output with on-screen UI for AR and EN'),
        heading3('Remaining work'),
        body('Complete RAW_TABLE handling, spacing tuning, cross-locale testing.'),
        spacer(),

        heading2('4.3 Stepper Navigation & Validation Logic'),
        body('Status: In Progress — Not Done'),
        heading3('Planned scope'),
        bullet('Per-page validation on intermediate steps (validate current page only)'),
        bullet('Full-form validation gate before entering Review step'),
        bullet(
          'validateAllFormFields utility for all control types (TABLE, RAW_TABLE, CALCULATED_FIELD, etc.)',
        ),
        bullet('Form value persistence across steps (shouldUnregister: false)'),
        bullet('Reliable post-submit flow (success dialog → navigate to My Requests)'),
        bullet('Fix navigation freeze after submit (URL changes but view does not update)'),
        heading3('Remaining work'),
        body('Post-submit navigation bug, AnimatePresence/route unmount behavior, end-to-end testing.'),
        spacer(),

        heading2('4.4 User Guide + Interactive Tour'),
        body('Status: In Progress — Not Done'),
        heading3('Planned scope'),
        bullet('Bilingual User Guide page (login, home, requests, new request, review step)'),
        bullet('Interactive Joyride tour across routes (/home, /my-requests, /new-request, etc.)'),
        bullet('Tour copy updated for Review & Confirm submission flow'),
        bullet('Lightbulb icon in navbar to launch tour anytime'),
        heading3('Remaining work'),
        body('Tour steps for review step, final copy review, AR/EN parity check.'),
        spacer(),

        heading2('4.5 Rework All Data Mapping for Fields'),
        body('Status: In Progress — Not Done'),
        body('Data mapping must be consistent across submit, read, validation, and export:'),
        buildTable(
          [
            ['Layer', 'File / Area', 'Purpose', 'Status'],
            ['Submit mapping', 'formDataMapper.ts', 'Form values → API fieldValues on create', 'Rework pending'],
            [
              'Read mapping',
              'fieldValueToFormField.ts',
              'API submission details → FormField for display',
              'Rework pending',
            ],
            [
              'Validation paths',
              'validateAllFormFields.ts',
              'RHF paths per control type',
              'Rework pending',
            ],
            ['Export mapping', 'exportToDocx.ts', 'Submission data → DOCX tables/fields', 'Rework pending'],
          ],
          [18, 28, 34, 20],
        ),
        heading3('Remaining work'),
        body(
          'Unify mapping rules for TABLE, RAW_TABLE, CALCULATED_FIELD, DROPDOWN, MULTISELECT, and DATEPICKER across all layers; ensure AR/EN labels and values match API contract.',
        ),
        spacer(),

        heading1('5. Modules — Current Status'),
        buildTable(
          [
            ['Module', 'Status'],
            ['Login (Microsoft Entra ID SSO)', 'Functional'],
            ['Home Dashboard', 'Functional'],
            ['My Requests (list, detail, approve/reject)', 'Functional'],
            ['New Request (multi-step dynamic form)', 'Functional — enhancements in progress'],
            ['DOCX Export', 'Partial — enhancement in progress'],
            ['User Guide', 'Partial — tour integration in progress'],
            ['Bilingual Support (AR/EN)', 'Ongoing across all modules'],
          ],
          [55, 45],
        ),
        spacer(),

        heading1('6. Blockers / Risks'),
        bullet(
          'Post-submit navigation freeze — After form submit, app navigation may freeze until page refresh (under investigation).',
        ),
        bullet(
          'Data mapping inconsistency — Different mapping logic in submit vs. read vs. export may cause display/export mismatches.',
        ),
        bullet(
          'Complex controls — RAW_TABLE and CALCULATED_FIELD need aligned handling in validation, review, and DOCX export.',
        ),
        spacer(),

        heading1('7. Plan for Next Week'),
        bullet('Complete Review & Confirm step and fix post-submit navigation'),
        bullet('Finish data mapping rework across all layers'),
        bullet('Complete DOCX export for RAW_TABLE (AR/EN)'),
        bullet('Finalize User Guide and Interactive Tour (including review step)'),
        bullet('Full QA pass on all 10 control types'),
        bullet('Stakeholder UAT on submission flow'),
        spacer(),

        heading1('8. Summary'),
        body(
          'This week\'s ASEZA frontend work centers on six in-progress items that are not yet complete: Review & Confirm step, form controls alignment, DOCX export, stepper validation/navigation, User Guide/Tour, and full data mapping rework. Core user journey works, but these enhancements are required before release readiness.',
        ),
        spacer(),
        body('Prepared by: Muhammad'),
        body('Date: 9 June 2026'),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUTPUT_PATH, buffer);
console.log(`Created: ${OUTPUT_PATH}`);
