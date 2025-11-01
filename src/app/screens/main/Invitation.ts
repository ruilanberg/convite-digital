import { animate } from "motion";
import { Sprite, Texture } from "pixi.js";

import type { MainScreen } from "./MainScreen";
import { Label } from "../../ui/Label";

export class Invitation {
  public screen!: MainScreen;

  private card!: Sprite;
  private title!: Label;
  private subtitle!: Label;
  private details!: Label;

  public async show(screen: MainScreen): Promise<void> {
    this.screen = screen;

    this.card = new Sprite({
      texture: Texture.from("bg-Invite.png"),
      anchor: 0.5,
      scale: 0.5,
      alpha: 0,
    });
    this.screen.mainContainer.addChild(this.card);

    this.title = new Label({
      text: "Chá de Bebê",
      style: {
        fill: 0xec1561,
        fontFamily: "Pacifico, cursive",
        fontSize: 64,
      },
    });
    this.title.alpha = 0;
    this.screen.mainContainer.addChild(this.title);

    this.subtitle = new Label({
      text: "da Alice",
      style: {
        fill: 0x4a4a4a,
        fontSize: 36,
      },
    });
    this.subtitle.alpha = 0;
    this.screen.mainContainer.addChild(this.subtitle);

    this.details = new Label({
      text: "Sábado, 12 de Julho • 16h\nRua das Flores, 123",
      style: {
        fill: 0x4a4a4a,
        fontSize: 24,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 520,
      },
    });
    this.details.alpha = 0;
    this.screen.mainContainer.addChild(this.details);

    await animate(this.card, { alpha: 1 }, { duration: 0.4 });
    await animate(this.title, { alpha: 1 }, { duration: 0.3 });
    await animate(this.subtitle, { alpha: 1 }, { duration: 0.3 });
    await animate(this.details, { alpha: 1 }, { duration: 0.3 });
  }

  public update(): void {}

  public resize(w: number): void {
    const targetWidth = Math.min(720, Math.floor(w * 0.75));
    const baseWidth = this.card.texture.width || 1000;
    const scale = targetWidth / baseWidth;
    this.card.scale.set(scale);
    this.card.position.set(0, 0);

    const cardTop = -this.card.height * 0.5;
    this.title.position.set(0, cardTop + this.card.height * 0.22);
    this.subtitle.position.set(0, this.title.y + 56);
    this.details.position.set(0, this.subtitle.y + 72);

    const small = w < 900;
    this.title.style.fontSize = small ? 48 : 64;
    this.subtitle.style.fontSize = small ? 28 : 36;
    this.details.style.fontSize = small ? 20 : 24;
    this.details.style.wordWrapWidth = Math.min(520, this.card.width * 0.8);
  }
}
