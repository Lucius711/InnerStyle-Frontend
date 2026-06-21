import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
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
import Button from "@/components/ui/Button";
import Landing from "@/pages/Landing";
import Studio from "@/pages/Studio";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Membership from "@/pages/Membership";
import PrintOrders from "@/pages/PrintOrders";
import PaymentReturn from "@/pages/PaymentReturn";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
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
              <ProtectedRoute>
                <Studio />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/membership"
          element={
            <PageTransition>
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/print-orders"
          element={
            <PageTransition>
              <ProtectedRoute>
                <PrintOrders />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/gallery"
          element={
            <PageTransition>
              <Gallery />
            </PageTransition>
          }
        />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route
          path="/forgot-password"
          element={<PageTransition><ForgotPassword /></PageTransition>}
        />
        <Route
          path="/reset-password"
          element={<PageTransition><ResetPassword /></PageTransition>}
        />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
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

export default function App() {
  return (
    <ThemeProvider>
      <SplashScreen />
      <I18nProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <ConfirmProvider>
                <AnimatedBackground />
                <ScrollToTop />
                <Navbar />
                <AnimatedRoutes />
                <Footer />
              </ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
