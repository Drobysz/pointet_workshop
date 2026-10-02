import { PrivateApiClient } from "@/api/core/PrivateApiClient";
import { UserResponse, UserUpdateRequest } from "../types/user";
import { Id } from "../types/api";

export class UserApi {
    constructor (
        private readonly api: PrivateApiClient,
    ) {}

    public getUser (): Promise<
        UserResponse
    > {
        return this.api.get<UserResponse>(
            "/auth/me"
        );
    }

    public updateUser(
        userId: Id,
        updateUserData: UserUpdateRequest
    ): Promise<UserResponse> {
        return this.api.patch<UserResponse>(
            `/users/${userId}`,
            updateUserData,
        );
    }

    public deleteUser(userId: Id): Promise<void> {
        return this.api.delete<void>(
            `/users/${userId}`,
        );
    }
}
