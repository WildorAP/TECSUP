import { Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded mt-auto">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">Acerca de</a>
        <a className="link link-hover">Contacto</a>
        <a className="link link-hover">Documentación</a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a className="cursor-pointer hover:text-primary transition-colors">
            <Github className="h-6 w-6" />
          </a>
          <a className="cursor-pointer hover:text-primary transition-colors">
            <Mail className="h-6 w-6" />
          </a>
        </div>
      </nav>
      <aside>
        <p className="flex items-center gap-2">
          Hecho con <Heart className="h-4 w-4 text-error fill-current" /> para ingeniería hidráulica
        </p>
        <p>Copyright © {currentYear} - Todos los derechos reservados</p>
      </aside>
    </footer>
  );
}
