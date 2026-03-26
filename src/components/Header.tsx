import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Phone, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const { isLoggedIn, user } = useAuth();
  const { cartCount, wishlist } = useCart();
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/produtos?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="w-full sticky top-0 z-50">
      <div className="bg-topbar text-topbar-foreground">
        <div className="container-shop flex items-center justify-between py-1.5 text-xs gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Phone className="w-3 h-3" />
            <span>+55 83 99961-8968</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">WhatsApp: +55 83 99961-8968</span>
          </div>
          <div className="hidden sm:block">
            <span>Compre no atacado com os melhores preços!</span>
          </div>
        </div>
      </div>

      <div className="bg-shop-header border-b border-border">
        <div className="container-shop flex items-center justify-between py-3 gap-4">
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex-shrink-0">
            <h1 className="font-heading font-black text-lg sm:text-2xl tracking-tight text-foreground">
              AUTENTICA <span className="text-accent">FASHIONF</span>
            </h1>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="flex w-full border border-border rounded overflow-hidden">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-background text-foreground outline-none"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 hover:opacity-90 transition">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={isLoggedIn ? "/minha-conta" : "/login"} className="flex flex-col items-center text-foreground hover:text-accent transition" title="Minha Conta">
              <User className="w-5 h-5" />
              <span className="text-[10px] hidden sm:block">{isLoggedIn ? user?.name : "Entrar"}</span>
            </Link>
            <Link to="/favoritos" className="flex flex-col items-center text-foreground hover:text-accent transition relative" title="Favoritos">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] hidden sm:block">Favoritos</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/carrinho" className="flex flex-col items-center text-foreground hover:text-accent transition relative" title="Carrinho">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] hidden sm:block">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="hidden lg:block bg-background border-t border-border">
          <div className="container-shop flex items-center justify-center gap-8 py-3 text-sm font-heading font-semibold uppercase tracking-wide">
            <Link to="/" className="hover:text-accent transition">Início</Link>
            <Link to="/sobre" className="hover:text-accent transition">Sobre</Link>
            <Link to="/produtos" className="hover:text-accent transition">Produtos</Link>
            <Link to="/contato" className="hover:text-accent transition">Fale Conosco</Link>
          </div>
        </nav>

        {mobileMenu && (
          <div className="lg:hidden bg-background border-t border-border">
            <div className="container-shop py-4 flex flex-col gap-4 text-sm font-heading font-semibold uppercase tracking-wide">
              <form onSubmit={handleSearch} className="flex">
                <div className="flex w-full border border-border rounded overflow-hidden">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm bg-background text-foreground outline-none"
                  />
                  <button type="submit" className="bg-primary text-primary-foreground px-4 hover:opacity-90 transition">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-accent transition">Início</Link>
              <Link to="/sobre" onClick={() => setMobileMenu(false)} className="hover:text-accent transition">Sobre</Link>
              <Link to="/produtos" onClick={() => setMobileMenu(false)} className="hover:text-accent transition">Produtos</Link>
              <Link to="/contato" onClick={() => setMobileMenu(false)} className="hover:text-accent transition">Fale Conosco</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
