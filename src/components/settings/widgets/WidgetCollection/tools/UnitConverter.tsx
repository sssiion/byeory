import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Repeat } from 'lucide-react';

const UNIT_CATEGORIES = {
    length: {
        label: '길이',
        units: {
            m: '미터 (m)',
            cm: '센티미터 (cm)',
            mm: '밀리미터 (mm)',
            km: '킬로미터 (km)',
            in: '인치 (in)',
            ft: '피트 (ft)',
            yd: '야드 (yd)',
            mi: '마일 (mi)',
        },
        rates: {
            m: 1, cm: 100, mm: 1000, km: 0.001,
            in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371
        }
    },
    area: {
        label: '면적',
        units: {
            m2: '제곱미터 (m²)',
            py: '평',
            ft2: '제곱피트 (sq ft)',
            ac: '에이커 (ac)',
        },
        rates: {
            m2: 1, py: 0.3025, ft2: 10.7639, ac: 0.000247105
        }
    },
    weight: {
        label: '무게',
        units: {
            kg: '킬로그램 (kg)',
            g: '그램 (g)',
            lb: '파운드 (lb)',
            oz: '온스 (oz)',
        },
        rates: {
            kg: 1, g: 1000, lb: 2.20462, oz: 35.274
        }
    },
    currency: {
        label: '환율',
        units: {
            KRW: '대한민국 원 (KRW)',
            USD: '미국 달러 (USD)',
            JPY: '일본 엔 (JPY)',
            EUR: '유로 (EUR)',
            CNY: '중국 위안 (CNY)',
        },
        // Base rate is roughly relative to USD (1 USD = 1) - Just default initial values
        // Will be updated by API if available
        rates: {
            USD: 1,
            KRW: 1445,
            JPY: 155,
            EUR: 0.85,
            CNY: 7.02
        }
    }
};

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

