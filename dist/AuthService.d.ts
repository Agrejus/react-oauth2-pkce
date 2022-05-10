import { PKCECodePair } from './pkce';
export interface AuthServiceProps {
    clientId: string;
    clientSecret?: string;
    contentType?: string;
    location: Location;
    provider: string;
    authorizeEndpoint?: string;
    tokenEndpoint?: string;
    logoutEndpoint?: string;
    audience?: string;
    redirectUri?: string;
    scopes: string[];
    autoRefresh?: boolean;
    refreshSlack?: number;
    onRedirectCallback?: (state?: string | null) => void;
}
export interface AuthTokens {
    id_token: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
}
export interface JWTIDToken {
    given_name: string;
    family_name: string;
    name: string;
    email: string;
}
export interface TokenRequestBody {
    clientId: string;
    grantType: string;
    redirectUri?: string;
    refresh_token?: string;
    clientSecret?: string;
    code?: string;
    codeVerifier?: string;
}
export interface AuthOptions {
    state?: string;
}
export declare class AuthService<TIDToken = JWTIDToken> {
    props: AuthServiceProps;
    timeout?: number;
    constructor(props: AuthServiceProps);
    private tryInvokeRedirectCallback;
    getUser(): {};
    getCodeFromLocation(location: Location): string | null;
    getValueFromLocation(location: Location, name: string): string | null;
    removeCodeFromLocation(): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    getPkce(): PKCECodePair;
    setAuthTokens(auth: AuthTokens): void;
    getAuthTokens(): AuthTokens;
    isPending(): boolean;
    isAuthenticated(): boolean;
    logout(shouldEndSession?: boolean): Promise<boolean>;
    login(options?: AuthOptions): Promise<void>;
    authorize(options?: AuthOptions): boolean;
    fetchToken(code: string, isRefresh?: boolean): Promise<AuthTokens>;
    armRefreshTimer(refreshToken: string, timeoutDuration: number): void;
    startTimer(): void;
    restoreUri(): void;
}
