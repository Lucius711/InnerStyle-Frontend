import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/motion/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";
import { ToastProvider } from "@/hooks/useToast";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider, useT } from "@/hooks/useI18n";
import Button from "@/components/ui/Button";
import Landing from "@/pages/Landing";
import Studio from "@/pages/Studio";
import Gallery from "@/pages/Gallery";

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
    <AnimatePresence mode="wait">
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
              <Studio />
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
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
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
      <I18nProvider>
        <BrowserRouter>
          <ToastProvider>
            <AnimatedBackground />
            <ScrollToTop />
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </ToastProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
