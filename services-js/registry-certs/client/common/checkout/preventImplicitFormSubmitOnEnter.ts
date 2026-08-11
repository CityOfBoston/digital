import { KeyboardEvent } from 'react';

/**
 * Stops Enter from implicitly submitting a form when focus is on a non-submit
 * control (text input, select, etc.). Explicit Continue / Next / Submit
 * buttons, links, and checkboxes/radios still respond to Enter.
 */
export function preventImplicitFormSubmitOnEnter(
  ev: KeyboardEvent<HTMLFormElement>
): void {
  if (ev.key !== 'Enter') {
    return;
  }

  const target = ev.target as HTMLElement | null;
  if (!target) {
    return;
  }

  const tag = target.tagName;

  // Let focused buttons activate (fires click) — including type="button".
  if (tag === 'BUTTON') {
    return;
  }

  // Let focused links navigate.
  if (tag === 'A') {
    return;
  }

  // Keep Enter for newlines in textareas.
  if (tag === 'TEXTAREA') {
    return;
  }

  if (tag === 'INPUT') {
    const input = target as HTMLInputElement;
    const inputType = input.type.toLowerCase();

    if (inputType === 'submit' || inputType === 'image') {
      return;
    }

    // Space is native; also toggle checkbox/radio on Enter so keyboard users
    // aren't stuck, without submitting the form.
    if (inputType === 'checkbox' || inputType === 'radio') {
      ev.preventDefault();
      input.click();
      return;
    }
  }

  ev.preventDefault();
}
