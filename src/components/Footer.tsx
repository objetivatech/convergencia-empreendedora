import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/cae4c859-e76c-4a0a-ae39-475f08b8afec.png" 
                alt="Mulheres em Convergência" 
                className="h-16"
              />
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              Uma plataforma dedicada ao empoderamento feminino, oferecendo recursos, 
              comunidade e oportunidades para mulheres empreendedoras e profissionais.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/projetos" className="hover:text-white transition-colors">
                  Projetos
                </Link>
              </li>
              <li>
                <Link to="/loja" className="hover:text-white transition-colors">
                  Loja
                </Link>
              </li>
              <li>
                <Link to="/diretorios" className="hover:text-white transition-colors">
                  Diretórios
                </Link>
              </li>
              <li>
                <Link to="/comunidade" className="hover:text-white transition-colors">
                  Comunidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contato@mulheresemconvergencia.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+55 (11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
          <p>&copy; 2024 Mulheres em Convergência. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;