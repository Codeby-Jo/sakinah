/**
 * useConnectors — TanStack Query hooks for the Raya hub connector toggles.
 *   - useConnectors(): list + per-user status
 *   - useStartConnect(): mutation → returns the OAuth URL to redirect to
 *   - useDisconnect(): mutation → revokes, then refetches the list
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  disconnectConnector,
  listConnectors,
  startConnect,
  type ConnectorInfo,
} from '../services/connectorsService';

const CONNECTORS_KEY = ['connectors'] as const;

export function useConnectors() {
  return useQuery<{ connectors: ConnectorInfo[] }>({
    queryKey: CONNECTORS_KEY,
    queryFn: listConnectors,
    // Connection state can change OUT OF BAND — e.g. the user connects Google
    // via the WhatsApp sign-in flow, not the web app. So don't trust a stale
    // cache: always refetch on mount and when the tab regains focus (the global
    // default disables focus refetch), so returning to the hub reflects it.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useStartConnect() {
  return useMutation({ mutationFn: (id: string) => startConnect(id) });
}

export function useDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disconnectConnector(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}
