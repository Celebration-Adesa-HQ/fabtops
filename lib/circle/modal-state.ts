export type FabBabeModalStatus = 'eligible' | 'dismissed' | 'subscribed';

export const FAB_BABE_MODAL_STATUS_KEY = 'fab_babe_circle_status';
export const FAB_BABE_MODAL_DISMISSED_AT_KEY = 'fab_babe_circle_dismissed_at';
export const FAB_BABE_MODAL_SESSION_SEEN_KEY = 'fab_babe_circle_session_seen';

const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const EXCLUDED_PREFIXES = ['/cart', '/checkout', '/login', '/register', '/account'];

export function isFabBabeModalExcludedPath(pathname: string) {
  return EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export interface FabBabeEligibilitySnapshot {
  pathname: string;
  status: FabBabeModalStatus;
  dismissedAt: number | null;
  sessionSeen: boolean;
  now?: number;
}

export function shouldShowFabBabeModal({
  pathname,
  status,
  dismissedAt,
  sessionSeen,
  now = Date.now(),
}: FabBabeEligibilitySnapshot) {
  if (isFabBabeModalExcludedPath(pathname)) {
    return false;
  }

  if (sessionSeen || status === 'subscribed') {
    return false;
  }

  if (status === 'dismissed' && dismissedAt && now - dismissedAt < DISMISS_COOLDOWN_MS) {
    return false;
  }

  return true;
}

function readStatus(rawValue: string | null): FabBabeModalStatus {
  return rawValue === 'dismissed' || rawValue === 'subscribed' ? rawValue : 'eligible';
}

export function getFabBabeModalSnapshot(pathname: string): FabBabeEligibilitySnapshot {
  if (typeof window === 'undefined') {
    return {
      pathname,
      status: 'eligible',
      dismissedAt: null,
      sessionSeen: false,
    };
  }

  const dismissedAt = Number.parseInt(localStorage.getItem(FAB_BABE_MODAL_DISMISSED_AT_KEY) || '', 10);

  return {
    pathname,
    status: readStatus(localStorage.getItem(FAB_BABE_MODAL_STATUS_KEY)),
    dismissedAt: Number.isFinite(dismissedAt) ? dismissedAt : null,
    sessionSeen: sessionStorage.getItem(FAB_BABE_MODAL_SESSION_SEEN_KEY) === 'true',
  };
}

export function markFabBabeModalSeen() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(FAB_BABE_MODAL_SESSION_SEEN_KEY, 'true');
}

export function markFabBabeModalDismissed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAB_BABE_MODAL_STATUS_KEY, 'dismissed');
  localStorage.setItem(FAB_BABE_MODAL_DISMISSED_AT_KEY, String(Date.now()));
  sessionStorage.setItem(FAB_BABE_MODAL_SESSION_SEEN_KEY, 'true');
}

export function markFabBabeModalSubscribed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAB_BABE_MODAL_STATUS_KEY, 'subscribed');
  localStorage.removeItem(FAB_BABE_MODAL_DISMISSED_AT_KEY);
  sessionStorage.setItem(FAB_BABE_MODAL_SESSION_SEEN_KEY, 'true');
}
