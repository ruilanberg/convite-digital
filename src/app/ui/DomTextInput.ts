export interface DomInputOptions {
  value?: string;
  placeholder?: string;
  x: number; // page X in CSS pixels
  y: number; // page Y in CSS pixels
  width?: number;
  type?: string; // e.g. 'text' | 'email' | 'tel'
  inputMode?: string; // e.g. 'text' | 'numeric' | 'email' | 'tel'
  onSubmit: (value: string) => void;
}

export class DomTextInput {
  private parent: HTMLElement;
  private input: HTMLInputElement;
  private submitCb: ((value: string) => void) | null = null;
  private visible = false;
  private persistent = false;

  constructor(parent: HTMLElement = document.body) {
    this.parent = parent;
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.autocomplete = "off";
    this.input.spellcheck = false;
    this.input.style.position = "absolute";
    this.input.style.zIndex = "9999";
    this.input.style.height = "44px";
    this.input.style.padding = "8px 12px";
    this.input.style.border = "2px solid rgba(236,21,97,.5)";
    this.input.style.borderRadius = "10px";
    this.input.style.boxShadow = "0 2px 8px rgba(0,0,0,.1)";
    this.input.style.background = "#ffffff";
    this.input.style.color = "#333";
    this.input.style.fontFamily = "Quicksand, Arial, sans-serif";
    this.input.style.fontSize = "18px";
    this.input.style.display = "none";
    this.parent.appendChild(this.input);

    this.input.addEventListener("keydown", (e) => {
      if (this.persistent) return;
      if (e.key === "Enter") {
        e.preventDefault();
        this.hide(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.hide(false);
      }
    });
    this.input.addEventListener("blur", () => {
      if (this.persistent) return;
      this.hide(true);
    });
  }

  public show(opts: DomInputOptions) {
    this.persistent = false;
    this.submitCb = opts.onSubmit;
    const width = Math.max(160, Math.floor(opts.width ?? 280));
    const height = parseInt(this.input.style.height, 10) || 44;
    this.input.value = opts.value ?? "";
    this.input.placeholder = opts.placeholder ?? "";
    this.input.type = opts.type || "text";
    this.input.setAttribute("inputmode", opts.inputMode || "text");
    this.input.style.width = `${width}px`;
    this.input.style.left = `${Math.floor(opts.x - width / 2)}px`;
    this.input.style.top = `${Math.floor(opts.y - height / 2)}px`;
    this.input.style.display = "block";
    this.visible = true;
    this.input.focus();
    this.input.select();
  }

  // Persistent mounted input that stays visible until destroyed/hidden manually
  public mount(opts: Omit<DomInputOptions, "onSubmit">) {
    this.persistent = true;
    const width = Math.max(160, Math.floor(opts.width ?? 280));
    const height = parseInt(this.input.style.height, 10) || 44;
    this.input.value = opts.value ?? "";
    this.input.placeholder = opts.placeholder ?? "";
    this.input.style.width = `${width}px`;
    this.input.style.left = `${Math.floor(opts.x - width / 2)}px`;
    this.input.style.top = `${Math.floor(opts.y - height / 2)}px`;
    this.input.style.display = "block";
    this.visible = true;
  }

  public reposition(x: number, y: number) {
    if (!this.visible) return;
    const width = parseInt(this.input.style.width, 10) || 280;
    const height = parseInt(this.input.style.height, 10) || 44;
    this.input.style.left = `${Math.floor(x - width / 2)}px`;
    this.input.style.top = `${Math.floor(y - height / 2)}px`;
  }

  public hide(submit: boolean) {
    if (!this.visible) return;
    const cb = this.submitCb;
    this.submitCb = null;
    this.visible = false;
    this.input.style.display = "none";
    if (submit && cb) cb(this.input.value.trim());
  }

  public isVisible() {
    return this.visible;
  }

  public setValue(v: string) {
    this.input.value = v;
  }

  public getValue(): string {
    return this.input.value;
  }

  public setPlaceholder(p: string) {
    this.input.placeholder = p;
  }

  public setWidth(w: number) {
    const width = Math.max(120, Math.floor(w));
    this.input.style.width = `${width}px`;
  }

  public destroy() {
    this.input.remove();
    this.visible = false;
    this.submitCb = null;
  }
}
