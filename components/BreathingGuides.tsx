
import React, { useState, useEffect, useRef, useCallback } from 'react';

const guideBaseClasses = "text-center p-6 rounded-xl bg-slate-100 border border-slate-200 transition-all duration-500";
const instructionClasses = "text-2xl md:text-3xl font-bold text-cyan-700 h-16 flex items-center justify-center";
const timerClasses = "text-5xl md:text-6xl font-bold text-slate-700 my-4";
const roundClasses = "text-lg text-slate-500";
const buttonClasses = "mt-6 px-6 py-2 rounded-full font-semibold text-white transition-colors duration-300 disabled:bg-slate-400";

export const DiaphragmaticBreathingGuide: React.FC = () => {
    const [phase, setPhase] = useState<'idle' | 'prepare' | 'inhale' | 'hold' | 'exhale'>('idle');
    const [round, setRound] = useState(0);
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const phases = {
        prepare: { duration: 3, next: 'inhale', instruction: 'เตรียมตัว...' },
        inhale: { duration: 3, next: 'hold', instruction: 'หายใจเข้า' },
        hold: { duration: 2, next: 'exhale', instruction: 'กลั้นหายใจ' },
        exhale: { duration: 4, next: 'prepare', instruction: 'หายใจออก' },
    };

    const stopExercise = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('idle');
        setRound(0);
        setTimer(0);
    }, []);

    const startExercise = () => {
        setPhase('prepare');
        setTimer(phases.prepare.duration);
        setRound(1);
    };

    useEffect(() => {
        if (phase !== 'idle') {
            intervalRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev > 1) {
                        return prev - 1;
                    } else {
                        const currentPhase = phases[phase as keyof typeof phases];
                        if (currentPhase.next === 'prepare' && round >= 8) {
                            stopExercise();
                            return 0;
                        }
                        const nextPhase = currentPhase.next as 'prepare' | 'inhale' | 'hold' | 'exhale';
                        if (nextPhase === 'inhale') setRound(r => r + 1);
                        setPhase(nextPhase);
                        return phases[nextPhase].duration;
                    }
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, round, stopExercise]);
    
    const lungScale = phase === 'inhale' || phase === 'hold' ? 'scale-110' : 'scale-100';

    return (
        <div className={guideBaseClasses}>
            <div className="flex justify-center items-center h-48 mb-4">
                <div className={`relative w-40 h-40 flex justify-center items-center transition-transform duration-1000 ${lungScale}`}>
                    <i className="fa-solid fa-lungs text-9xl text-sky-400"></i>
                </div>
            </div>
            <p className={instructionClasses}>{phase !== 'idle' ? phases[phase as keyof typeof phases].instruction : 'กด "เริ่ม" เพื่อฝึก'}</p>
            <p className={timerClasses}>{timer > 0 ? timer : '-'}</p>
            <p className={roundClasses}>{round > 0 ? `รอบที่ ${round} / 8` : 'ทำทั้งหมด 8 รอบ'}</p>
            <button
                onClick={phase === 'idle' ? startExercise : stopExercise}
                className={`${buttonClasses} ${phase === 'idle' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
                {phase === 'idle' ? 'เริ่ม' : 'หยุด'}
            </button>
        </div>
    );
};

export const PursedLipBreathingGuide: React.FC = () => {
    const [phase, setPhase] = useState<'idle' | 'inhale' | 'exhale'>('idle');
    const [round, setRound] = useState(0);
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const phases = {
        inhale: { duration: 2, next: 'exhale', instruction: 'หายใจเข้าทางจมูก' },
        exhale: { duration: 4, next: 'inhale', instruction: 'หายใจออกช้าๆ แบบจีบปาก' },
    };

    const stopExercise = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('idle');
        setRound(0);
        setTimer(0);
    }, []);

    const startExercise = () => {
        setPhase('inhale');
        setTimer(phases.inhale.duration);
        setRound(1);
    };

    useEffect(() => {
        if (phase !== 'idle') {
            intervalRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev > 1) {
                        return prev - 1;
                    } else {
                        if (phase === 'exhale' && round >= 10) {
                            stopExercise();
                            return 0;
                        }
                        const nextPhase = phases[phase as keyof typeof phases].next as 'inhale' | 'exhale';
                        if (nextPhase === 'inhale') setRound(r => r + 1);
                        setPhase(nextPhase);
                        return phases[nextPhase].duration;
                    }
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, round, stopExercise]);

    const inhaleStyle = {
        transform: phase === 'inhale' ? 'scale(1.1)' : 'scale(1)',
        color: phase === 'inhale' ? '#38bdf8' : '#94a3b8', // sky-400 : slate-400
    };

    const exhaleStyle = {
        transform: phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
        color: phase === 'exhale' ? '#f87171' : '#94a3b8', // red-400 : slate-400
    };

    return (
        <div className={guideBaseClasses}>
            <div className="flex justify-center items-center h-48 mb-4 relative text-9xl">
                {phase === 'exhale' ? (
                     <span style={exhaleStyle} className="transition-all duration-500">👄</span>
                ) : (
                     <span style={inhaleStyle} className="transition-all duration-500">👃🏻</span>
                )}
            </div>
            <p className={instructionClasses}>{phase !== 'idle' ? phases[phase as keyof typeof phases].instruction : 'กด "เริ่ม" เพื่อฝึก'}</p>
            <p className={timerClasses}>{timer > 0 ? timer : '-'}</p>
            <p className={roundClasses}>{round > 0 ? `รอบที่ ${round} / 10` : 'ทำทั้งหมด 10 รอบ'}</p>
            <button
                onClick={phase === 'idle' ? startExercise : stopExercise}
                className={`${buttonClasses} ${phase === 'idle' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
                {phase === 'idle' ? 'เริ่ม' : 'หยุด'}
            </button>
        </div>
    );
};


export const RelaxationGuide: React.FC = () => {
    const muscleGroups = [
        'เท้าทั้งสองข้าง', 'น่องและหน้าแข้ง', 'ต้นขา', 'สะโพกและก้น',
        'หน้าท้อง', 'หน้าอก', 'แขนและมือ', 'คอและไหล่', 'ใบหน้า'
    ];
    const [phase, setPhase] = useState<'idle' | 'tense' | 'release'>('idle');
    const [groupIndex, setGroupIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const phases = {
        tense: { duration: 5, next: 'release', instruction: 'เกร็ง' },
        release: { duration: 10, next: 'tense', instruction: 'คลาย' },
    };

    const stopExercise = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('idle');
        setGroupIndex(0);
        setTimer(0);
    }, []);

    const startExercise = () => {
        setPhase('tense');
        setGroupIndex(0);
        setTimer(phases.tense.duration);
    };

    useEffect(() => {
        if (phase !== 'idle') {
            intervalRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev > 1) {
                        return prev - 1;
                    } else {
                        const currentPhase = phases[phase as keyof typeof phases];
                        if (phase === 'release' && groupIndex >= muscleGroups.length - 1) {
                            stopExercise();
                            return 0;
                        }
                        
                        const nextPhase = currentPhase.next as 'tense' | 'release';
                        if (nextPhase === 'tense') setGroupIndex(i => i + 1);

                        setPhase(nextPhase);
                        return phases[nextPhase].duration;
                    }
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, groupIndex, stopExercise]);
    
    const progressPercentage = phase === 'idle' ? 0 : ((groupIndex + 1) / muscleGroups.length) * 100;

    return (
        <div className={guideBaseClasses}>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
                <div className="bg-cyan-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xl h-14 flex items-center justify-center">
              {phase !== 'idle' ? muscleGroups[groupIndex] : "เตรียมพร้อมผ่อนคลาย"}
            </p>
            <p className={instructionClasses}>{phase !== 'idle' ? phases[phase as keyof typeof phases].instruction : 'กด "เริ่ม" เพื่อฝึก'}</p>
            <p className={timerClasses}>{timer > 0 ? timer : '-'}</p>
            <button
                onClick={phase === 'idle' ? startExercise : stopExercise}
                className={`${buttonClasses} ${phase === 'idle' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
                {phase === 'idle' ? 'เริ่ม' : 'หยุด'}
            </button>
        </div>
    );
};
