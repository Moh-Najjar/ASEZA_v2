import React from 'react';
import {
  RocketLaunch as GettingStartedIcon,
  People as UsersIcon,
  AccountTree as DirectoratesIcon,
  Description as FormsIcon,
  ViewList as FieldsIcon,
  Widgets as ControlsIcon,
  Functions as CalculationIcon,
  GridOn as TablesIcon,
  EventRepeat as FrequencyIcon,
  Security as PermissionsIcon,
  HelpOutline as FaqIcon,
} from '@mui/icons-material';
import type { CategoryColor } from '../../../core/constants/theme';

// ─── Content model ────────────────────────────────────────────────────────────
// Inline text in every block supports **bold** and `code` markers.

export type CalloutTone = 'tip' | 'warning' | 'info';

export interface DocStep {
  title: string;
  detail?: string;
}

export interface DocListItem {
  /** Optional bold lead-in shown before the text. */
  term?: string;
  text: string;
}

export interface DocFaqItem {
  question: string;
  answer: string;
}

export interface ParagraphBlock {
  kind: 'paragraph';
  text: string;
}

export interface StepsBlock {
  kind: 'steps';
  title?: string;
  steps: DocStep[];
}

export interface ListBlock {
  kind: 'list';
  title?: string;
  items: DocListItem[];
}

export interface CalloutBlock {
  kind: 'callout';
  tone: CalloutTone;
  title: string;
  text: string;
}

export interface TableBlock {
  kind: 'table';
  title?: string;
  columns: string[];
  rows: string[][];
}

export interface ExampleBlock {
  kind: 'example';
  title: string;
  code: string;
  caption?: string;
}

export interface FaqBlock {
  kind: 'faq';
  items: DocFaqItem[];
}

export type DocBlock =
  | ParagraphBlock
  | StepsBlock
  | ListBlock
  | CalloutBlock
  | TableBlock
  | ExampleBlock
  | FaqBlock;

