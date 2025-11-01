import { Sprite, Texture } from "pixi.js";

export class LetterBackground extends Sprite {
  get left() {
    return -this.width * 0.5;
  }

  get right() {
    return this.width * 0.5;
  }

  get top() {
    return -this.height * 0.5;
  }

  get bottom() {
    return this.height * 0.5;
  }

  constructor() {
    const tex = "bg-Invite.png";
    super({ texture: Texture.from(tex), anchor: 0.5, scale: 0.25 });
  }
}
