import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminPostEditor = lazy(() => import("./pages/AdminPostEditor"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminContentEditor = lazy(() => import("./pages/AdminContentEditor"));
const AdminEbooks = lazy(() => import("./pages/AdminEbooks"));
const AdminEbookEditor = lazy(() => import("./pages/AdminEbookEditor"));
const AdminEbookLeads = lazy(() => import("./pages/AdminEbookLeads"));
const Ebooks = lazy(() => import("./pages/Ebooks"));
const EbookLanding = lazy(() => import("./pages/EbookLanding"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/posts/:id" element={<AdminPostEditor />} />
                  <Route path="/admin/content" element={<AdminContent />} />
                  <Route path="/admin/content/:section" element={<AdminContentEditor />} />
                  <Route path="/admin/ebooks" element={<AdminEbooks />} />
                  <Route path="/admin/ebooks/:id" element={<AdminEbookEditor />} />
                  <Route path="/admin/ebooks/:id/leads" element={<AdminEbookLeads />} />
                  <Route path="/ebooks" element={<Ebooks />} />
                  <Route path="/ebooks/:slug" element={<EbookLanding />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
