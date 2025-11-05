import { Container, Graphics } from "pixi.js";
import { RoundedBox } from "./RoundedBox";
import { Label } from "./Label";
import { DomTextInput } from "./DomTextInput";
import { engine } from "../getEngine";

export interface TextInputOptions {
  width?: number;
  height?: number;
  placeholder?: string;
}

/**
 * Pixi-based text input that visually lives inside the canvas and
 * opens a temporary DOM input overlay only while editing.
 */
export class TextInput extends Container {
  private static active: TextInput | null = null;
  private static dom: DomTextInput | null = null;
  private bg: RoundedBox;
  private outline: Graphics;
  private label: Label;
  private valueText = "";
  private placeholder: string;
  private focused = false;
  private caret: Graphics;
  private caretBlinkId: number | null = null;
  private usingDom = false;
  private _rebinder = () => this.repositionOverlay();

  constructor(opts: TextInputOptions = {}) {
    super();
    const width = opts.width ?? 300;
    const height = opts.height ?? 80;
    this.placeholder = opts.placeholder ?? "";

    this.bg = new RoundedBox({ width, height, color: 0xffffff, shadow: false });
    this.addChild(this.bg);

    // Subtle outline to resemble an input field
    this.outline = new Graphics()
      .roundRect(-width * 0.5, -height * 0.5, width, height, 12)
      .stroke({ color: 0xec1561, alpha: 0.5, width: 2 })
      .fill({ color: 0xffffff });
    this.addChild(this.outline);

    this.label = new Label({
      text: this.placeholder,
      style: { fill: 0x999999, fontSize: 22, align: "left", wordWrap: false },
    });
    // Align text to the left inside the box
    this.label.anchor.set(0, 0.5);
    this.label.x = -width * 0.5 + 16;
    this.label.y = 0;
    this.addChild(this.label);

    // Caret for focused editing
    this.caret = new Graphics();
    this.caret.visible = false;
    this.addChild(this.caret);

    this.eventMode = "static";
    this.cursor = "text";
    this.on("pointertap", this.focus, this);
  }

  public setValue(v: string) {
    this.valueText = v;
    this.updateLabel();
  }

  public getValue() {
    return this.valueText;
  }

  public setPlaceholder(p: string) {
    this.placeholder = p;
    this.updateLabel();
  }

  private updateLabel() {
    if (!this.valueText) {
      this.label.style.fill = 0x999999 as never;
      this.label.text = this.placeholder;
    } else {
      this.label.style.fill = 0x4a4a4a as never;
      this.label.text = this.valueText;
    }
    this.updateCaretPosition();
  }

  /** Focus this input and start capturing keyboard */
  public focus() {
    if (this.focused) return;
    // Blur any other active input first
    if (TextInput.active && TextInput.active !== this) {
      TextInput.active.blur();
    }
    this.focused = true;
    TextInput.active = this;
    this.startCaret();

    const isTouch = ("ontouchstart" in window) || (navigator as any).maxTouchPoints > 0;

    if (isTouch) {
      if (!TextInput.dom) TextInput.dom = new DomTextInput();
      this.usingDom = true;
      this.showDomOverlay();
      window.addEventListener("resize", this._rebinder, { passive: true } as AddEventListenerOptions);
      window.addEventListener("scroll", this._rebinder, { passive: true } as AddEventListenerOptions);
    } else {
      this.usingDom = false;
      window.addEventListener("keydown", this.onKeyDown, true);
    }
  }

  /** Reposition DOM overlay when visible */
  public repositionOverlay() {
    if (!this.focused || !this.usingDom || !TextInput.dom) return;
    const r = engine().renderer as any;
    const canvas = r.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const bounds = this.getBounds();
    const scaleX = rect.width / r.width;
    const scaleY = rect.height / r.height;
    const centerXCss = rect.left + (bounds.x + bounds.width * 0.5) * scaleX;
    const centerYCss = rect.top + (bounds.y + bounds.height * 0.5) * scaleY;
    const widthCss = Math.max(160, this.bg.boxWidth * scaleX);
    TextInput.dom.setWidth(widthCss);
    TextInput.dom.reposition(centerXCss, centerYCss);
  }

