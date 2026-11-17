<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
    onchange,
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  } = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  {disabled}
  class="switch"
  class:on={checked}
  onclick={toggle}
>
  <span class="thumb"></span>
</button>

<style>
  .switch {
    position: relative;
    flex-shrink: 0;
    width: 36px;
    height: 20px;
    border: var(--border-width, 2px) solid var(--color-accent, #92517d);
    border-radius: 999px;
    background: var(--color-surface-dark, #21222c);
    cursor: pointer;
    padding: 0;
    transition:
      background 0.2s,
      box-shadow 0.2s;
  }
  .switch:hover:not(:disabled) {
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-accent, #92517d) 30%, transparent);
  }
  .switch.on {
    background: var(--color-accent, #92517d);
  }
  .switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .switch:focus-visible {
    outline: 2px solid var(--color-text, whitesmoke);
    outline-offset: 2px;
  }

  .thumb {
    position: absolute;
    top: 50%;
    left: 2px;
    width: 12px;
    height: 12px;
    margin-top: -6px;
    border-radius: 50%;
    background: var(--color-accent, #92517d);
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.2s;
  }
  .switch.on .thumb {
    transform: translateX(16px);
    background: var(--color-text, whitesmoke);
  }

  @media (prefers-reduced-motion: reduce) {
    .switch,
    .thumb {
      transition: none;
    }
  }
</style>
