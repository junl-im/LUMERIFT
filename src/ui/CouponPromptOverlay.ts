export interface CouponPromptOptions {
  readonly title?: string;
  readonly description?: string;
  readonly placeholder?: string;
  readonly initialValue?: string;
}

export function promptCouponCode(options: CouponPromptOptions = {}): Promise<string | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);

  document.querySelector('.coupon-prompt-overlay')?.remove();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'coupon-prompt-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', options.title ?? '쿠폰 코드 입력');

    const form = document.createElement('form');
    form.className = 'coupon-prompt-card';

    const kicker = document.createElement('div');
    kicker.className = 'coupon-prompt-kicker';
    kicker.textContent = 'RIFT SUPPLY CODE';

    const title = document.createElement('h2');
    title.textContent = options.title ?? '쿠폰 코드 입력';

    const description = document.createElement('p');
    description.textContent = options.description ?? '영문과 숫자로 구성된 코드를 입력하세요.';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'coupon-code';
    input.autocomplete = 'off';
    input.setAttribute('autocapitalize', 'characters');
    input.spellcheck = false;
    input.maxLength = 32;
    input.placeholder = options.placeholder ?? 'LUMERIFT13';
    input.value = options.initialValue ?? '';
    input.setAttribute('aria-label', '쿠폰 코드');

    const error = document.createElement('div');
    error.className = 'coupon-prompt-error';
    error.setAttribute('aria-live', 'polite');

    const actions = document.createElement('div');
    actions.className = 'coupon-prompt-actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '취소';

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'primary';
    submit.textContent = '코드 확인';

    actions.append(cancel, submit);
    form.append(kicker, title, description, input, error, actions);
    overlay.append(form);
    document.body.append(overlay);

    let settled = false;
    const close = (value: string | null): void => {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', handleKeydown);
      overlay.remove();
      resolve(value);
    };
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close(null);
    };

    cancel.addEventListener('click', () => close(null));
    overlay.addEventListener('pointerdown', (event) => {
      if (event.target === overlay) close(null);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const normalized = input.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!normalized) {
        error.textContent = '쿠폰 코드를 입력해 주세요.';
        input.focus();
        return;
      }
      close(normalized);
    });
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      error.textContent = '';
    });
    document.addEventListener('keydown', handleKeydown);
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  });
}
