import { useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import AnimatedBackground from "@/components/motion/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/layout/SplashScreen";
import PageTransition from "@/components/motion/PageTransition";
import { ToastProvider } from "@/hooks/useToast";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider, useT } from "@/hooks/useI18n";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffRoute from "@/components/auth/StaffRoute";
import PolicyGate from "@/components/auth/PolicyGate";
import Button from "@/components/ui/Button";
import Landing from "@/pages/Landing";
import ProfileLayout from "@/components/layout/ProfileLayout";
import Login from "@/pages/Login";
import OauthCallback from "@/pages/OauthCallback";
import Profile from "@/pages/Profile";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { heartbeat, trackVisit } from "@/lib/authApi";

// Heavy / authenticated routes are code-split so the marketing Landing page doesn't ship
// three.js, recharts, the studio forms, etc. in the initial bundle.
const Studio = lazy(() => import("@/pages/Studio"));
const CreativeLab = lazy(() => import("@/pages/CreativeLab"));
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));
const AdminTraffic = lazy(() => import("@/pages/AdminTraffic"));
const AdminRevenue = lazy(() => import("@/pages/AdminRevenue"));
const AdminModels = lazy(() => import("@/pages/AdminModels"));
const AdminPlans = lazy(() => import("@/pages/AdminPlans"));
const MyModels = lazy(() => import("@/pages/MyModels"));
const PrintOrders = lazy(() => import("@/pages/PrintOrders"));
const Membership = lazy(() => import("@/pages/Membership"));
const PaymentReturn = lazy(() => import("@/pages/PaymentReturn"));
const PaymentQr = lazy(() => import("@/pages/PaymentQr"));
const ArView = lazy(() => import("@/pages/ArView"));
const Support = lazy(() => import("@/pages/Support"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // "/#how" from another page (navbar/footer): land on the section, not the top.
    const el = hash && document.getElementById(hash.slice(1));
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, hash]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-brand-violet" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/studio"
          element={
            <PageTransition>
              <ProtectedRoute customerOnly>
                <Studio />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/membership"
          element={
            <PageTransition>
              <ProtectedRoute customerOnly>
                <Membership />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/lab"
          element={<Navigate to="/my-3d-printing" replace />}
        />
        <Route
          path="/lab/:taskId"
          element={
            <PageTransition>
              <ProtectedRoute customerOnly>
                <CreativeLab />
              </ProtectedRoute>
            </PageTransition>
          }
        />

        {/* Profile area — personal info, my 3D models, print history */}
        <Route
          element={
            <PageTransition>
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            </PageTransition>
          }
        >
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/my-3d-printing"
            element={
              <ProtectedRoute customerOnly>
                <MyModels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/print-history"
            element={
              <ProtectedRoute customerOnly>
                <PrintOrders />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Staff fulfilment dashboard (ROLE_STAFF only) */}
        <Route
          path="/staff"
          element={
            <PageTransition>
              <StaffRoute>
                <StaffDashboard />
              </StaffRoute>
            </PageTransition>
          }
        />

        {/* Admin traffic dashboard (ROLE_ADMIN only) */}
        <Route
          path="/admin"
          element={
            <PageTransition>
              <StaffRoute role="ADMIN">
                <AdminTraffic />
              </StaffRoute>
            </PageTransition>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <PageTransition>
              <StaffRoute role="ADMIN">
                <AdminRevenue />
              </StaffRoute>
            </PageTransition>
          }
        />
        <Route
          path="/admin/models"
          element={
            <PageTransition>
              <StaffRoute role="ADMIN">
                <AdminModels />
              </StaffRoute>
            </PageTransition>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <PageTransition>
              <StaffRoute role="ADMIN">
                <AdminPlans />
              </StaffRoute>
            </PageTransition>
          }
        />

        {/* Legacy routes now live inside the profile */}
        <Route path="/gallery" element={<Navigate to="/my-3d-printing" replace />} />
        <Route path="/print-orders" element={<Navigate to="/print-history" replace />} />

        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/oauth/callback" element={<OauthCallback />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        {/* No email flows (username + password auth). Redirect legacy routes. */}
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<Navigate to="/login" replace />} />
        {/* Standalone, chrome-free AR launcher (opened from the QR on a phone) */}
        <Route path="/ar/:taskId" element={<ErrorBoundary><ArView /></ErrorBoundary>} />
        <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
        <Route path="/wallet/payos-qr" element={<PageTransition><PaymentQr /></PageTransition>} />
        <Route path="/wallet/payos-return" element={<PageTransition><PaymentReturn /></PageTransition>} />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-7xl font-bold text-gradient">404</p>
      <p className="max-w-sm text-app-muted">{t("notFound.message")}</p>
      <Link to="/">
        <Button>{t("notFound.back")}</Button>
      </Link>
    </div>
  );
}

/* App chrome (background, navbar, footer): hidden on the standalone AR launcher route. */
function Shell() {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/ar/");
  const { user, loading } = useAuth();
  const userId = user?.id;
  useEffect(() => {
    // One visit per browser session *per identity*, so signing in re-logs the visit with the
    // user id. Storage can throw in private mode, so best-effort.
    if (loading) return;
    const key = `innerstyle.visited:${userId ?? "guest"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    trackVisit().catch(() => {});
  }, [loading, userId]);
  useEffect(() => {
    if (!userId) return;
    const ping = () => !document.hidden && heartbeat().catch(() => {});
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [userId]);
  return (
    <>
      {!bare && <AnimatedBackground />}
      <ScrollToTop />
      {!bare && <Navbar />}
      <AnimatedRoutes />
      {!bare && <Footer />}
      <PolicyGate />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        {/* Intro only on the home page; deep links (lab, studio, admin…) open straight away. */}
        {window.location.pathname === "/" && <SplashScreen />}
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <ConfirmProvider>
                <Shell />
              </ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
