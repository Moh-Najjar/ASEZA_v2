import type { SvgIconComponent } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from "@mui/icons-material/X";

/**
 * Interface for a simple footer link.
 */
export interface FooterLink {
    label: string;
    path: string;
}

/**
 * Interface for a contact item with an icon.
 */
export interface ContactItem {
    icon: SvgIconComponent;
    text: string;
    link?: string;
}

/**
 * Interface for a social link with an icon.
 */
export interface SocialLink {
    icon: SvgIconComponent;
    link: string;
    label: string;
}

/**
 * Base links configuration for the footer.
 */
export const USEFUL_LINKS: FooterLink[] = [
    { label: "عن دار البر", path: "/about" },
    { label: "مشاريعنا الخيرية", path: "/projects" },
    { label: "الفعاليات والأخبار", path: "/news" },
    // { label: "الحملات الموسمية", path: "/seasonal-campaigns" },
    // { label: "المساعدة", path: "/help" },
    // { label: "التوظيف", path: "/careers" },
    // { label: "تواصل معنا", path: "/contact" },
    // { label: "حسابات بنكية", path: "/bank-accounts" },
];

/**
 * Contact items configuration.
 */
export const CONTACT_ITEMS: ContactItem[] = [
    {
        icon: LocationOnIcon,
        text: "شارع الشيخ زايد - المنارة - دبي الإمارات العربية المتحدة",
    },
    {
        icon: EmailIcon,
        text: "quality@daralber.ae",
        link: "mailto:quality@daralber.ae",
    },
    {
        icon: PhoneIcon,
        text: "800 79",
        link: "tel:80079",
    },
    {
        icon: PhoneIcon,
        text: "043185999",
        link: "tel:043185999",
    },
    {
        icon: WhatsAppIcon,
        text: "052 6155550",
        link: "https://wa.me/971526155550",
    },
];

/**
 * Social media links configuration.
 */
export const SOCIAL_LINKS: SocialLink[] = [
    { icon: FacebookIcon, link: "https://www.facebook.com/daralbersociety/", label: "Facebook" },
    { icon: InstagramIcon, link: "https://www.instagram.com/daralbersociety/", label: "Instagram" },
    { icon: YouTubeIcon, link: "https://www.youtube.com/user/DaralberSocietyuae/featured/", label: "YouTube" },
    { icon: XIcon, link: "https://twitter.com/DarAlBerSociety", label: "Twitter" },
];

/**
 * Bottom bar links configuration.
 */
export const BOTTOM_LINKS: FooterLink[] = [
    { label: "سياسة الخصوصية", path: "https://daralber.ae/ar/policy.html" },
    { label: "الشروط والأحكام", path: "https://daralber.ae/ar/terms.html" },
];

