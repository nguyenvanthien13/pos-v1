let deferredPrompt: any = null;
export function setupPwa() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(err => console.warn('Không thể đăng ký PWA:', err));
  });
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault(); deferredPrompt = event;
    document.dispatchEvent(new Event('nanghoa-install-ready'));
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; document.dispatchEvent(new Event('nanghoa-installed')); });
}
export async function installPwa() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt; deferredPrompt = null;
  await prompt.prompt();
  const result = await prompt.userChoice;
  return result.outcome === 'accepted';
}
export function canInstallPwa() { return !!deferredPrompt; }
