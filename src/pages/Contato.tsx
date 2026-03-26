import { Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const whatsappLink = "https://wa.me/5583999618968";
const instagramLink = "https://www.instagram.com/autentica_fashionof?igsh=c2ZncWpsNnlxcGti";
const facebookLink = "https://www.facebook.com/people/Stephanie-Allany/pfbid02vgmjfoc5QqhXyvMKvjQ36WF6kTrHk6WJ1XE7cjetgMJ1FbBETvfjB8p8QxJV6Jpnl/";

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="bg-primary py-12">
          <div className="container-shop text-center">
            <h1 className="font-heading font-black text-3xl text-primary-foreground uppercase tracking-wider">Fale Conosco</h1>
          </div>
        </div>
        <div className="container-shop py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading font-bold text-xl mb-6">Entre em contato</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Phone className="w-5 h-5 text-accent" /></div>
                  <div><p className="text-sm font-semibold">Telefone</p><p className="text-sm text-muted-foreground">+55 83 99961-8968</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-accent" /></div>
                  <div><p className="text-sm font-semibold">WhatsApp</p><p className="text-sm text-muted-foreground">+55 83 99961-8968</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-accent" /></div>
                  <div><p className="text-sm font-semibold">Endereço</p><p className="text-sm text-muted-foreground">João Pessoa - PB</p></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-shop-new text-accent-foreground font-heading font-bold text-sm px-6 py-3 rounded hover:opacity-90 transition uppercase">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border font-heading font-bold text-sm px-6 py-3 rounded hover:border-accent hover:text-accent transition uppercase">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border font-heading font-bold text-sm px-6 py-3 rounded hover:border-accent hover:text-accent transition uppercase">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-6 md:p-8 bg-card">
              <h3 className="font-heading font-black text-2xl uppercase tracking-wider mb-3">Atendimento rápido</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Fale com a AUTENTICA FASHIONF pelos canais oficiais para tirar dúvidas, solicitar informações e acompanhar novidades.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>• Atacado de calçados e acessórios femininos</p>
                <p>• Atendimento online para todo o Brasil</p>
                <p>• Base em João Pessoa - PB</p>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-heading font-bold text-sm py-3 rounded hover:opacity-90 transition uppercase tracking-wider">
                <MessageCircle className="w-4 h-4" /> Iniciar conversa no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contato;
