import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const Footer = () => (
  <footer className="bg-cream border-t border-border mt-16">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-semibold gold-text mb-4">AUTENTICA</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Moda feminina atacadista com elegância e sofisticação. Qualidade premium para revenda.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="https://www.instagram.com/autentica_fashionof?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
            <a href="http://facebook.com/people/Stephanie-Allany/pfbid02vWcjNfLLbP7whAhVpSxQVjPshPRT9wZH8E8DWFZLjGeTCt5fwu348AjVBK4UwqZQl/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-medium text-foreground mb-4">Navegação</h4>
          <div className="space-y-2">
            <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Início</Link>
            <Link to="/produtos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Produtos</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-medium text-foreground mb-4">Conta</h4>
          <div className="space-y-2">
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Login</Link>
            <Link to="/cadastro" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Cadastro</Link>
            <Link to="/painel" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Minha Conta</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-medium text-foreground mb-4">Contato</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="https://wa.me/5583996189688" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">(83) 99618-9688</a>
            <p>João Pessoa - PB</p>
            <p>Seg - Sáb: 8h às 22h</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 Autentica Fashionf. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
