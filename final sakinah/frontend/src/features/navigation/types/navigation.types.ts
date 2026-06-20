/**
 * Navigation Types
 * Defines sidebar, bottom nav, top nav, and drawer item structures
 * Matches Flutter's navigation_home.dart 6-section drawer structure
 */

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  path: string;
  /** Only visible when user is authenticated */
  protected?: boolean;
  /** Only visible to admin users */
  adminOnly?: boolean;
  /** Premium badge label (e.g., "AI", "PRO") */
  badge?: string;
  /** One-line description shown under the label in the Universe-style drawer. */
  description?: string;
  /** Arabic name shown beside the label in the drawer. */
  ar?: string;
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

/** Top navigation pill tabs — mirrors Flutter's horizontal tab bar */
export const TOP_NAV_TABS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: 'Home', path: '/' },
  { id: 'ai', label: 'Raya', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI' },
  { id: 'quran', label: 'Quran Reading', icon: 'BookOpen', path: '/quran' },
  // Hidden from top bar per request — entries preserved for easy restore:
  // { id: 'connections', label: 'Connections', icon: 'Users', path: '/connections' },
  // { id: 'wallet', label: 'Wallet', icon: 'CreditCard', path: '/wallet' },
  { id: 'barka-labs', label: 'Barakah Labs', icon: 'Sparkle', path: '/barakah-labs' },
];

/** Bottom navigation tabs (mobile) — 4 core tabs.
 *  One shared dock used on every mobile route (home + raya + quran + barakah).
 *  Replaces the previous per-feature docks (HomeReferenceDock, barakah-labs Dock). */
export const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: 'Home', path: '/' },
  { id: 'ai', label: 'Raya', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI' },
  { id: 'quran', label: 'Quran', icon: 'BookOpen', path: '/quran' },
  { id: 'barakah', label: 'Barakah', icon: 'Flask', path: '/barakah-labs' },
];

/**
 * Sidebar sections — matches Flutter's 6-section drawer menu
 * Flutter source: navigation_home.dart _buildDrawerContent()
 */
// NOTE (Sakinah handoff): this is the trimmed app-shell drawer. Standalone
// verticals (trading, banking, souk, zakat, matrimony, etc.) were removed for
// this handoff; only the routes that still exist in the shell are listed here.
export const SIDEBAR_SECTIONS: NavSectionConfig[] = [
  {
    title: 'Finance',
    items: [
      { id: 'home', label: 'Home', icon: 'Home', path: '/', description: 'Your dashboard' },
      { id: 'wallet', label: 'Wallet', icon: 'CreditCard', path: '/wallet', description: 'DNZ balance & rewards', ar: 'محفظة' },
      { id: 'eim', label: 'EIM', icon: 'Sparkles', path: '/eim', badge: 'NEW', description: 'Halal wealth mentor' },
    ],
  },
  {
    title: 'Islamic',
    items: [
      { id: 'quran', label: 'Qur’an', icon: 'BookOpen', path: '/quran', description: 'Read & reflect', ar: 'القرآن' },
      { id: 'barka-labs', label: 'Baraka', icon: 'Flask', path: '/barakah-labs', description: 'Gratitude & reflection', ar: 'بركة' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'connections', label: 'Connections', icon: 'UserPlus', path: '/connections', description: 'Your network' },
      { id: 'messages', label: 'Messages', icon: 'ChatCircleDots', path: '/messages', description: 'Private chats' },
      { id: 'halaqah', label: 'Halaqah', icon: 'UsersRound', path: '/halaqah', badge: 'SOON', description: 'Circles & gatherings', ar: 'حلقة' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'ai', label: 'Raya', icon: 'Sparkles', path: '/ai-assistant', badge: 'AI', description: 'Your companion', ar: 'رايا' },
      { id: 'raya-agent', label: 'Raya on WA', icon: 'WhatsappLogo', path: '/raya', description: 'Chat on WhatsApp' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: 'User', path: '/profile', description: 'Your profile' },
      { id: 'notifications', label: 'Alerts', icon: 'Bell', path: '/notifications', description: 'Alerts & updates' },
      { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings', description: 'Preferences' },
      { id: 'help', label: 'Help', icon: 'HelpCircle', path: '/help', description: 'FAQs & guides' },
      { id: 'about', label: 'About', icon: 'HelpCircle', path: '/about', description: 'About Zaryah+' },
    ],
  },
];
