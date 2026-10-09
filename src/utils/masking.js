/**
 * Content masking utilities for unauthenticated guest visitors.
 * Reveals full details only when an authorized doctor or admin is logged in.
 */

export function maskPhone(phone, isAuthorized) {
  if (isAuthorized || !phone) return phone;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 4) return '••••••••••';
  const prefix = digits.slice(0, 5);
  return `+91 ${prefix} •••••`;
}

export function maskEmail(email, isAuthorized) {
  if (isAuthorized || !email) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '••••••@••••.com';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}••••••` : '••••••';
  return `${maskedName}@${domain}`;
}

export function maskMembershipNo(membershipNo, isAuthorized) {
  if (isAuthorized || !membershipNo) return membershipNo;
  const str = String(membershipNo);
  if (str.length <= 2) return '••';
  return `${str.slice(0, 2)}••`;
}
