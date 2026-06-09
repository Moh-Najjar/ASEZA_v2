import type { Step } from 'react-joyride';

// ─── Extended Step Type ───────────────────────────────────────────────────────

/**
 * Extends the base Joyride Step with the route this step belongs to,
 * so the AppTour component can navigate between pages automatically.
 */
export interface TourStep extends Step {
  /** The app route where this step's target element lives. */
  routePath: string;
}

// ─── Bilingual Step Definition ────────────────────────────────────────────────

interface BilingualStep {
  routePath: string;
  target: string;
  placement: Step['placement'];
  ar: { title: string; content: string };
  en: { title: string; content: string };
}

// ─── Raw bilingual data ───────────────────────────────────────────────────────

const BILINGUAL_STEPS: BilingualStep[] = [
  // ── 0: Welcome splash ──────────────────────────────────────────────────────
  {
    routePath: '/home',
    target: 'body',
    placement: 'center',
    ar: {
      title: '👋 مرحباً بك في بوابة ASEZA',
      content: 'ستأخذك هذه الجولة خطوة بخطوة من تسجيل الدخول حتى رفع الطلب. اضغط "التالي" للبدء.',
    },
    en: {
      title: '👋 Welcome to the ASEZA Portal',
      content: 'This tour will guide you step by step from login to submitting a request. Press "Next" to begin.',
    },
  },

  // ── 1: Stats cards ─────────────────────────────────────────────────────────
  {
    routePath: '/home',
    target: '[data-tour="home-stats"]',
    placement: 'bottom',
    ar: {
      title: '📊 إحصائيات الطلبات',
      content: 'تعرض هذه البطاقات ملخصاً سريعاً لجميع طلباتك: الإجمالي، قيد المراجعة، المعتمدة، والمرفوضة.',
    },
    en: {
      title: '📊 Request Statistics',
      content: 'These cards show a quick summary of all your requests: total, under review, approved, and rejected.',
    },
  },

  // ── 2: Quick actions ───────────────────────────────────────────────────────
  {
    routePath: '/home',
    target: '[data-tour="home-quick-actions"]',
    placement: 'left',
    ar: {
      title: '⚡ الإجراءات السريعة',
      content: 'من هنا يمكنك إنشاء طلب جديد أو الانتقال مباشرة إلى قائمة طلباتك بضغطة واحدة.',
    },
    en: {
      title: '⚡ Quick Actions',
      content: 'From here you can create a new request or navigate directly to your request list with one click.',
    },
  },

  // ── 3: Recent submissions ──────────────────────────────────────────────────
  {
    routePath: '/home',
    target: '[data-tour="home-recent"]',
    placement: 'top',
    ar: {
      title: '📋 آخر الطلبات',
      content: 'تُعرض هنا أحدث 5 طلبات قمت بإرسالها مع حالة كل طلب. اضغط على أي صف للاطلاع على التفاصيل.',
    },
    en: {
      title: '📋 Recent Submissions',
      content: 'Your 5 most recent submissions are shown here with their current status. Click any row to view details.',
    },
  },

  // ── 4: My Requests page intro ──────────────────────────────────────────────
  {
    routePath: '/my-requests',
    target: 'body',
    placement: 'center',
    ar: {
      title: '📁 صفحة طلباتي',
      content: 'هذه الصفحة تحتوي على جميع طلباتك. يمكنك هنا إنشاء طلبات جديدة، متابعة حالتها، وتصدير التقارير.',
    },
    en: {
      title: '📁 My Requests Page',
      content: 'This page contains all your requests. You can create new ones, track their status, and export reports.',
    },
  },

  // ── 5: New request button ──────────────────────────────────────────────────
  {
    routePath: '/my-requests',
    target: '[data-tour="new-request-btn"]',
    placement: 'bottom',
    ar: {
      title: '➕ إضافة طلب جديد',
      content: 'اضغط هذا الزر لفتح نموذج إدخال بيانات مؤشرات الأداء (KPI) وبدء طلب جديد.',
    },
    en: {
      title: '➕ Add New Request',
      content: 'Click this button to open the KPI data entry form and start a new submission.',
    },
  },

  // ── 6: Requests table ──────────────────────────────────────────────────────
  {
    routePath: '/my-requests',
    target: '[data-tour="requests-table"]',
    placement: 'top',
    ar: {
      title: '📄 جدول الطلبات',
      content: 'يُعرض هنا جميع طلباتك مع رقم الطلب، النموذج، المديرية، الحالة، وأزرار الإجراءات. يمكنك التصفية والبحث في أعلى الجدول.',
    },
    en: {
      title: '📄 Requests Table',
      content: 'All your requests are listed here with the request number, form, directorate, status, and action buttons. You can filter and search at the top of the table.',
    },
  },

  // ── 7: New Request page intro ──────────────────────────────────────────────
  {
    routePath: '/my-requests/new',
    target: 'body',
    placement: 'center',
    ar: {
      title: '📝 نموذج الطلب الجديد',
      content: 'هذه صفحة إنشاء الطلب. النموذج مقسّم إلى خطوات واضحة — يجب إكمال كل خطوة قبل الانتقال للتالية.',
    },
    en: {
      title: '📝 New Request Form',
      content: 'This is the request creation page. The form is split into clear steps — each step must be completed before moving to the next.',
    },
  },

  // ── 8: Stepper ─────────────────────────────────────────────────────────────
  {
    routePath: '/my-requests/new',
    target: '[data-tour="stepper-container"]',
    placement: 'top',
    ar: {
      title: '🔢 خطوات النموذج',
      content: 'يوضح هذا الشريط عدد خطوات النموذج وأيها أنت فيه الآن. أكمل كل الحقول في كل خطوة قبل الضغط على "التالي".',
    },
    en: {
      title: '🔢 Form Steps',
      content: 'This bar shows the total number of steps and which one you are on now. Fill all fields in each step before pressing "Next".',
    },
  },

  // ── 9: Progress sidebar ────────────────────────────────────────────────────
  {
    routePath: '/my-requests/new',
    target: '[data-tour="progress-sidebar"]',
    placement: 'left',
    ar: {
      title: '📈 نسبة الإنجاز',
      content: 'يتابع هذا الشريط تقدمك في إكمال النموذج ويعرض معلومات طلبك (النموذج، المديرية، الفترة).',
    },
    en: {
      title: '📈 Completion Progress',
      content: 'This sidebar tracks your form completion progress and displays your request details (form, directorate, period).',
    },
  },

  // ── 10: Submit actions ─────────────────────────────────────────────────────
  {
    routePath: '/my-requests/new',
    target: '[data-tour="stepper-actions"]',
    placement: 'top',
    ar: {
      title: '✅ الإرسال النهائي',
      content: 'بعد إكمال جميع الخطوات، اضغط زر "إرسال" لرفع الطلب. ستظهر رسالة تأكيد عند نجاح الإرسال.',
    },
    en: {
      title: '✅ Final Submission',
      content: 'After completing all steps, press the "Submit" button to send your request. A confirmation message will appear on success.',
    },
  },
];

// ─── Factory function ─────────────────────────────────────────────────────────

/**
 * Returns the tour steps in the correct language.
 * Call this inside the component so it reacts to language changes.
 *
 * @param isAr - Whether the current app language is Arabic.
 */
export const getTourSteps = (isAr: boolean): TourStep[] =>
  BILINGUAL_STEPS.map((step) => ({
    routePath: step.routePath,
    target: step.target,
    placement: step.placement,
    skipBeacon: true,
    title: isAr ? step.ar.title : step.en.title,
    content: isAr ? step.ar.content : step.en.content,
  }));
