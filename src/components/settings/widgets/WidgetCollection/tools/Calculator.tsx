import React, { useState } from 'react';
import { Delete, Eraser, Equal, Divide, X, Minus, Plus, Settings } from 'lucide-react';
import { evaluate } from 'mathjs';

interface CalculatorProps {
    mode?: 'basic' | 'scientific';
}

export function Calculator({ mode: initialMode = 'basic' }: CalculatorProps) {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isResult, setIsResult] = useState(false);
    const [mode, setMode] = useState<'basic' | 'scientific'>(initialMode);
    const [history, setHistory] = useState<string[]>([]);

    const [showHistory, setShowHistory] = useState(false);

    const handleInput = (val: string) => {
        if (isResult) {
            setDisplay(val);
            setIsResult(false);
        } else {
            if (display === '0' && val !== '.') {
                setDisplay(val);
            } else {
                setDisplay(prev => prev + val);
            }
        }
    };

    const handleOperator = (op: string) => {
        setIsResult(false);
        if (display === 'Error') return;
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setIsResult(false);
    };

    const handleBackspace = () => {
        if (isResult) {
            setDisplay('0');
            setIsResult(false);
            return;
        }
        if (display.length === 1) {
            setDisplay('0');
        } else {
            setDisplay(prev => prev.slice(0, -1));
        }
    };

    const calculate = () => {
        try {
            // Combine equation and current display
            let fullEq = equation + display;
            const result = evaluate(fullEq);

            // Format
            const final = Number(result).toLocaleString(undefined, { maximumFractionDigits: 8 });

            setHistory(prev => [fullEq + ' = ' + final, ...prev].slice(0, 10)); // Keep last 10
            setDisplay(String(result));
            setEquation('');
            setIsResult(true);
        } catch (e) {
            setDisplay('Error');
            setIsResult(true);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const ScientificBtn = ({ label, fn }: { label: string, fn: string }) => (
        <button
            onClick={() => handleInput(fn)}
            className="h-10 rounded-lg theme-bg-card-secondary text-xs font-bold theme-text-secondary hover:bg-[var(--btn-bg)] hover:text-white transition-colors"
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border relative overflow-hidden">

            {/* Top Toolbar */}
            <div className="absolute top-2 left-2 z-20 flex gap-2">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-lg hover:bg-black/5 theme-text-secondary hover:theme-text-primary transition-colors"
                    title="Settings & History"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Content or Overlay */}
            {showHistory ? (
                <div className="absolute inset-0 z-30 theme-bg-card p-4 flex flex-col animate-in fade-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between mb-4 border-b theme-border pb-2">
                        <span className="font-bold theme-text-primary">Settings & History</span>
                        <button
                            onClick={() => setShowHistory(false)}
                            className="bg-black/5 p-1 rounded-full px-3 text-xs font-bold hover:bg-black/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs theme-text-secondary font-bold mb-2 block">Calculator Mode</label>
                        <div className="flex gap-2 bg-black/5 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('basic')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'basic' ? 'bg-white shadow-sm theme-text-primary' : 'theme-text-secondary hover:theme-text-primary'}`}
                            >
                                Basic
                            </button>
                            <button
                                onClick={() => setMode('scientific')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'scientific' ? 'bg-white shadow-sm theme-text-primary' : 'theme-text-secondary hover:theme-text-primary'}`}
                            >
                                Scientific
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs theme-text-secondary font-bold">History</span>
                            <button
                                onClick={clearHistory}
                                className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                <Eraser size={14} /> Clear
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                            <React.Fragment>
                                {history.length === 0 ? (
                                    <div className="text-center py-8 opacity-30 text-xs">
                                        No history yet
                                    </div>
                                ) : (
                                    history.map((item, idx) => (
                                        <div key={idx} className="p-2 rounded bg-black/5 text-right">
                                            <div className="text-xs theme-text-primary font-mono select-all">
                                                {item}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </React.Fragment>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Display */}
                    <div className="flex-1 flex flex-col justify-end items-end mb-4 px-2 mt-8">
                        <div className="text-xs theme-text-secondary h-4">{equation}</div>
                        <div className={`font-mono font-bold theme-text-primary break-all text-right transition-all
                            ${display.length > 10 ? 'text-2xl' : 'text-4xl'}
                        `}>
                            {display}
                        </div>
                    </div>

                    {/* Scientific Keypad */}
                    {mode === 'scientific' && (
                        <div className="grid grid-cols-4 gap-2 mb-2 animate-in fade-in zoom-in-95">
                            <ScientificBtn label="sin" fn="sin(" />
                            <ScientificBtn label="cos" fn="cos(" />
                            <ScientificBtn label="tan" fn="tan(" />
                            <ScientificBtn label="π" fn="pi" />
                            <ScientificBtn label="(" fn="(" />
                            <ScientificBtn label=")" fn=")" />
                            <ScientificBtn label="^" fn="^" />
                            <ScientificBtn label="√" fn="sqrt(" />
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={handleClear} className="col-span-1 h-12 rounded-xl bg-red-100 text-red-500 font-bold hover:bg-red-200 transition-colors">AC</button>
                        <button onClick={handleBackspace} className="col-span-1 h-12 rounded-xl theme-bg-card-secondary theme-text-primary flex items-center justify-center hover:bg-gray-200 transition-colors"><Delete size={18} /></button>
                        <button onClick={() => handleOperator('%')} className="col-span-1 h-12 rounded-xl theme-bg-card-secondary theme-text-primary font-bold hover:bg-gray-200 transition-colors">%</button>
                        <button onClick={() => handleOperator('/')} className="col-span-1 h-12 rounded-xl bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Divide size={18} /></button>

                        {[7, 8, 9].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="h-12 rounded-xl theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('*')} className="h-12 rounded-xl bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><X size={18} /></button>

                        {[4, 5, 6].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="h-12 rounded-xl theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('-')} className="h-12 rounded-xl bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Minus size={18} /></button>

                        {[1, 2, 3].map(n => (
                            <button key={n} onClick={() => handleInput(String(n))} className="h-12 rounded-xl theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">{n}</button>
                        ))}
                        <button onClick={() => handleOperator('+')} className="h-12 rounded-xl bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] flex items-center justify-center font-bold hover:bg-[var(--btn-bg)]/20 transition-colors"><Plus size={18} /></button>

                        <div className="col-span-2 grid grid-cols-2 gap-2">
                            <button onClick={() => handleInput('0')} className="col-span-1 h-12 rounded-xl theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">0</button>
                            <button onClick={() => handleInput('.')} className="col-span-1 h-12 rounded-xl theme-bg-card border theme-border theme-text-primary font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">.</button>
                        </div>

                        <button onClick={calculate} className="col-span-2 h-12 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] flex items-center justify-center font-bold text-lg shadow-md hover:opacity-90 transition-opacity"><Equal size={24} /></button>
                    </div>
                </>
            )}
        </div>
    );
}
