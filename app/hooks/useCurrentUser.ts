import { userApi } from '@/api/api';
import useSWR from 'swr';

export const useCurrentUser = () => {
    const getUserProfile = async ()=> {
        const { data: userProfile } = (await userApi.getUser());

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
