import { authApi, userApi } from '@/api/api';
import useSWR from 'swr';

export const useCurrentUser = () => {
    const getUserProfile = async ()=> {
        const { data: userProfile } = (await userApi.getUser());

        if (!userProfile) {
            const { data: refreshResponse } = (await authApi.refresh());
            
            if (!refreshResponse.authenticated) {
                throw new Error("Session tokens are expired or not created");
            };

            const { data: userProfile } = (await userApi.getUser());

            if (!userProfile) {
                throw new Error("User profile fetching failed");
            };

            return userProfile;
        }

        return userProfile;
    };

    return useSWR(
        "current-user",
        getUserProfile,
        {
            refreshInterval: 10 * 60 * 1000,
            dedupingInterval: 10 * 60 * 1000,
            shouldRetryOnError: (error) => error?.status !== 401,
        }
    );
}
