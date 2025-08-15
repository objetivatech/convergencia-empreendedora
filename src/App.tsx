import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Directory from "./pages/Directory";
import BusinessProfile from "./pages/BusinessProfile";
import BusinessDashboard from "./pages/BusinessDashboard";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import Dashboard from "./pages/Dashboard";
import PlanSelection from "./pages/PlanSelection";
import TransparentCheckoutPage from "./pages/TransparentCheckoutPage";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminBlog from "./pages/AdminBlog";
import AdminNewsletter from "./pages/AdminNewsletter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/projetos" element={<Projects />} />
            <Route path="/loja" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
            <Route path="/diretorio" element={<Directory />} />
            <Route path="/diretorio/:id" element={<BusinessProfile />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/planos" element={
              <ProtectedRoute>
                <PlanSelection />
              </ProtectedRoute>
            } />
            <Route path="/checkout/transparente/:planId" element={
              <ProtectedRoute>
                <TransparentCheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-negocio" element={
              <ProtectedRoute requiredRole="business_owner">
                <BusinessDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-embaixadora" element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorDashboard />
              </ProtectedRoute>
            } />
            {/* Legacy routes */}
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/blog" 
              element={
                <ProtectedRoute>
                  <AdminBlog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/newsletter" 
              element={
                <ProtectedRoute>
                  <AdminNewsletter />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
