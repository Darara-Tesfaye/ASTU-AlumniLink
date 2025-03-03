import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; {new Date().getFullYear()} ASTU Alumni. All rights reserved.</p>
            <p>
                <a href="/contact" className="hover:underline">Contact Us</a> | 
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
            </p>
        </footer>
    );
};

export default Footer;