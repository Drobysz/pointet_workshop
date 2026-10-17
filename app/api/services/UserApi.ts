import { PrivateApiClient } from "@/api/core/PrivateApiClient";
import { EmailChangePendingResponse, EmailChangeRequest, EmailChangeVerificationRequest, EmailChangeVerificationResponse, PasswordChangeRequest, PasswordChangeResponse, UserResponse, UserUpdateRequest } from "../types/user";
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

    public updatePassword( 
        userId: Id,
        updatePasswordData: PasswordChangeRequest,
    ): Promise<PasswordChangeResponse> {
        return this.api.patch<PasswordChangeResponse>(
            `/users/${userId}/password`,
            updatePasswordData
        );
    }

    public updateEmail( 
        userId: Id,
        updateEmailData: EmailChangeRequest,
    ): Promise<EmailChangePendingResponse> {
        return this.api.patch<EmailChangePendingResponse>(
            `/users/${userId}/email`,
            updateEmailData
        );
    }

    public verifyEmailCode( 
        userId: Id,
        verifyEmailData: EmailChangeVerificationRequest,
    ): Promise<EmailChangeVerificationResponse> {
        return this.api.post<EmailChangeVerificationResponse>(
            `/users/${userId}/email/verify`,
            verifyEmailData
        );
    }
}
