import React from 'react';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
  FaTelegramPlane,
} from 'react-icons/fa';

/**
 * Simple, responsive Footer React component
 * - Uses TailwindCSS for styling
 * - Accessible: aria-labels, rel="noopener noreferrer" on external links
 * - Customize via props or use defaults
 *
 * Usage:
 * import Footer from './FooterReactComponent';
 * <Footer
 *   companyName="NOOTAAYO BOQOLE"
 *   legalLinks={{ legal: '/legal', privacy: '/privacy-policy' }}
 *   socialLinks={{ facebook: '#', twitter: '#', instagram: '#', linkedin: '#', youtube: '#', whatsapp: 'https://wa.me/+' }}
 * />
 */

const IconLink = ({ href, label, children }) => (
  <a
    href={href || '#'}
    aria-label={label}
    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-700"
    target={href && href.startsWith('http') ? '_blank' : undefined}
    rel={href && href.startsWith('http') ? 'noopener noreferrer' : undefined}
  >
    {children}
  </a>
);

export default function Footer({
  companyName = 'SUUQA IIBKA SAAMIGA',
  legalLinks = { legal: '#', privacy: '#' },
  socialLinks = {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#',
    youtube: '#',
    whatsapp: '#',
    telegram: '#',
  },
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-blue-600 shadow-lg text-white ">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-semibold text-white">{companyName}</div>
          <nav className="flex items-center space-x-3 text-sm">
            <a href={legalLinks.legal} className="text-white hover:text-gray-800" aria-label="Legal">
              Legal
            </a>
            <span className="text-white">•</span>
            <a href={legalLinks.privacy} className="text-white hover:text-gray-800" aria-label="Privacy Policy">
              Privacy Policy
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="sr-only">Follow us on social media</div>
          <IconLink href={socialLinks.facebook} label="Facebook">
            <FaFacebookF />
          </IconLink>
          <IconLink href={socialLinks.twitter} label="Twitter / X">
            <FaTwitter />
          </IconLink>
          <IconLink href={socialLinks.instagram} label="Instagram">
            <FaInstagram />
          </IconLink>
          <IconLink href={socialLinks.linkedin} label="LinkedIn">
            <FaLinkedinIn />
          </IconLink>
          <IconLink href={socialLinks.youtube} label="YouTube">
            <FaYoutube />
          </IconLink>
          <IconLink href={socialLinks.whatsapp} label="WhatsApp">
            <FaWhatsapp />
          </IconLink>
          <IconLink href={socialLinks.telegram} label="Telegram">
            <FaTelegramPlane />
          </IconLink>
        </div>

        <div className="w-full md:w-auto text-center md:text-right text-xs text-white-500">
          © {year} {companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
