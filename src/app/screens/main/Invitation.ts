import { animate } from "motion";
import { Graphics, Sprite, Texture } from "pixi.js";

import type { MainScreen } from "./MainScreen";
import { Label } from "../../ui/Label";
import { engine } from "../../getEngine";
import { INVITE } from "../../data/invitation";

export class Invitation {
  public screen!: MainScreen;

  private card!: Sprite;
  private title!: Label;
  private subtitle!: Label;
  private details!: Label;
  private overlay!: Graphics;

  public async show(screen: MainScreen): Promise<void> {
    this.screen = screen;

    this.card = new Sprite({
      texture: Texture.from("bg-Invite.png"),
      anchor: 0.5,
      scale: 0.5,
      alpha: 0,
    });
    this.screen.mainContainer.addChildAt(this.card, 0);

    this.overlay = new Graphics();
    this.screen.mainContainer.addChildAt(this.overlay, 1);

    this.title = new Label({
      text: INVITE.title,
      style: {
        fill: 0xec1561,
        fontFamily: "Pacifico, cursive",
        fontSize: 64,
      },
    });
    this.title.alpha = 0;
    this.screen.mainContainer.addChild(this.title);

    this.subtitle = new Label({
      text: `da ${INVITE.babyName}`,
      style: {
        fill: 0xec1561,
        fontFamily: "Pacifico, cursive",
        fontSize: 64,
      },
    });
    this.subtitle.alpha = 0;
    this.screen.mainContainer.addChild(this.subtitle);

    this.details = new Label({
      text: `${INVITE.description}\n\n${INVITE.date} • ${INVITE.time}\n${INVITE.addressLine1}`,
      style: {
        fill: 0x1e1e1e,
        fontSize: 54,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 520,
      },
    });
    this.details.alpha = 0;
    this.screen.mainContainer.addChild(this.details);

    this.resize(engine().navigation.width, engine().navigation.height);

    await animate(this.card, { alpha: 1 }, { duration: 0.4 });
    await animate(this.title, { alpha: 1 }, { duration: 0.3 });
    await animate(this.subtitle, { alpha: 1 }, { duration: 0.3 });
    await animate(this.details, { alpha: 1 }, { duration: 0.3 });
  }

  public update(): void {}

  public resize(w: number, h: number): void {
    if (!this.card || !this.title || !this.subtitle || !this.details) return;

    const baseWidth = this.card.texture.width || 1000;
    const baseHeight = this.card.texture.height || 1500;
    const scale = Math.max(w / baseWidth, h / baseHeight);
    this.card.scale.set(scale);
    this.card.position.set(0, 0);

    this.overlay.clear();
    this.overlay
      .rect(-w * 0.5, -h * 0.5, w, h)
      .fill({ color: 0xffffff, alpha: 0.18 });

    const small = w < 900;
    const titleSize = small ? 48 : 64;
    const subtitleSize = small ? 42 : 50;
    const detailsSize = small ? 30 : 34;

    this.title.style.fontSize = titleSize;
    this.subtitle.style.fontSize = subtitleSize;
    this.details.style.fontSize = detailsSize;

    const top = -h * 0.5;
    const marginTop = h * 0.22;
    const gap1 = small ? 5 : 10;
    const gap2 = small ? 270 : 195;

    this.title.position.set(0, top + marginTop);
    this.subtitle.position.set(0, this.title.y + titleSize + gap1);
    this.details.position.set(0, this.subtitle.y + subtitleSize + gap2);
    this.details.style.wordWrapWidth = Math.min(560, w * 0.85);
  }
}
