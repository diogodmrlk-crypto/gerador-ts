export function showToast(msg: string) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach((t) => t.remove());

  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;

  const phoneEl = document.querySelector('.phone');
  if (phoneEl) {
    phoneEl.appendChild(toast);
  }

  // Remove after animation
  setTimeout(() => toast.remove(), 3400);
}
