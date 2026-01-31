import NavbarCoCris from "@/components/institutional/NavbarCoCris";
import HeroCoCris from "@/components/institutional/HeroCoCris";
import MissionVision from "@/components/institutional/MissionVision";
import SchoolUnits from "@/components/institutional/SchoolUnits";
import FooterCoCris from "@/components/institutional/FooterCoCris";

export default function HomeCoCris() {
  return (
    <div className="min-h-screen bg-white font-sans text-foreground antialiased">
      <NavbarCoCris />
      <main>
        <HeroCoCris />
        <div id="sobre">
          <MissionVision />
        </div>
        <SchoolUnits />
        {/* Placeholder para seções futuras */}
        <section id="transparencia" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transparência
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seção de transparência, balanços e documentos oficiais será implementada aqui.
            </p>
          </div>
        </section>
        <section id="contato" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Entre em Contato
              </h2>
              <p className="text-gray-600 mb-8">
                Estamos prontos para atender você. Entre em contato conosco por telefone, 
                e-mail ou visite uma de nossas unidades.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <a href="mailto:contato@cocris.org">
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">E-mail</h3>
                    <p className="text-blue-600 font-semibold">contato@cocris.org</p>
                  </div>
                </a>
                <a href="tel:+556135754125">
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Telefone</h3>
                    <p className="text-blue-600 font-semibold">(61) 3575-4125 / 3575-4119</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterCoCris />
    </div>
  );
}
