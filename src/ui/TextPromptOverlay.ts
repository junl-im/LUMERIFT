export interface TextPromptOptions {
  readonly title: string;
  readonly description?: string;
  readonly kicker?: string;
  readonly placeholder?: string;
  readonly initialValue?: string;
  readonly submitLabel?: string;
  readonly maxLength?: number;
}

export function promptTextValue(options: TextPromptOptions): Promise<string | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);

  document.querySelector('.text-prompt-overlay')?.remove();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'coupon-prompt-overlay text-prompt-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', options.title);

    const form = document.createElement('form');
    form.className = 'coupon-prompt-card';

    const kicker = document.createElement('div');
    kicker.className = 'coupon-prompt-kicker';
    kicker.textContent = options.kicker ?? 'CHARACTER PRESET';

    const title = document.createElement('h2');
    title.textContent = options.title;

    const description = document.createElement('p');
    description.textContent = options.description ?? '새 이름을 입력하세요.';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'text-value';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.maxLength = Math.max(1, options.maxLength ?? 24);
    input.placeholder = options.placeholder ?? '외형 프리셋';
    input.value = options.initialValue ?? '';
    input.setAttribute('aria-label', options.title);

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
    submit.textContent = options.submitLabel ?? '저장';

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
      const normalized = input.value.trim().replace(/\s+/g, ' ');
      if (!normalized) {
        error.textContent = '이름을 입력해 주세요.';
        input.focus();
        return;
      }
      close(normalized);
    });
    input.addEventListener('input', () => {
      error.textContent = '';
    });
    document.addEventListener('keydown', handleKeydown);
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.select();
    });
  });
}
