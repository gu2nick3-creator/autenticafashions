import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sobre = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex-1">
      <div className="bg-primary py-12">
        <div className="container-shop text-center">
          <h1 className="font-heading font-black text-3xl text-primary-foreground uppercase tracking-wider">Sobre Nós</h1>
        </div>
      </div>
      <div className="container-shop py-12 max-w-3xl">
        <h2 className="font-heading font-bold text-xl mb-4">AUTENTICA FASHIONF</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A AUTENTICA FASHIONF é uma empresa especializada no atacado de calçados e acessórios femininos. Trabalhamos com as melhores marcas e tendências do mercado, oferecendo produtos de alta qualidade com preços competitivos para lojistas e revendedores de todo o Brasil.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nossa missão é proporcionar aos nossos clientes uma experiência de compra completa, com variedade, qualidade e os melhores preços do mercado atacadista. Contamos com um catálogo diversificado que inclui sandálias, scarpins, botas, tênis, bolsas, chinelos e muito mais.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A AUTENTICA FASHIONF atende clientes e revendedores com foco em variedade, qualidade e praticidade, oferecendo uma experiência de compra simples e direta para quem busca abastecer seu negócio com segurança.
        </p>
        <h3 className="font-heading font-bold text-lg mb-3 mt-8">Por que comprar conosco?</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Preços exclusivos para revenda</li>
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Produtos de alta qualidade</li>
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Variedade de modelos e tamanhos</li>
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Lançamentos semanais</li>
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Atendimento especializado</li>
          <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span> Envio para todo o Brasil</li>
        </ul>
      </div>
    </div>
    <Footer />
  </div>
);

export default Sobre;
