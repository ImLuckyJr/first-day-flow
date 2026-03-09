import Decimal from 'decimal.js';

export function calcMin(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    const _a = new Decimal(a);
    
    return _a.minus(b);
}

export function calcPlus(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    const _a = new Decimal(a);
    
    return _a.plus(b);
}

export function calcMul(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    const _a = new Decimal(a);
    
    return _a.mul(b);
}

export function calcDiv(a: string | number | Decimal, b: string | number | Decimal): Decimal {
    const _a = new Decimal(a);
    
    return _a.dividedBy(b);
}

export function calcDivToFixed2(a: string | number | Decimal, b: string | number | Decimal): string {
    const _a = new Decimal(a);
    
    return _a.dividedBy(b).toFixed(2, Decimal.ROUND_DOWN);
}

export function calcDecimalToFixed2(a: Decimal): string {
    return a.toFixed(2, Decimal.ROUND_DOWN);
}