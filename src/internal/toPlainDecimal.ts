// JS stringifies numbers in exponential form once the magnitude is >= 1e21 or
// < 1e-6 (e.g. "1e+21", "1e-7"). CSS output must never contain that, so we
// expand the exponent into a plain decimal by shifting the decimal point on the
// digit string. This is string manipulation on the same digits, so it does not
// re-introduce floating-point error. Shared by the measurement core and the
// scalar (float / integer) primitives so every `.css()` renders the same way.
export const toPlainDecimal = (value: number): string => {
  const text = `${value}`;
  if (!text.includes('e') && !text.includes('E')) {
    return text;
  }
  const [
    mantissa,
    exponentText,
  ] = text.toLowerCase().split('e');
  const exponent = Number(exponentText);
  const negative = mantissa.startsWith('-');
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [
    intDigits,
    fracDigits = '',
  ] = unsigned.split('.');
  const digits = intDigits + fracDigits;
  const pointFromLeft = intDigits.length + exponent;
  const sign = negative ? '-' : '';

  if (pointFromLeft <= 0) {
    return `${sign}0.${'0'.repeat(-pointFromLeft)}${digits}`;
  }
  if (pointFromLeft >= digits.length) {
    return `${sign}${digits}${'0'.repeat(pointFromLeft - digits.length)}`;
  }
  return `${sign}${digits.slice(0, pointFromLeft)}.${digits.slice(pointFromLeft)}`;
};
