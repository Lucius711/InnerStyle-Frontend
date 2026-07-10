// Maps stable backend message codes to friendly text. Falls back to the raw message.
const MAP = {
  "auth.invalidCredentials": "Incorrect username or password.",
  "auth.accountInactive": "This account is not active.",
  "user.usernameExists": "This username is already taken.",
  "username.required": "Please enter a username.",
  "username.invalidLength": "Username must be 3–50 characters.",
  "username.invalidFormat": "Use only letters, numbers, dot or underscore.",
  "password.required": "Please enter a password.",
  "password.invalidLength": "Password must be 6–100 characters.",
  "fullName.invalidLength": "Full name must be 2–255 characters.",
  "auth.emailNotVerified": "Please verify your email before signing in.",
  "auth.accountLocked": "Too many attempts. Your account is temporarily locked.",
  "auth.accountDisabled": "This account has been suspended.",
  "auth.emailExists": "An account with this email already exists.",
  "auth.verification.invalid": "That code is incorrect. Please check and try again.",
  "auth.verification.expired": "This code has expired. Request a new one.",
  "auth.verification.tooManyAttempts": "Too many incorrect attempts. Request a new code.",
  "auth.verification.alreadyVerified": "This email is already verified. You can sign in.",
  "auth.email.sendFailed": "We couldn't send the email right now. Please try again shortly.",
  "auth.reset.invalid": "This reset link is invalid or has expired.",
  "auth.refresh.invalid": "Your session has expired. Please sign in again.",
  "auth.unauthorized": "Please sign in to continue.",
  "auth.forbidden": "You don't have permission to do that.",
  "wallet.insufficientFunds": "Not enough balance. Please top up your wallet.",
  "wallet.amount.invalid": "Please enter a valid amount.",
  "rateLimit.exceeded": "Too many requests. Please slow down and try again shortly.",
  "validation.email.invalid": "Please enter a valid email address.",
  "validation.password.length": "Password must be 8–72 characters.",
  "common.serverError": "Something went wrong. Please try again.",
};

export function friendly(err) {
  const code = err && (err.message || "");
  if (code && MAP[code]) return MAP[code];
  // Field validation envelope: surface the first field message if present.
  if (err && err.fields && typeof err.fields === "object") {
    const first = Object.values(err.fields)[0];
    if (first && MAP[first]) return MAP[first];
    if (first) return String(first);
  }
  return code || "Unexpected error.";
}
