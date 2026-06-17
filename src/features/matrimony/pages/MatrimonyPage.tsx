/**
 * MatrimonyPage — Sakinah entry redirect
 * Clicking "Sakinah" in the sidebar hits /matrimony → redirect to the
 * Sakinah welcome page which lives at /matrimony/welcome.
 */
import { Navigate } from 'react-router-dom';

export function MatrimonyPage() {
  return <Navigate to="/matrimony/welcome" replace />;
}
