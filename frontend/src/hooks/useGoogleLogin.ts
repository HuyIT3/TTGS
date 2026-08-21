/**
 * useGoogleLogin — wraps Google Identity Services (GIS) One-Tap / popup flow.
 *
 * Usage:
 *   const { signInWithGoogle, loading, error } = useGoogleLogin({ onSuccess, onError });
 *
 * Requires:
 *   - <script src="https://accounts.google.com/gsi/client" async defer> in index.html
 *   - VITE_GOOGLE_CLIENT_ID in .env (frontend)
 */

import { useState, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

interface UseGoogleLoginOptions {
  onSuccess: (idToken: string) => void;
  onError?: (error: string) => void;
}

export const useGoogleLogin = ({ onSuccess, onError }: UseGoogleLoginOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const signInWithGoogle = useCallback(() => {
    setError(null);

    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      const err = 'Google Client ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.';
      setError(err);
      onError?.(err);
      return;
    }

    if (!window.google?.accounts?.id) {
      const err = 'Google SDK chưa được tải. Vui lòng thử lại sau.';
      setError(err);
      onError?.(err);
      return;
    }

    setLoading(true);

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          setLoading(false);
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            const err = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
            setError(err);
            onError?.(err);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
          // Fallback: trigger the standard OAuth popup flow
          const popup = window.open(
            `https://accounts.google.com/o/oauth2/v2/auth?` +
              `client_id=${encodeURIComponent(clientId)}&` +
              `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
              `response_type=token&` +
              `scope=email%20profile`,
            'google-oauth',
            'width=480,height=600,scrollbars=yes,resizable=yes'
          );

          if (!popup) {
            const err = 'Popup bị chặn. Vui lòng cho phép popup trong trình duyệt.';
            setError(err);
            onError?.(err);
          }
        }
      });
    } catch (e: any) {
      setLoading(false);
      const err = 'Lỗi khởi tạo Google OAuth: ' + (e?.message || e);
      setError(err);
      onError?.(err);
    }
  }, [clientId, onSuccess, onError]);

  return { signInWithGoogle, loading, error };
};
