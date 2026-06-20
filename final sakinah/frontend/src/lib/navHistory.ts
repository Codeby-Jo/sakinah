/**
 * Previous-route tracker — answers "did I enter this section from outside?".
 *
 * MainLayout calls `recordPath()` during its RENDER. It re-renders synchronously
 * on every navigation (before lazy route chunks resolve), and parents render
 * before children, so by the time a lazy page finally renders, `previousPath`
 * reliably holds the route the user came FROM — regardless of chunk-load timing.
 * The same-path guard makes repeated / StrictMode re-renders a no-op.
 *
 * On a fresh load / refresh, `previousPath` is null (nothing came before), which
 * callers treat as "entering from outside" too.
 */
export const navHistory: { previousPath: string | null; currentPath: string | null } = {
  previousPath: null,
  currentPath: null,
};

export function recordPath(path: string): void {
  if (path === navHistory.currentPath) return;
  navHistory.previousPath = navHistory.currentPath;
  navHistory.currentPath = path;
}
