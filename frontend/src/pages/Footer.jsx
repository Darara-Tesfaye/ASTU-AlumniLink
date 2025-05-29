import { Link } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
];

const teamMembers = [
  {
    name: "Darara Tesfaye",
    link: "https://www.linkedin.com/in/darara-tesfaye-41a2b32a6",
    icon: faLinkedin,
  },
  {
    name: "Nugusa Wakwaya",
    link: "https://github.com/NugusaWakwaya",
    icon: faGithub,
  },
  {
    name: "Milkessa Kasaye",
    link: "https://github.com/milkessa64",
    icon: faGithub,
  },
  {
    name: "Roba Chimdessa",
    link: "https://github.com/RobaChimdesa",
    icon: faGithub,
  },
  {
    name: "Bontu Dereje",
    link: "https://github.com/induto",
    icon: faGithub,
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.href} className="hover:text-blue-400 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="#" className="hover:text-blue-400 transition">
                  Project Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Team</h3>
            <ul className="space-y-3">
              {teamMembers.map((member, index) => (
                <li key={index} className="flex items-center">
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={member.icon} className="mr-2" />
                    {member.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="mb-2">Have questions about our project? Reach out!</p>
            <p className="mb-4">
              <Link
                to="/#contact"
                className="hover:text-blue-400 transition flex items-center"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                team2025project@example.com
              </Link>
            </p>
            <p>Follow our project updates on social media:</p>
            <div className="flex space-x-4 mt-2">
              <a
                href="https://github.com/Darara-Tesfaye/ASTU-AlumniLink"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                <FontAwesomeIcon icon={faGithub} className="text-xl" />
              </a>
              <a
                href="https://www.linkedin.com/in/darara-tesfaye-41a2b32a6"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                <FontAwesomeIcon icon={faLinkedin} className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p>© 2025 ASTU AlumniLink Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
