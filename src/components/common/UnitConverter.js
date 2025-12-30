
export const KG_TO_LBS = 2.20462;

export const convertWeight = (weightInKg, unit) => {
    if (unit === 'kg') return { value: weightInKg, unitLabel: 'kg' };
    const inLbs = weightInKg * KG_TO_LBS;
    // Round to 1 decimal place for cleaner display
    return { value: Math.round(inLbs * 10) / 10, unitLabel: 'lbs' };
};

export const toKg = (weight, unit) => {
    if (unit === 'kg') return Number(weight);
    return Number(weight) / KG_TO_LBS;
};
