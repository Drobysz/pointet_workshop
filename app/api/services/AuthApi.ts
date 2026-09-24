import { PrivateApiClient } from "../core/PrivateApiClient";
import { PublicApiClient } from "../core/PublicApiClient";
import {
    AuthenticatedResponse,
    LoggedOutResponse,
    LoginRequest,
    RegisterRequest,
    RegistrationPending,
    SessionResponse,
    VerifyRequest
} from "../types/auth";

export class AuthApi {
    constructor (
        private readonly apiPublic: PublicApiClient,
        private readonly apiPrivate: PrivateApiClient,
    ) {}

    public register (
        data: RegisterRequest
    ): Promise<RegistrationPending> {
        return this.apiPublic.post<RegistrationPending>(
            "/account/register",
            data,
        )
    }

    public verify (
        data: VerifyRequest,
    ): Promise<SessionResponse> {
        return this.apiPublic.post<SessionResponse>(
            "/account/verify",
            data,
        )
    }

    public login (
        data: LoginRequest,
    ): Promise<SessionResponse> {
        return this.apiPublic.post<SessionResponse>(
            "/auth/login",
            data,
        )
    }

    public refresh (): Promise<
        AuthenticatedResponse
    > {
        return this.apiPrivate.post<AuthenticatedResponse>(
            "/auth/refresh",
        )
    }

    public logout (): Promise<
        LoggedOutResponse
    > {
        return this.apiPrivate.post<LoggedOutResponse>(
            "/auth/logout",
        )
    }
}
