import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, CreditCard, Sparkles, Users } from 'lucide-react';
import bannerRevenda from '@/assets/banner-revenda.png';

const RevendaPage = () => (
  <div className="min-h-screen bg-background">
    <Header />

    {/* Hero */}
    <section className="bg-cream py-16">
      <div className="container text-center">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
          Seja uma <span className="gold-text">Revendedora</span>
        </h1>
        <div className="w-16 h-0.5 gold-gradient mx-auto mt-4 mb-6"></div>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Revenda moda feminina de qualidade com preços exclusivos de atacado. Comece seu próprio negócio com a Autentica Fashionf.
        </p>
      </div>
    </section>

    <div className="container py-16">
      {/* Banner */}
      <div className="max-w-lg mx-auto mb-16">
        <img src={bannerRevenda} alt="Seja Revendedora" className="w-full h-auto rounded-sm" loading="lazy" />
      </div>

      {/* Benefits */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Vantagens de <span className="gold-text">Revender</span>
        </h2>
        <div className="w-12 h-0.5 gold-gradient mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Package, title: 'Produtos Premium', desc: 'Calçados femininos de alta qualidade com design sofisticado e acabamento impecável.' },
          { icon: CreditCard, title: 'Até 6x Sem Juros', desc: 'Parcele suas compras em até 6 vezes sem juros. Facilidade para começar seu estoque.' },
          { icon: Truck, title: 'Envio Nacional', desc: 'Enviamos para todo o Brasil por Correios, excursões ou transportadoras.' },
          { icon: Sparkles, title: 'Lançamentos Semanais', desc: 'Novidades toda semana para manter sua loja sempre atualizada com as tendências.' },
          { icon: Users, title: 'Suporte Dedicado', desc: 'Atendimento personalizado via WhatsApp para tirar dúvidas e ajudar nas vendas.' },
          { icon: CheckCircle2, title: 'Preço de Atacado', desc: 'Compre 10 pares por um preço especial de revenda. Margens de lucro atrativas.' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-sm p-6 text-center hover:border-primary hover:gold-shadow transition-all duration-300">
            <item.icon className="text-primary mx-auto mb-4" size={32} />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Como <span className="gold-text">Funciona</span>
        </h2>
        <div className="w-12 h-0.5 gold-gradient mx-auto mt-4"></div>
      </div>

      <div className="max-w-2xl mx-auto mb-16">
        {[
          { step: '1', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente no site para ter acesso aos preços exclusivos.' },
          { step: '2', title: 'Escolha seus produtos', desc: 'Navegue pelo catálogo e selecione os calçados que deseja revender.' },
          { step: '3', title: 'Escolha o modo Revenda', desc: 'Selecione o preço de revenda (10 pares) e distribua os tamanhos.' },
          { step: '4', title: 'Receba e revenda', desc: 'Receba seus produtos e comece a lucrar revendendo moda feminina de qualidade.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 mb-6">
            <div className="w-10 h-10 shrink-0 gold-gradient rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {item.step}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-cream border border-border rounded-sm p-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Pronta para começar?</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Crie sua conta agora e tenha acesso imediato aos preços de atacado. É grátis!
        </p>
        <Link to="/cadastro" className="inline-block gold-gradient text-primary-foreground px-10 py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity">
          CRIAR CONTA GRÁTIS
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default RevendaPage;
