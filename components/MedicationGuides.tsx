import React, { useState, useEffect, useRef } from 'react';

const guideContainerClass = "bg-white rounded-xl p-4 md:p-6 shadow-sm text-center border border-slate-200 mt-4";
const stepTextClass = "text-lg md:text-xl font-bold text-slate-700 mb-4 min-h-[3.5rem] flex items-center justify-center";
const timerClass = "text-5xl md:text-6xl font-bold text-cyan-600 my-4 font-mono";
const buttonClass = "bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full shadow transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:transform-none disabled:cursor-not-allowed";
const iconContainerClass = "h-24 flex items-center justify-center mb-4 text-5xl text-cyan-500 transition-all duration-300";

interface GuideStep {
    text: string;
    duration: number;
    iconClass: string;
    animationClass?: string;
}

const MedicationGuideBase: React.FC<{
    title: string;
    icon: React.ReactNode;
    steps: GuideStep[];
    colorTheme: string;
}> = ({ title, icon, steps, colorTheme }) => {
    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<number | null>(null);

    const start = () => {
        setActive(true);
        setStepIndex(0);
        setTimeLeft(steps[0].duration);
    };

    const stop = () => {
        setActive(false);
        setStepIndex(0);
        setTimeLeft(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        if (active) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (stepIndex < steps.length - 1) {
                            setStepIndex(s => s + 1);
                            return steps[stepIndex + 1].duration;
                        } else {
                            stop();
                            return 0;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [active, stepIndex, steps]);

    const currentStep = steps[stepIndex];
    const isHoldBreath = currentStep?.text.includes("กลั้นหายใจ");
    const activeColor = colorTheme === 'orange' ? 'text-orange-500' : 'text-cyan-500';
    const buttonBg = colorTheme === 'orange' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-cyan-500 hover:bg-cyan-600';

    return (
        <div className={guideContainerClass}>
            {!active ? (
                <div className="py-4">
                    <div className={`text-6xl mb-4 ${activeColor}`}>{icon}</div>
                    <h4 className="text-lg font-bold text-slate-600 mb-4">ฝึกพร้อมกับตัวจับเวลา</h4>
                    <button onClick={start} className={`${buttonClass.replace('bg-cyan-500 hover:bg-cyan-600', buttonBg)}`}>
                        เริ่มสาธิต {title}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                     <div className={iconContainerClass}>
                        <i className={`${currentStep.iconClass} ${currentStep.animationClass || ''} ${isHoldBreath ? 'text-red-500' : activeColor}`}></i>
                     </div>
                     <div className={stepTextClass}>{currentStep.text}</div>
                     <div className={`${timerClass} ${isHoldBreath ? 'text-red-500' : 'text-slate-700'}`}>
                        {timeLeft}
                     </div>
                     <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-1000 ${colorTheme === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                        ></div>
                     </div>
                     <button onClick={stop} className="mt-2 text-sm text-slate-400 underline hover:text-slate-600">
                        หยุด / เริ่มต้นใหม่
                     </button>
                </div>
            )}
        </div>
    );
};

export const MDIGuide: React.FC = () => {
    const steps: GuideStep[] = [
        { text: "1. ถอดฝาครอบและ 'เขย่า' ขวดแนวตั้ง 5-10 ครั้ง", duration: 5, iconClass: "fa-solid fa-prescription-bottle", animationClass: "fa-shake" },
        { text: "2. หายใจออกทางปากให้สุด (หันหน้าหนี)", duration: 4, iconClass: "fa-solid fa-wind", animationClass: "fa-fade" },
        { text: "3. อมปากกระบอกยาให้สนิท", duration: 3, iconClass: "fa-solid fa-face-meh" },
        { text: "4. กด 1 ครั้ง พร้อมสูดหายใจเข้า 'ช้าและลึก'", duration: 5, iconClass: "fa-solid fa-lungs", animationClass: "breathing-animation" },
        { text: "5. กลั้นหายใจ (นับ 1-10)", duration: 10, iconClass: "fa-solid fa-hand", animationClass: "fa-beat" },
        { text: "6. ผ่อนลมหายใจออกทางจมูกช้าๆ", duration: 4, iconClass: "fa-solid fa-face-smile" }
    ];

    return <MedicationGuideBase title="MDI" icon={<i className="fa-solid fa-spray-can-sparkles"></i>} steps={steps} colorTheme="cyan" />;
};

export const DPIGuide: React.FC = () => {
    const steps: GuideStep[] = [
        { text: "1. เตรียมยา (หมุน/ดัน จนดัง 'คลิก')", duration: 5, iconClass: "fa-solid fa-rotate", animationClass: "fa-spin-pulse" },
        { text: "2. หายใจออกให้สุด (ห้ามเป่าเข้าเครื่อง)", duration: 4, iconClass: "fa-solid fa-wind" },
        { text: "3. อมปากกระบอกยาให้สนิท", duration: 3, iconClass: "fa-solid fa-face-meh" },
        { text: "4. สูดหายใจเข้าทางปาก 'เร็วและแรง'", duration: 3, iconClass: "fa-solid fa-bolt", animationClass: "fa-beat" },
        { text: "5. เอาเครื่องออก แล้วกลั้นหายใจ (นับ 1-10)", duration: 10, iconClass: "fa-solid fa-hand", animationClass: "fa-beat" },
        { text: "6. ผ่อนลมหายใจออกช้าๆ", duration: 4, iconClass: "fa-solid fa-face-smile" },
        { text: "7. บ้วนปากด้วยน้ำสะอาด", duration: 5, iconClass: "fa-solid fa-glass-water" }
    ];

    return <MedicationGuideBase title="DPI" icon={<i className="fa-solid fa-capsules"></i>} steps={steps} colorTheme="orange" />;
};
