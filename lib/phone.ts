export function mobileDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isMobileNumber(value: string) {
  return /^[6-9]\d{9}$/.test(mobileDigits(value));
}

export function phoneLabel(value: string) {
  const digits = mobileDigits(value);
  if (!isMobileNumber(digits)) return "";
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function phoneHref(value: string) {
  const digits = mobileDigits(value);
  if (!isMobileNumber(digits)) return null;
  return `tel:+91${digits}`;
}
