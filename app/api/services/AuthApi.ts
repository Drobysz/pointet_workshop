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
        // Verification creates the session cookies returned by the API. Use
        // the credentialed client so a storefront running on another origin
        // (for example localhost:3000 vs localhost:8080) keeps that session.
        return this.apiPrivate.post<SessionResponse>(
            "/account/verify",
            data,
        )
    }

    public login (
        data: LoginRequest,
    ): Promise<SessionResponse> {
        return this.apiPrivate.post<SessionResponse>(
            "/auth/login",
            data,
            false
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