export interface DocSection {
  /** Used as the URL hash, e.g. /admin/docs#users. */
  id: string;
  title: string;
  summary: string;
  icon: React.ReactNode;
  /** Resolved to a hex value per theme mode at render time. */
  color: CategoryColor;
  /** Optional shortcut to the screen this section describes. */
  related?: { label: string; path: string };
  blocks: DocBlock[];
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    summary: 'What the admin portal does and the recommended order for setting things up.',
    icon: <GettingStartedIcon />,
    color: 'navy',
    related: { label: 'Open Dashboard', path: '/admin' },
    blocks: [
      {
        kind: 'paragraph',
        text: 'The ASEZA Admin portal controls who can use the reporting system and what they see. You manage three things: **Users** (accounts and roles), **Directorates** (organisational units and which forms they can access), and **Forms** (the dynamic data-collection forms that users fill in).',
      },
      {
        kind: 'list',
        title: 'Finding your way around',
        items: [
          { term: 'Sidebar', text: 'Switch between Dashboard, Users, Directorates, Forms and this Documentation. Use the arrow button at the top-left of the header to collapse it to icons only.' },
          { term: 'Language switcher', text: 'Toggle between English and Arabic from the header. The layout flips to right-to-left automatically for Arabic.' },
          { term: 'Profile menu', text: 'Click your avatar at the top-right to see your account and to log out.' },
          { term: 'Refresh buttons', text: 'Every list has a refresh icon that reloads the latest data from the server without reloading the page.' },
        ],
      },
      {
        kind: 'steps',
        title: 'Recommended setup order for a new form',
        steps: [
          { title: 'Create the form', detail: 'Go to **Forms → Create Form** and fill in the key, names, owning directorate and reporting frequency.' },
          { title: 'Build its structure', detail: 'Open the form with **Configure structure** and add its fields, tables and calculations.' },
          { title: 'Give directorates access', detail: 'In **Directorates**, assign the form to each unit that should view, submit or approve it.' },
          { title: 'Prepare the users', detail: 'In **Users**, make sure each person has the right role and the correct primary directorate.' },
          { title: 'Verify', detail: 'Ask a user from the directorate to sign in to the main portal and confirm the form appears under **New Request**.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Bilingual by design',
        text: 'Almost every name, label, help text and message has an English and an Arabic version. Fill in both so the form looks complete for every user, whatever language they choose.',
      },
    ],
  },
  {
    id: 'users',
    title: 'Managing Users',
    summary: 'Search accounts, assign roles, and set each user’s primary directorate.',
    icon: <UsersIcon />,
    color: 'navy',
    related: { label: 'Open Users', path: '/admin/users' },
    blocks: [
      {
        kind: 'paragraph',
        text: 'The Users screen lists every account in the system with its directorate, status and last login date. This screen manages existing accounts; it does not create or delete them.',
      },
      {
        kind: 'list',
        title: 'Finding a user',
        items: [
          { term: 'Search', text: 'Type a name or email in **Find user...** and press **Enter**. The search runs on the server across all pages.' },
          { term: 'Status filter', text: 'Choose **All Status**, **Active Only** or **Inactive** to narrow the list.' },
          { term: 'Pagination', text: 'Show 10, 20 or 50 users per page using the controls at the bottom of the table.' },
        ],
      },
      {
        kind: 'steps',
        title: 'Assigning or removing a role',
        steps: [
          { title: 'Open the user', detail: 'Click the **Manage User** icon at the end of the user’s row.' },
          { title: 'Pick a role', detail: 'Under **User Roles**, choose a role from **Add a new role**.' },
          { title: 'Click Add', detail: 'The role appears as a chip straight away. A user can hold several roles at once.' },
          { title: 'Remove a role', detail: 'Click the small **×** on the role chip. The role is removed immediately with no confirmation step.' },
        ],
      },
      {
        kind: 'steps',
        title: 'Setting the primary directorate',
        steps: [
          { title: 'Choose the directorate', detail: 'Under **Primary Directorate**, select the unit the user belongs to, or **None (unassign)** to clear it.' },
          { title: 'Click Save', detail: 'The **Currently assigned to** panel confirms the change. Click **Finished** to close the dialog.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Why the directorate matters',
        text: 'A user only sees the forms that their directorate has access to. If a user reports a missing form, check their primary directorate first, then the form permissions on that directorate.',
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Changes apply right away',
        text: 'Role and directorate changes are saved the moment you click Add, × or Save. The user may need to sign out and back in before their new permissions take effect in the main portal.',
      },
    ],
  },
  {
    id: 'directorates',
    title: 'Directorates & Form Access',
    summary: 'Control which forms each directorate can view, submit and approve.',
    icon: <DirectoratesIcon />,
    color: 'purple',
    related: { label: 'Open Directorates', path: '/admin/directorates' },
    blocks: [
      {
        kind: 'paragraph',
        text: 'Each directorate is shown as an expandable card with its name, unique key and status. Expand a card to see the forms it has been given access to, along with the permissions granted for each one.',
      },
      {
        kind: 'steps',
        title: 'Giving a directorate access to a form',
        steps: [
          { title: 'Expand the directorate', detail: 'Click the directorate card to open its **Assigned Forms** list.' },
          { title: 'Click Assign New', detail: 'The **Assign Form** dialog opens for that directorate.' },
          { title: 'Select the form', detail: 'Only **active** forms that are **not yet assigned** to this directorate appear in the list.' },
          { title: 'Choose permissions', detail: 'Tick **Can View Submissions**, **Can Submit New Data** and/or **Can Approve/Reject**. View is ticked by default.' },
          { title: 'Click Assign Form', detail: 'The form appears in the list with green badges for the permissions that were granted.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Changing permissions',
        text: 'Permissions cannot be edited in place. To change them, remove the assignment with the delete icon and assign the form again with the new permissions.',
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Removing access is immediate',
        text: 'Clicking the delete icon on an assigned form removes access straight away, with no confirmation. Users in that directorate will stop seeing the form.',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Permission Reference',
    summary: 'What View, Submit and Approve allow a directorate to do.',
    icon: <PermissionsIcon />,
    color: 'purple',
    blocks: [
      {
        kind: 'table',
        columns: ['Permission', 'What it allows', 'Typical use'],
        rows: [
          ['View', 'See submissions made for this form and open their details.', 'Every directorate that works with the form.'],
          ['Submit', 'Create and send new submissions of the form.', 'Directorates that report the data.'],
          ['Approve', 'Approve or reject submitted requests.', 'Reviewing or supervising directorates.'],
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Combine permissions',
        text: 'A directorate can hold any combination. A unit that both reports and reviews its own data needs all three; a read-only observer only needs View.',
      },
    ],
  },
  {
    id: 'forms',
    title: 'Managing Forms',
    summary: 'Create forms, configure their basic details, and deactivate old ones.',
    icon: <FormsIcon />,
    color: 'teal',
    related: { label: 'Open Forms', path: '/admin/forms' },
    blocks: [
      {
        kind: 'paragraph',
        text: 'The Forms screen shows totals for all, active and inactive forms, followed by a searchable table with each form’s identifier, display name, owning directorate, structure and status.',
      },
      {
        kind: 'steps',
        title: 'Creating a form',
        steps: [
          { title: 'Click Create Form', detail: 'The **Create New Form** dialog opens.' },
          { title: 'Enter a Form Unique Key', detail: 'A short identifier such as `TOURISM_STATS`. It is saved in upper case and should never change once the form is in use.' },
          { title: 'Add names and descriptions', detail: 'English and Arabic names are required. Descriptions are optional but help users understand the form’s purpose.' },
          { title: 'Choose directorate and frequency', detail: 'Both are required. The frequency defines how often the form is reported (for example monthly or quarterly).' },
          { title: 'Set effective dates (optional)', detail: '**Effective From** and **Effective To** limit when the form is valid. The end date must be on or after the start date.' },
          { title: 'Save', detail: 'The form appears in the table. Open it with **Configure structure** to start adding fields.' },
        ],
      },
      {
        kind: 'list',
        title: 'Form actions',
        items: [
          { term: 'Configure structure', text: 'Opens the form builder, where you manage fields, tables, calculations and frequencies.' },
          { term: 'Deactivate', text: 'Archives the form. It stays in the system for existing data but can no longer receive new submissions. The button only appears on active forms.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Deactivate instead of rebuilding',
        text: 'If a form is no longer needed, deactivate it rather than deleting its fields. Deactivating keeps historical submissions intact.',
      },
    ],
  },
  {
    id: 'fields',
    title: 'Form Builder & Fields',
    summary: 'Add, edit, order and validate the fields that make up a form.',
    icon: <FieldsIcon />,
    color: 'teal',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Opening a form shows its status, version and description, followed by the **Fields** table. Each row shows the field’s order, label and key, control type, type-specific configuration, the number of active dependency rules, and status badges (Active, Required, Read-only, Hidden).',
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Changes are saved automatically',
        text: 'There is no global Save button in the form builder. Each dialog saves its own changes when you confirm it.',
      },
      {
        kind: 'steps',
        title: 'Adding a field',
        steps: [
          { title: 'Click Add Field', detail: 'On an empty form you can also use **Add First Field**.' },
          { title: 'Set the identifier and labels', detail: '**Field Identifier (Key)** is the internal name used in data and formulas. **Label (EN)** and **Label (AR)** are what users see.' },
          { title: 'Pick the control type', detail: 'The control type decides how the field looks and which settings are shown. A matching data type is suggested automatically. See the Control Types Reference below.' },
          { title: 'Set the display order', detail: 'Lower numbers appear first in the form.' },
          { title: 'Choose flags', detail: '**Required field** forces users to fill it in; untick **Visible** to hide it from users while keeping it on the form.' },
          { title: 'Configure validation and content', detail: 'Fill in the sections that apply to the control type, then save.' },
        ],
      },
      {
        kind: 'list',
        title: 'Field settings explained',
        items: [
          { term: 'Min / Max Value', text: 'Allowed numeric range for Number and Percentage fields.' },
          { term: 'Min / Max Length', text: 'Allowed number of characters for text fields.' },
          { term: 'Input pattern', text: 'A ready-made rule such as Numbers only, Decimal (up to 2 places), Email address, Letters only (English/Arabic) or Jordan mobile number.' },
          { term: 'Validation Message (EN/AR)', text: 'Shown to the user when their input breaks a rule. Write it as a clear instruction, for example “Enter a value between 0 and 100”.' },
          { term: 'Help Text (EN/AR)', text: 'Short guidance shown with the field.' },
          { term: 'Placeholder (EN/AR)', text: 'Example text shown inside an empty input. For Label controls, this is the text that is displayed.' },
          { term: 'Default Value', text: 'Pre-filled value for new submissions.' },
          { term: 'Lookup Type', text: 'The list of options for Dropdown, Radio and Multi-select controls.' },
          { term: 'KPI ID', text: 'Links the field to a KPI definition. The KPI is what holds the field’s reporting frequency.' },
        ],
      },
      {
        kind: 'list',
        title: 'Working with existing fields',
        items: [
          { term: 'Edit Field', text: 'Opens the same dialog used to add a field, pre-filled with the current settings.' },
          { term: 'Delete field', text: 'Permanently removes the field after a confirmation.' },
          { term: 'Status filter', text: 'Show all fields, active only or inactive only. The counter shows how many fields match.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Deleting a field can lose data',
        text: 'Deleting a field removes it permanently, and data already submitted for it may be lost. If the field is simply no longer needed on screen, consider unticking **Visible** instead.',
      },
    ],
  },
  {
    id: 'control-types',
    title: 'Control Types Reference',
    summary: 'Which control to choose and what extra setup each one needs.',
    icon: <ControlsIcon />,
    color: 'teal',
    blocks: [
      {
        kind: 'table',
        columns: ['Control', 'Use it for', 'Suggested data type', 'Extra setup'],
        rows: [
          ['Text', 'Short single-line answers', 'TEXT', 'Length and pattern validation'],
          ['Textarea', 'Longer, multi-line answers', 'TEXT', 'Length validation'],
          ['Number', 'Any numeric value', 'NUMBER', 'Min/max value and pattern'],
          ['Percentage', 'Values from 0 to 100', 'NUMBER', 'Min/max value and pattern'],
          ['Date picker', 'Dates', 'DATE', 'None'],
          ['Dropdown', 'One option from a long list', 'TEXT', 'Lookup type required'],
          ['Radio', 'One option from a short, visible list', 'TEXT', 'Lookup type required'],
          ['Multi-select', 'Several options from a list', 'TEXT', 'Lookup type required'],
          ['Checkbox', 'Yes / no answers', 'BOOLEAN', 'Always optional, no validation'],
          ['File upload', 'Attachments and evidence', 'TEXT', 'No validation'],
          ['Table', 'A list where users add their own rows', 'TEXT', 'Columns via Configure Columns'],
          ['Raw table', 'A fixed grid of rows × columns', 'TEXT', 'Columns and rows via Configure Grid'],
          ['Label', 'Read-only text or headings inside the form', 'TEXT', 'Placeholder EN/AR is the displayed text'],
          ['Calculated field', 'A value computed from other inputs', 'NUMBER (locked)', 'Formula via Configure Calculation'],
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Red text in the Configuration column',
        text: 'If the table shows **Not assigned** or **Not configured** in red, the field is missing required setup, such as a lookup or a formula, and will not work for users until it is fixed.',
      },
    ],
  },
  {
    id: 'calculations',
    title: 'Calculated Fields',
    summary: 'Build formula-based fields that compute a result from user inputs.',
    icon: <CalculationIcon />,
    color: 'amber',
    blocks: [
      {
        kind: 'paragraph',
        text: 'A Calculated field asks the user for one or more input values and computes a result with a formula. It is always read-only, and its data type is locked to NUMBER. After adding the field, click **Configure Calculation** in its Configuration column.',
      },
      {
        kind: 'list',
        title: 'Calculation settings',
        items: [
          { term: 'Inputs', text: 'Each input has a **token** (such as `A`), a column key, English and Arabic labels, a data type and a control type. At least one input is required.' },
          { term: 'Formula expression', text: 'Combine the input tokens with arithmetic, for example `A / B`. New calculations start with this formula and two inputs.' },
          { term: 'Result', text: 'The result column key, its English and Arabic labels, and the precision (number of decimal places, zero or more).' },
          { term: 'Button label (EN/AR)', text: 'The text on the button users press to run the calculation, such as “Calculate”.' },
          { term: 'Display formula (EN/AR)', text: 'Optional human-readable version of the formula shown to users.' },
        ],
      },
      {
        kind: 'example',
        title: 'Example: hotel occupancy rate',
        code: 'Inputs:  A = Occupied rooms    B = Available rooms\nFormula: (A / B) * 100\nResult:  Occupancy rate (%), precision 2',
        caption: 'Set the display formula to “Occupied ÷ Available × 100” so users understand how the result is produced.',
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keep tokens and formula in sync',
        text: 'Tokens and keys are saved in upper case. If you rename or remove an input, update the formula so it only refers to tokens that still exist.',
      },
    ],
  },
  {
    id: 'tables',
    title: 'Tables & Grids',
    summary: 'Configure the columns and rows for Table and Raw table controls.',
    icon: <TablesIcon />,
    color: 'amber',
    blocks: [
      {
        kind: 'table',
        columns: ['', 'Table', 'Raw table'],
        rows: [
          ['Rows', 'Users add as many rows as they need', 'Fixed rows defined by you'],
          ['Setup button', 'Configure Columns', 'Configure Grid'],
          ['Best for', 'Lists of items (e.g. projects, events)', 'Fixed matrices (e.g. month × category)'],
        ],
      },
      {
        kind: 'steps',
        title: 'Setting up a table',
        steps: [
          { title: 'Add the field', detail: 'Choose the **Table** or **Raw table** control and enter the help text users should see above the table.' },
          { title: 'Open the structure dialog', detail: 'Click **Configure Columns** (Table) or **Configure Grid** (Raw table) on the field row.' },
          { title: 'Add columns', detail: 'Give each column a key and English and Arabic labels, and choose how the cell is entered.' },
          { title: 'Add rows (Raw table only)', detail: 'Define each fixed row with a key and labels. These rows appear as row headers in the grid.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Counters on the field row',
        text: 'The Configuration column shows how many columns and rows a table has. A count shown in orange means nothing has been configured yet.',
      },
    ],
  },
  {
    id: 'frequency',
    title: 'Field Frequency & Periods',
    summary: 'Set how often a KPI field is reported and preview its reporting windows.',
    icon: <FrequencyIcon />,
    color: 'amber',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Fields linked to a KPI can have their own reporting frequency. Click **Assign Frequency** (or **Manage Frequency** if one is already set) on the field row to open the **Field Frequency** dialog.',
      },
      {
        kind: 'steps',
        title: 'Assigning a frequency',
        steps: [
          { title: 'Choose a frequency', detail: 'Options marked **discrete periods** split the year into separate reporting windows.' },
          { title: 'Pick a year', detail: 'The year (between 1900 and 2100) is used to preview windows. For daily or weekly frequencies, also choose a month.' },
          { title: 'Set a custom start (optional)', detail: 'Use **Period start date** if the reporting year does not start on 1 January. Only the month and day are used, and they repeat every year.' },
          { title: 'Review and save', detail: 'Check the **Preview windows**, **Expected periods** and the number of submitted periods for the year, then save.' },
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'A KPI is required',
        text: 'The frequency is stored on the field’s KPI definition. If saving fails, edit the field and set its **KPI ID** first.',
      },
    ],
  },
  {
    id: 'faq',
    title: 'Troubleshooting & FAQ',
    summary: 'Quick answers to the most common problems.',
    icon: <FaqIcon />,
    color: 'navy',
    blocks: [
      {
        kind: 'faq',
        items: [
          {
            question: 'A user says they cannot see a form.',
            answer: 'Check three things in order: the user has a **primary directorate**, that directorate has the form assigned with the right **permission** (View or Submit), and the form is **active**.',
          },
          {
            question: 'A form is missing from the Assign Form list.',
            answer: 'The list only shows active forms that are not already assigned to that directorate. Check the form’s status on the Forms screen, or look for it in the directorate’s existing assignments.',
          },
          {
            question: 'A dropdown shows no options to users.',
            answer: 'Dropdown, Radio and Multi-select controls need a **Lookup Type**. Edit the field and assign one; the Configuration column shows **Not assigned** in red until you do.',
          },
          {
            question: 'Saving a field frequency fails.',
            answer: 'The frequency is stored on the KPI definition, so the field needs a **KPI ID**. Edit the field, set the KPI ID, then try again.',
          },
          {
            question: 'How do I change the permissions a directorate has on a form?',
            answer: 'Remove the form from the directorate, then assign it again with the new permissions.',
          },
          {
            question: 'I see “Unable to load” on a screen.',
            answer: 'Click **Retry** or the refresh icon. If it keeps failing, your session may have expired: log out from the profile menu and sign in again. If the problem continues, contact the development team.',
          },
          {
            question: 'Should I delete or deactivate?',
            answer: 'Prefer deactivating forms and hiding fields. Deleting a field is permanent and may lose submitted data.',
          },
        ],
      },
    ],
  },
];

// ─── Search helpers ───────────────────────────────────────────────────────────

/** Flattens a block into plain text so it can be matched against a search query. */
const blockToText = (block: DocBlock): string => {
  switch (block.kind) {
    case 'paragraph':
      return block.text;
    case 'steps':
      return [block.title ?? '', ...block.steps.map((s) => `${s.title} ${s.detail ?? ''}`)].join(' ');
    case 'list':
      return [block.title ?? '', ...block.items.map((i) => `${i.term ?? ''} ${i.text}`)].join(' ');
    case 'callout':
      return `${block.title} ${block.text}`;
    case 'table':
      return [block.title ?? '', ...block.columns, ...block.rows.flat()].join(' ');
    case 'example':
      return [block.title, block.code, block.caption ?? ''].join(' ');
    case 'faq':
      return block.items.map((i) => `${i.question} ${i.answer}`).join(' ');
    default: {
      // Exhaustiveness check: a new block kind must be handled above.
      const unreachable: never = block;
      return String(unreachable);
    }
  }
};

/** Returns the full lower-cased searchable text of a section. */
export const sectionSearchText = (section: DocSection): string =>
  [section.title, section.summary, ...section.blocks.map(blockToText)].join(' ').toLowerCase();
