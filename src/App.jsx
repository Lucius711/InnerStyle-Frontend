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
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffRoute from "@/components/auth/StaffRoute";
import Button from "@/components/ui/Button";
import Landing from "@/pages/Landing";
import ProfileLayout from "@/components/layout/ProfileLayout";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Heavy / authenticated routes are code-split so the marketing Landing page doesn't ship
// three.js, recharts, the studio forms, etc. in the initial bundle.
const Studio = lazy(() => import("@/pages/Studio"));
const CreativeLab = lazy(() => import("@/pages/CreativeLab"));
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));
const MyModels = lazy(() => import("@/pages/MyModels"));
const PrintOrders = lazy(() => import("@/pages/PrintOrders"));
const Membership = lazy(() => import("@/pages/Membership"));
const PaymentReturn = lazy(() => import("@/pages/PaymentReturn"));
const ArView = lazy(() => import("@/pages/ArView"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
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
          element={
            <PageTransition>
              <ProtectedRoute customerOnly>
                <CreativeLab />
              </ProtectedRoute>
            </PageTransition>
          }
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

        {/* Legacy routes now live inside the profile */}
        <Route path="/gallery" element={<Navigate to="/my-3d-printing" replace />} />
        <Route path="/print-orders" element={<Navigate to="/print-history" replace />} />

        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        {/* Email/password auth removed — sign-in is social-only. Redirect legacy routes. */}
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<Navigate to="/login" replace />} />
        {/* Standalone, chrome-free AR launcher (opened from the QR on a phone) */}
        <Route path="/ar/:taskId" element={<ErrorBoundary><ArView /></ErrorBoundary>} />
        <Route path="/wallet/vnpay-return" element={<PageTransition><PaymentReturn /></PageTransition>} />
        <Route path="/wallet/momo-return" element={<PageTransition><PaymentReturn /></PageTransition>} />
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
  return (
    <>
      {!bare && <AnimatedBackground />}
      <ScrollToTop />
      {!bare && <Navbar />}
      <AnimatedRoutes />
      {!bare && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SplashScreen />
      <I18nProvider>
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
