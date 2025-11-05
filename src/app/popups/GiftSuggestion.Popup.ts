import { Container, Sprite, Texture } from "pixi.js";

import { BasePopup } from "./BasePopup";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

export class GiftSuggestionPopup extends BasePopup {
  private row: Container;
  private giftText: Label;
  private imageSlot: RoundedBox;
  private imageSprite?: Sprite;
  private qrSlot: RoundedBox;
  private qrSprite?: Sprite;
  private qrRow: Container;
  private pixKeyLabel: Label;
  private noteLabel: Label;

  constructor() {
    super({ text: "Sugestão de presente", fontSize: 40, width: 860, height: 680 });

    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    if (this.doneButton.textView) this.doneButton.textView.text = "Fechar";
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;

    this.row = new Container();
    this.panel.addChild(this.row);

    this.giftText = new Label({
      text: "Sugestão: Fraldas Pampers",
      style: { fill: 0x4a4a4a, fontSize: 28, wordWrap: true, wordWrapWidth: 420, align: "left" },
    });
    this.giftText.anchor.set(0, 0.5);
    this.row.addChild(this.giftText);

    this.imageSlot = new RoundedBox({ width: 220, height: 220, color: 0xf5f5f5, shadow: false });
    this.row.addChild(this.imageSlot);
    const imageSlotLabel = new Label({ text: "Imagem aqui", style: { fill: 0x999999, fontSize: 18 } });
    imageSlotLabel.y = 0;
    this.imageSlot.addChild(imageSlotLabel);

    this.qrRow = new Container();
    this.panel.addChild(this.qrRow);

    this.pixKeyLabel = new Label({
      text: "Chave PIX: (defina aqui)",
      style: { fill: 0x4a4a4a, fontSize: 24, align: "left", wordWrap: true, wordWrapWidth: 700 },
    });
    this.pixKeyLabel.anchor.set(0, 0.5);
    this.qrRow.addChild(this.pixKeyLabel);

    this.noteLabel = new Label({
      text: "Caso prefira presentear em dinheiro, use a chave PIX.",
      style: { fill: 0x6a6a6a, fontSize: 20, align: "left", wordWrap: true, wordWrapWidth: 720 },
    });
    this.noteLabel.anchor.set(0, 0.5);
    this.qrRow.addChild(this.noteLabel);

    this.qrSlot = new RoundedBox({ width: 240, height: 240, color: 0xf5f5f5, shadow: false });
    this.qrRow.addChild(this.qrSlot);
    const qrSlotLabel = new Label({ text: "QR Code PIX", style: { fill: 0x999999, fontSize: 18 } });
    this.qrSlot.addChild(qrSlotLabel);
  }

  public override resize(width: number, height: number): void {
    super.resize(width, height);

    const boxW = this.panelBase.boxWidth;
    const topY = -this.panelBase.boxHeight * 0.5 + 140;
    const paddingX = 40;
    const columnGap = 24;
    const vGap = 28;
    const imageW = 220;
    const imageH = 220;
    const qrW = 240;
    const qrH = 240;

    const availableTextWidth = boxW - paddingX * 2 - imageW - columnGap;
    const minTextWidth = 280;
    const stacked = availableTextWidth < minTextWidth;

    this.row.x = 0;
    this.row.y = topY;

    const textWrap = stacked ? boxW - paddingX * 2 : availableTextWidth;
    this.giftText.style.wordWrapWidth = Math.max(200, textWrap) as never;

    const leftX = -boxW * 0.5 + paddingX;
    if (stacked) {
      this.giftText.x = leftX;
      this.giftText.y = this.giftText.height * 0.5;
      this.imageSlot.x = 0;
      this.imageSlot.y = this.giftText.height + vGap + imageH * 0.5;
      if (this.imageSprite) {
        this.imageSprite.x = this.imageSlot.x;
        this.imageSprite.y = this.imageSlot.y;
      }
    } else {
      this.giftText.x = leftX;
      this.giftText.y = this.giftText.height * 0.5;
      this.imageSlot.x = leftX + textWrap + columnGap + imageW * 0.5;
      this.imageSlot.y = imageH * 0.5;
      if (this.imageSprite) {
        this.imageSprite.x = this.imageSlot.x;
        this.imageSprite.y = this.imageSlot.y;
      }
    }

    const rowHeight = stacked ? this.giftText.height + vGap + imageH : Math.max(this.giftText.height, imageH);

    this.qrRow.x = 0;
    this.qrRow.y = topY + rowHeight + vGap;

    const pixAvailableTextWidth = boxW - paddingX * 2 - qrW - columnGap;
    const pixStacked = pixAvailableTextWidth < 300;

    if (pixStacked) {
      this.qrSlot.x = 0;
      this.qrSlot.y = qrH * 0.5;
      if (this.qrSprite) {
        this.qrSprite.x = this.qrSlot.x;
        this.qrSprite.y = this.qrSlot.y;
      }
      const wrap = Math.max(240, boxW - paddingX * 2);
      this.pixKeyLabel.style.wordWrapWidth = wrap as never;
      this.noteLabel.style.wordWrapWidth = wrap as never;
      this.pixKeyLabel.x = leftX;
      this.pixKeyLabel.y = this.qrSlot.y + qrH * 0.5 + vGap + this.pixKeyLabel.height * 0.5;
      this.noteLabel.x = leftX;
      this.noteLabel.y = this.pixKeyLabel.y + this.pixKeyLabel.height * 0.5 + 12 + this.noteLabel.height * 0.5;
    } else {
      const wrap = pixAvailableTextWidth;
      this.pixKeyLabel.style.wordWrapWidth = wrap as never;
      this.noteLabel.style.wordWrapWidth = wrap as never;
      this.pixKeyLabel.x = leftX;
      this.pixKeyLabel.y = this.pixKeyLabel.height * 0.5;
      this.noteLabel.x = leftX;
      this.noteLabel.y = this.pixKeyLabel.y + this.pixKeyLabel.height * 0.5 + 12 + this.noteLabel.height * 0.5;
      this.qrSlot.x = leftX + wrap + columnGap + qrW * 0.5;
      this.qrSlot.y = qrH * 0.5;
      if (this.qrSprite) {
        this.qrSprite.x = this.qrSlot.x;
        this.qrSprite.y = this.qrSlot.y;
      }
    }
  }

  public setGiftImage(texture: Texture) {
    if (this.imageSprite) this.imageSprite.destroy();
    this.imageSprite = new Sprite(texture);
    this.imageSprite.anchor.set(0.5);
    this.panel.addChild(this.imageSprite);
    this.imageSlot.visible = false;
    this.resize((this.parent as Container).width, (this.parent as Container).height);
  }

  public setPixQr(texture: Texture) {
    if (this.qrSprite) this.qrSprite.destroy();
    this.qrSprite = new Sprite(texture);
    this.qrSprite.anchor.set(0.5);
    this.panel.addChild(this.qrSprite);
    this.qrSlot.visible = false;
    this.resize((this.parent as Container).width, (this.parent as Container).height);
  }

  public setPixKey(text: string) {
    this.pixKeyLabel.text = `Chave PIX: ${text}`;
  }
}

