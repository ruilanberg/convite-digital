import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

const defaultPopupOptions = {
  text: "",
  width: 350,
  height: 300,
  fontSize: 28,
};

type PopupOptions = typeof defaultPopupOptions;

export class BasePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  protected bg: Sprite;
  /** Container for the popup UI components */
  protected panel: Container;
  /** The popup title label */
  protected title: Label;
  /** Button that closes the popup */
  protected doneButton: Button;
  /** The panel background */
  protected panelBase: RoundedBox;
  /** Design-time panel size (used to clamp on resize) */
  private designWidth: number;
  private designHeight: number;

  constructor(options: Partial<PopupOptions> = {}) {
    const opts = { ...defaultPopupOptions, ...options };
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.designWidth = opts.width ?? 350;
    this.designHeight = opts.height ?? 300;
    this.panelBase = new RoundedBox({
      height: this.designHeight,
      width: this.designWidth,
    });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: opts.text,
      style: { fill: 0xec1561, fontSize: opts.fontSize },
    });
    this.title.y = -80;
    this.panel.addChild(this.title);

    this.doneButton = new Button({ text: "OK" });
    this.doneButton.y = 70;
    this.doneButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    // Fullscreen dim background
    this.bg.width = width;
    this.bg.height = height;

    // Clamp panel size to viewport with margins
    const marginX = Math.max(16, Math.round(width * 0.05));
    const marginY = Math.max(16, Math.round(height * 0.05));
    const maxW = Math.max(240, width - marginX * 2);
    const maxH = Math.max(200, height - marginY * 2);
    const panelW = Math.min(this.designWidth, maxW);
    const panelH = Math.min(this.designHeight, maxH);
    this.panelBase.setSize(panelW, panelH);

    // Center the panel
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
