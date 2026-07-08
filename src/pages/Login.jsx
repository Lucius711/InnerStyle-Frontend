import { useNavigate, useLocation } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import { isStaff } from "@/components/auth/StaffRoute";

/**
 * Sign-in is social-only (Google / Facebook). Accounts are created/linked on first social login;
 * there is no email + password flow.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || "/studio";

  const handleSuccess = (account) => {
    // Staff land on their fulfilment dashboard; everyone else on their intended page.
    navigate(isStaff(account) ? "/staff" : from, { replace: true });
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Continue with Google or Facebook to access your studio, wallet and 3D library."
    >
      <SocialButtons onSuccess={handleSuccess} />
    </AuthShell>
  );
}
