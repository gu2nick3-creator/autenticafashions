import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { categoryService } from '@/services/categories';
import { Category } from '@/types';

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top bar */}
      <div className="bg-cream border-b border-border">
        <div className="container flex items-center justify-between py-2 text-xs font-body tracking-wide text-muted-foreground">
          <span>Atacado feminino elegante • Envio para todo Brasil</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
            <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between py-4">
        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex flex-col items-center">
          <span className="font-display text-2xl md:text-3xl font-semibold gold-text tracking-wider">AUTENTICA</span>
          <span className="font-display text-xs md:text-sm tracking-[0.3em] text-muted-foreground">FASHIONF</span>
        </Link>

        {/* Search - desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar na loja..."
              className="w-full border border-border rounded-sm py-2 px-4 pr-10 text-sm font-body bg-background focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden text-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="hidden md:flex items-center gap-1 text-sm text-primary hover:text-gold-dark transition-colors">
                  <Settings size={18} />
                </Link>
              )}
              <Link to={isAdmin ? "/admin" : "/painel"} className="text-foreground hover:text-primary transition-colors">
                <User size={20} />
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-foreground hover:text-primary transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-foreground hover:text-primary transition-colors">
              <User size={20} />
            </Link>
          )}

          <Link to="/carrinho" className="relative text-foreground hover:text-primary transition-colors">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 gold-gradient text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="Buscar na loja..."
            className="w-full border border-border rounded-sm py-2 px-4 text-sm font-body bg-background focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="hidden md:block border-t border-border">
        <div className="container flex items-center gap-6 py-3">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors tracking-wide">INÍCIO</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/categoria/${cat.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors tracking-wide">
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-in">
          <div className="py-4 px-4 space-y-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground hover:text-primary py-2">INÍCIO</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/categoria/${cat.id}`} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground hover:text-primary py-2">
                {cat.name.toUpperCase()}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-primary py-2">ENTRAR</Link>
                <Link to="/cadastro" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-primary py-2">CADASTRAR</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-primary py-2">PAINEL ADMIN</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
