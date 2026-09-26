/** Keep keyboard focus inside the currently open transient dialog. */
export function installDialogFocus(): () => void {
  let activeDialog: HTMLElement | null = null;
  let returnFocus: HTMLElement | null = null;
  const selector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
  const focusables = (dialog: HTMLElement): HTMLElement[] =>
    [...dialog.querySelectorAll<HTMLElement>(selector)].filter(element => element.getClientRects().length > 0);
  function update() {
    const next = [...document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]')]
      .filter(element => element.getClientRects().length > 0).at(-1) ?? null;
    if (next === activeDialog) return;
    if (next && !activeDialog) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeDialog = next;
    if (next) {
      if (!next.hasAttribute('tabindex')) next.tabIndex = -1;
      (focusables(next)[0] ?? next).focus();
    } else if (returnFocus?.isConnected) {
      returnFocus.focus();
      returnFocus = null;
    }
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !activeDialog) return;
    const items = focusables(activeDialog);
    if (!items.length) { event.preventDefault(); activeDialog.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    if (!activeDialog.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && (document.activeElement === first || document.activeElement === activeDialog)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', onKeyDown);
  update();
  return () => { observer.disconnect(); document.removeEventListener('keydown', onKeyDown); };
}

