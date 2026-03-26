import { Link } from "react-router-dom";
import { Phone, MapPin, Instagram, Facebook } from "lucide-react";

const Footer = () => (
  <footer className="bg-shop-footer text-shop-footer-fg">
    <div className="container-shop py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-heading font-black text-xl text-primary-foreground mb-4">
            AUTENTICA <span className="text-accent">FASHIONF</span>
          </h3>
          <p className="text-sm leading-relaxed opacity-80">
            Atacado de calçados e acessórios femininos. Produtos de qualidade com os melhores preços para revenda.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-bold text-sm text-primary-foreground mb-4 uppercase tracking-wider">Links Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-accent transition">Início</Link></li>
            <li><Link to="/sobre" className="hover:text-accent transition">Sobre</Link></li>
            <li><Link to="/produtos" className="hover:text-accent transition">Produtos</Link></li>
            <li><Link to="/contato" className="hover:text-accent transition">Fale Conosco</Link></li>
            <li><Link to="/login" className="hover:text-accent transition">Minha Conta</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-sm text-primary-foreground mb-4 uppercase tracking-wider">Institucional</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-accent transition cursor-pointer">Política de Trocas</span></li>
            <li><span className="hover:text-accent transition cursor-pointer">Termos de Uso</span></li>
            <li><span className="hover:text-accent transition cursor-pointer">Política de Privacidade</span></li>
            <li><span className="hover:text-accent transition cursor-pointer">Como Comprar</span></li>
            <li><span className="hover:text-accent transition cursor-pointer">Formas de Pagamento</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-sm text-primary-foreground mb-4 uppercase tracking-wider">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" />+55 83 99961-8968</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-accent mt-0.5" />João Pessoa - PB</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="https://www.instagram.com/autentica_fashionof?igsh=c2ZncWpsNnlxcGti" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/people/Stephanie-Allany/pfbid02vgmjfoc5QqhXyvMKvjQ36WF6kTrHk6WJ1XE7cjetgMJ1FbBETvfjB8p8QxJV6Jpnl/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-4">
      <div className="container-shop text-center text-xs opacity-60">
        © {new Date().getFullYear()} AUTENTICA FASHIONF. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
