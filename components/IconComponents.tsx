import React from 'react';

export const LungsIcon = () => (
  <i className="fa-solid fa-lungs text-3xl text-sky-500 breathing-animation"></i>
);

export const BrainIcon = () => (
    <i className="fa-solid fa-brain text-3xl text-pink-500"></i>
);

export const DumbbellIcon = () => (
    <i className="fa-solid fa-dumbbell text-3xl text-orange-500"></i>
);

export const PillsIcon = () => (
    <i className="fa-solid fa-pills text-3xl text-purple-500"></i>
);

export const SpaIcon = () => (
    <i className="fa-solid fa-spa text-3xl text-teal-500"></i>
);

export const HomeIcon = () => <i className="fa-solid fa-house w-5 h-5 mr-3"></i>;
export const BookOpenIcon = () => <i className="fa-solid fa-book-open w-5 h-5 mr-3"></i>;
export const QuestionMarkCircleIcon = () => <i className="fa-solid fa-circle-question w-5 h-5 mr-3"></i>;
export const VideoIcon = () => <i className="fa-solid fa-video w-5 h-5 mr-3"></i>;
export const ChevronUpIcon = () => <i className="fa-solid fa-chevron-up"></i>;
export const CheckCircleIcon = ({className = ''}) => <i className={`fa-solid fa-circle-check ${className}`}></i>;
export const XCircleIcon = ({className = ''}) => <i className={`fa-solid fa-circle-xmark ${className}`}></i>;
export const LockIcon = () => <i className="fa-solid fa-lock text-slate-400 ml-2"></i>;
export const TrophyIcon = () => <i className="fa-solid fa-trophy text-5xl text-yellow-400"></i>;
export const ArrowPathIcon = () => <i className="fa-solid fa-arrow-rotate-right"></i>;
export const PowerIcon = () => <i className="fa-solid fa-power-off"></i>;
export const UserShieldIcon = ({ className = '' }: { className?: string }) => <i className={`fa-solid fa-user-shield ${className}`}></i>;
export const YouTubeIcon = ({ className = '' }: { className?: string }) => <i className={`fa-brands fa-youtube ${className}`}></i>;
