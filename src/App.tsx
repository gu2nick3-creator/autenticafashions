import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Produtos from "./pages/Produtos";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Login from "./pages/Login";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Carrinho from "./pages/Carrinho";
import Favoritos from "./pages/Favoritos";
import Admin from "./pages/Admin";
import MinhaConta from "./pages/MinhaConta";
import NotFound from "./pages/NotFound";
import CheckoutRetorno from "./pages/CheckoutRetorno";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produto/:id" element={<ProdutoDetalhe />} />
              <Route path="/login" element={<Login />} />
              <Route path="/minha-conta" element={<MinhaConta />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout/retorno" element={<CheckoutRetorno />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
