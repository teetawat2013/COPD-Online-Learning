
import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from './IconComponents';

export const BackToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 p-3 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
        >
            <ChevronUpIcon />
        </button>
    );
};
