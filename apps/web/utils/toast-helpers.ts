export interface ToastLike {
  warning: (title: string, message?: string, duration?: number) => void;
}

const UNVERIFIED_TITLE = "Unverified Account";
const UNVERIFIED_MESSAGE =
  "This is an unverified account. Make sure to only trust verified profiles, never share personal information, and be cautious of impersonators.";

export function showUnverifiedAccountWarning(
  toast: ToastLike,
  isVerified: boolean,
  duration: number = 7000
): void {
  if (!isVerified) {
    toast.warning(UNVERIFIED_TITLE, UNVERIFIED_MESSAGE, duration);
  }
}