  /** Blur input and stop capturing keyboard */
  public blur() {
    if (!this.focused) return;
    this.focused = false;
    if (this.usingDom) {
      window.removeEventListener("resize", this._rebinder);
      window.removeEventListener("scroll", this._rebinder);
      if (TextInput.dom?.isVisible()) {
        TextInput.dom.hide(false);
      }
    } else {
      window.removeEventListener("keydown", this.onKeyDown, true);
    }
    if (TextInput.active === this) {
      TextInput.active = null;
    }
    this.stopCaret();
  }

  public override destroy(options?: unknown) {
    this.blur();
    super.destroy(options as never);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // Only handle when this input is focused
    if (!this.focused) return;

    // Handle special keys
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      this.blur();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (this.valueText.length > 0) {
        this.valueText = this.valueText.slice(0, -1);
        this.updateLabel();
      }
      return;
    }
    if (e.key === "Delete") {
      e.preventDefault();
      // No cursor index; treat as backspace for simplicity
      if (this.valueText.length > 0) {
        this.valueText = this.valueText.slice(0, -1);
        this.updateLabel();
      }
      return;
    }

    // Ignore modifier combos
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Only accept printable characters
    if (e.key.length === 1) {
      e.preventDefault();
      // Basic length guard based on box width and font size
      const next = this.valueText + e.key;
      const prev = this.label.text;
      const oldText = this.valueText ? this.valueText : "";
      this.label.text = next;
      const fits = this.label.width < this.bg.boxWidth - 32; // padding
      if (fits) {
        this.valueText = next;
      } else {
        // restore
        this.label.text = oldText || this.placeholder;
      }
      this.updateLabel();
    }
  };

  private showDomOverlay() {
    if (!TextInput.dom) return;
    const r = engine().renderer as any;
    const canvas = r.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const bounds = this.getBounds();
    const scaleX = rect.width / r.width;
    const scaleY = rect.height / r.height;
    const centerXCss = rect.left + (bounds.x + bounds.width * 0.5) * scaleX;
    const centerYCss = rect.top + (bounds.y + bounds.height * 0.5) * scaleY;
    const widthCss = Math.max(160, this.bg.boxWidth * scaleX);

    TextInput.dom.show({
      x: centerXCss,
      y: centerYCss,
      width: widthCss,
      value: this.valueText,
      placeholder: this.placeholder,
      type: "text",
      inputMode: "text",
      onSubmit: (val) => {
        this.valueText = val;
        this.updateLabel();
        this.blur();
      },
    });
  }

  private startCaret() {
    this.caret.visible = true;
    this.drawCaret(true);
    if (this.caretBlinkId !== null) clearInterval(this.caretBlinkId);
    this.caretBlinkId = setInterval(() => {
      this.caret.visible = !this.caret.visible;
    }, 500) as unknown as number;
  }

  private stopCaret() {
    if (this.caretBlinkId !== null) {
      clearInterval(this.caretBlinkId);
      this.caretBlinkId = null;
    }
    this.caret.visible = false;
  }

  private updateCaretPosition() {
    const contentWidth = this.valueText ? this.label.width : 0;
    const inputWidth = this.bg.boxWidth;
    const left = -inputWidth * 0.5 + 16; // same padding as label.x
    const x = left + contentWidth + 2;
    this.caret.x = x;
    this.caret.y = 0;
    this.drawCaret(this.caret.visible);
  }

  private drawCaret(visible: boolean) {
    const height = this.bg.boxHeight - 24; // padding
    this.caret.clear();
    if (!visible) return;
    this.caret.rect(0, -height * 0.5, 2, height).fill({ color: 0x4a4a4a, alpha: 0.8 });
  }
}
