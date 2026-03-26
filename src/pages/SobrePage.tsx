import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

const SobrePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
          Sobre a <span className="gold-text">Autentica Fashionf</span>
        </h1>
        <div className="w-16 h-0.5 gold-gradient mx-auto mt-4"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-card border border-border rounded-sm p-8">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Nossa História</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A Autentica Fashionf nasceu com o propósito de levar moda feminina de qualidade com preços acessíveis para revendedoras de todo o Brasil. Localizada em João Pessoa - PB, trabalhamos com as melhores tendências em calçados femininos.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nosso compromisso é oferecer produtos premium com atendimento personalizado, garantindo que cada revendedora tenha sucesso em seu negócio. Trabalhamos com rasteirinhas, sapatos, tênis e sandálias para todos os estilos e ocasiões.
          </p>
        </div>

        <div className="bg-card border border-border rounded-sm p-8">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Por que escolher a Autentica?</h2>
          <ul className="space-y-3">
            {[
              'Produtos de qualidade premium com design sofisticado',
              'Preços exclusivos para atacado e revenda',
              'Lançamentos semanais com as últimas tendências',
              'Parcelamento em até 6x sem juros',
              'Envio para todo o Brasil por Correios e transportadoras',
              'Atendimento personalizado via WhatsApp',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-primary mt-1">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-sm p-8">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Informações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Localização</p>
                <p className="text-sm text-muted-foreground">João Pessoa - PB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <a href="https://wa.me/5583996189688" className="text-sm text-muted-foreground hover:text-primary transition-colors">(83) 99618-9688</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Horário</p>
                <p className="text-sm text-muted-foreground">Seg - Sáb: 8h às 22h</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Redes Sociais</p>
                <div className="flex gap-3 mt-1">
                  <a href="https://www.instagram.com/autentica_fashionof" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Instagram</a>
                  <a href="http://facebook.com/people/Stephanie-Allany/pfbid02vWcjNfLLbP7whAhVpSxQVjPshPRT9wZH8E8DWFZLjGeTCt5fwu348AjVBK4UwqZQl/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Facebook</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default SobrePage;
