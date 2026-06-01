import { useQuery } from '@tanstack/react-query';
import { getUserRole, getUserProfile } from '../api/graph';
import type { GraphUserProfile } from '../types';
import useTokenSession from './useTokenSession';

const GRAPH_QUERY_KEY = 'graph';

export const useGraphUserProfile = () => {
  const { accessToken } = useTokenSession();

  return useQuery<GraphUserProfile, Error>({
    queryKey: [GRAPH_QUERY_KEY],
    queryFn: async (): Promise<GraphUserProfile> => {
      // The `enabled` guard below prevents this from running when token is
      // null, but we throw explicitly to satisfy TypeScript's type narrowing.
      if (accessToken === null) {
        throw new Error('No access token available');
      }
      return getUserProfile(accessToken);
    },
    enabled: accessToken !== null,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGraphUserRole = () => {
  const { accessToken } = useTokenSession();

  return useQuery<any, Error>({
    queryKey: [GRAPH_QUERY_KEY, 'group'],
    queryFn: async (): Promise<any> => {
      if (accessToken === null) {
        throw new Error('No access token available');
      }
      return getUserRole(accessToken);
    },
    enabled: accessToken !== null,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};