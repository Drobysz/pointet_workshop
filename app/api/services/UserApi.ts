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
        updateUserData: UserUpdateRequest
    ): Promise<UserResponse> {
        return this.api.patch<UserResponse>(
            "auth/me",
            updateUserData,
        );
    }

    public deleteUser(userId: Id) {
        return this.api.delete(
            `user/${userId}`,
        );
    }
}
