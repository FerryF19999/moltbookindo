import 'express-session';

declare module 'express-session' {
  interface SessionData {
    ownerId?: string;
    claimToken?: string;
    oauthState?: string;
    oauthProvider?: 'x' | 'threads';
    oauthClaimToken?: string;
    oauthCodeVerifier?: string;
    xAccessToken?: string;
    threadsAccessToken?: string;
  }
}