export function UnitConverter() {
    const [category, setCategory] = useState<keyof typeof UNIT_CATEGORIES>('length');
    const [fromUnit, setFromUnit] = useState<string>('m');
    const [toUnit, setToUnit] = useState<string>('cm');
    const [fromValue, setFromValue] = useState<string>('1');
    const [toValue, setToValue] = useState<string>('');
    const [rates, setRates] = useState<any>(UNIT_CATEGORIES.length.rates);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Initial setup when category changes
    useEffect(() => {
        const cat = UNIT_CATEGORIES[category];
        const units = Object.keys(cat.units);
        setFromUnit(units[0]);
        setToUnit(units[1] || units[0]);

        if (category === 'currency') {
            fetchCurrencyRates();
        } else {
            setRates(cat.rates);
            setLastUpdated(null);
        }
    }, [category]);

    // Recalculate when inputs change
    useEffect(() => {
        calculate(fromValue, fromUnit, toUnit);
    }, [fromValue, fromUnit, toUnit, rates]);

    const fetchCurrencyRates = async () => {
        const CACHE_KEY = 'exchange_rates_cache';
        const updatedCache = localStorage.getItem(CACHE_KEY);

        if (updatedCache) {
            const { timestamp, data } = JSON.parse(updatedCache);
            // Cache valid for 12 hours
            if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
                setRates(data.conversion_rates);
                setLastUpdated(new Date(timestamp).toLocaleTimeString());
                return;
            }
        }

        if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
            console.warn('Exchange Rate API Key is missing. Using default rates.');
            setRates(UNIT_CATEGORIES.currency.rates); // Fallback to hardcoded
            return;
        }

        try {
            const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
            const data = await res.json();
            if (data.result === 'success') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }));
                setRates(data.conversion_rates);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (e) {
            console.error("Failed to fetch rates", e);
            setRates(UNIT_CATEGORIES.currency.rates); // Fallback
        }
    };

    const calculate = (val: string, from: string, to: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
            setToValue('');
            return;
        }

        // Conversion logic: (Value / FromRate) * ToRate for base-relative systems
        // Actually for the "rates" defined above:
        // Length/Weight/Area: 1 BaseUnit (e.g. m, m2, kg) = Rate * Unit
        // So Value(m) = Value(Unit) / Rate(Unit)
        // TargetValue(TargetUnit) = Value(m) * Rate(TargetUnit)

        // Wait, check rates definitions:
        // m: 1, cm: 100 -> 1m = 100cm. Correct.
        // So conversion is: (Value / FromRate) * ToRate? No.
        // Value(cm) -> Value(m) = Value(cm) / 100.
        // Value(m) -> Value(mm) = Value(m) * 1000.
        // So: BaseValue = Value / Rate. TargetValue = BaseValue * TargetRate.

        // For Currency (Base USD):
        // USD: 1, KRW: 1400.
        // Value(USD) = Value(KRW) / 1400.
        // TargetValue(JPY) = Value(USD) * 150.
        // Yes, the logic matches.

        // Special case: Currency API usually gives "1 USD = X Unit".
        // My hardcoded rates: "m: 1, cm: 100" means "1 m = 100 cm".
        // API response "USD: 1, KRW: 1445" means "1 USD = 1445 KRW".
        // So the logic IS: (Value / FromRate) * ToRate? 
        // Let's trace: 100 cm to m. 
        // Base(m) = 100 / 100 = 1. Target(m) = 1 * 1 = 1. Correct.
        // 1 USD to KRW.
        // Base(USD) = 1 / 1 = 1. Target(KRW) = 1 * 1445 = 1445. Correct.

        if (!rates[from] || !rates[to]) return;

        const baseValue = num / rates[from];
        const result = baseValue * rates[to];

        // Format
        let formatted = result.toLocaleString(undefined, { maximumFractionDigits: 4 });
        if (category === 'currency') {
            formatted = result.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }

        // Use scientific notation if too long but allow user input
        if (result > 1000000000 || (result < 0.0001 && result > 0)) {
            // simple format
        }

        // Simply set string
        setToValue(parseFloat(result.toFixed(6)).toString());
    };

    const handleSwap = () => {
        const tempUnit = fromUnit;
        const tempVal = fromValue;
        setFromUnit(toUnit);
        setToUnit(tempUnit);

        // We set input to the calculated output to "continue" conversion
        setFromValue(toValue);
    };

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border">
            {/* Header / Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {Object.entries(UNIT_CATEGORIES).map(([key, info]) => (
                    <button
                        key={key}
                        onClick={() => setCategory(key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                            ${category === key
                                ? 'theme-bg-primary text-white'
                                : 'theme-bg-card-secondary theme-text-secondary hover:theme-text-primary'
                            }`}
                    >
                        {info.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
                {/* From */}
                <div className="relative">
                    <label className="text-xs theme-text-secondary mb-1 block font-bold">From</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={fromValue}
                            onChange={(e) => setFromValue(e.target.value)}
                            className="flex-1 theme-bg-input rounded-lg px-3 py-2 text-lg font-mono outline-none focus:ring-2 ring-[var(--btn-bg)] transition-all theme-text-primary w-full"
                        />
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className="w-24 bg-transparent theme-text-primary text-sm font-bold outline-none border-b-2 border-transparent focus:border-[var(--btn-bg)] transition-colors text-right"
                        >
                            {Object.entries(UNIT_CATEGORIES[category].units).map(([u, label]) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 z-10">
                    <button
                        onClick={handleSwap}
                        className="p-2 rounded-full theme-bg-card border theme-border shadow-sm hover:scale-110 transition-transform theme-text-secondary hover:theme-text-primary"
                    >
                        <ArrowLeftRight size={16} />
                    </button>
                </div>

                {/* To */}
                <div className="relative">
                    <label className="text-xs theme-text-secondary mb-1 block font-bold">To</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={toValue}
                            className="flex-1 theme-bg-card-secondary rounded-lg px-3 py-2 text-lg font-mono outline-none theme-text-primary w-full"
                        />
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            className="w-24 bg-transparent theme-text-primary text-sm font-bold outline-none border-b-2 border-transparent focus:border-[var(--btn-bg)] transition-colors text-right"
                        >
                            {Object.entries(UNIT_CATEGORIES[category].units).map(([u, label]) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Info */}
                {category === 'currency' && (
                    <div className="text-[10px] theme-text-secondary text-center mt-2">
                        {lastUpdated ? `업데이트: ${lastUpdated}` : '기본 환율 사용 중'}
                        {(!API_KEY || API_KEY === 'YOUR_KEY_HERE') && <span className="block text-red-400">API 키 미설정</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
