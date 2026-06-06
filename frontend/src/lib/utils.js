import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDatetime(dateString) {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getStatusBadgeClass(status) {
  const map = {
    active: 'badge-active',
    approved: 'badge-approved',
    pending: 'badge-pending',
    draft: 'badge-draft',
    blocked: 'badge-blocked',
    rejected: 'badge-rejected',
    awarded: 'badge-awarded',
    paid: 'badge-paid',
    overdue: 'badge-overdue',
    closed: 'badge-blocked',
    submitted: 'badge-pending',
  };
  return `badge ${map[status?.toLowerCase()] || 'badge-pending'}`;
}

export function generatePONumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PO-${year}-${random}`;
}

export function truncate(str, n = 40) {
  return str?.length > n ? str.substr(0, n - 1) + '...' : str;
}
