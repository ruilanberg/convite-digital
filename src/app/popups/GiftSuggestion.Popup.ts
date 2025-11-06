import { Container, Sprite, Texture } from "pixi.js";

import { BasePopup } from "./BasePopup";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

export class GiftSuggestionPopup extends BasePopup {
  private content: Container;
  private imageSection: RoundedBox;
  private imageSlot: RoundedBox;
  private imageSlotLabel: Label;
  private imageSprite?: Sprite;
  private giftText: Label;
  private pixSection: RoundedBox;
  private pixKeyLabel: Label;
  private noteLabel: Label;
  private qrSlot: RoundedBox;
  private qrSlotLabel: Label;
  private qrSprite?: Sprite;

  constructor() {
    super({
      text: "Sugestão de presente",
      fontSize: 40,
      width: 880,
      height: 780,
    });

    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    if (this.doneButton.textView) this.doneButton.textView.text = "Fechar";
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;

    this.content = new Container();
    this.panel.addChild(this.content);

    this.imageSection = new RoundedBox({
      width: 640,
      height: 280,
      color: 0xfff8f1,
      shadow: false,
    });
    this.content.addChild(this.imageSection);

    this.imageSlot = new RoundedBox({
      width: 220,
      height: 220,
      color: 0xffffff,
      shadow: false,
    });
    this.imageSection.addChild(this.imageSlot);

    this.imageSlotLabel = new Label({
      text: "Imagem aqui",
      style: { fill: 0x999999, fontSize: 18 },
    });
    this.imageSlot.addChild(this.imageSlotLabel);

    this.giftText = new Label({
      text: "Sugestão: Fraldas Pampers",
      style: {
        fill: 0x4a4a4a,
        fontSize: 28,
        wordWrap: true,
        wordWrapWidth: 560,
        align: "left",
      },
    });
    this.giftText.anchor.set(0, 0.5);
    this.imageSection.addChild(this.giftText);

    this.pixSection = new RoundedBox({
      width: 640,
      height: 220,
      color: 0xfff8f1,
      shadow: false,
    });
    this.content.addChild(this.pixSection);

    this.pixKeyLabel = new Label({
      text: "Chave PIX: (defina aqui)",
      style: {
        fill: 0x4a4a4a,
        fontSize: 24,
        align: "left",
        wordWrap: true,
        wordWrapWidth: 360,
      },
    });
    this.pixKeyLabel.anchor.set(0, 0);
    this.pixSection.addChild(this.pixKeyLabel);

    this.noteLabel = new Label({
      text: "Caso prefira presentear em dinheiro, use a chave PIX.",
      style: {
        fill: 0x6a6a6a,
        fontSize: 20,
        align: "left",
        wordWrap: true,
        wordWrapWidth: 360,
      },
    });
    this.noteLabel.anchor.set(0, 0);
    this.pixSection.addChild(this.noteLabel);

    this.qrSlot = new RoundedBox({
      width: 180,
      height: 180,
      color: 0xffffff,
      shadow: false,
    });
    this.pixSection.addChild(this.qrSlot);

    this.qrSlotLabel = new Label({
      text: "QR Code PIX",
      style: { fill: 0x999999, fontSize: 18 },
    });
    this.qrSlot.addChild(this.qrSlotLabel);
  }

  public override resize(width: number, height: number): void {
    super.resize(width, height);

    const panelWidth = this.panelBase.boxWidth;
    const contentWidth = Math.max(320, panelWidth - 80);
    const topY = -this.panelBase.boxHeight * 0.5 + 140;
    const sectionGap = 28;
    const basePadding = 28;
    const imageHeight = 240;

    this.content.position.set(0, topY);

    this.imageSection.setSize(contentWidth, imageHeight);
    this.imageSection.position.set(0, this.imageSection.boxHeight * 0.5);

    const columnGap = 24;
    const slotSize = Math.max(
      120,
      Math.min(
        200,
        this.imageSection.boxHeight - basePadding * 2,
        (this.imageSection.boxWidth - basePadding * 2) * 0.45,
      ),
    );
    this.imageSlot.setSize(slotSize, slotSize);
    const leftEdge = -this.imageSection.boxWidth * 0.5 + basePadding;
    const rightEdge = this.imageSection.boxWidth * 0.5 - basePadding;
    const slotX = leftEdge + slotSize * 0.5;
    this.imageSlot.position.set(slotX, 0);
    this.imageSlotLabel.position.set(0, 0);
    this.imageSlotLabel.visible = !this.imageSprite;

    if (this.imageSprite) {
      const tex = this.imageSprite.texture;
      if (tex.width > 0 && tex.height > 0) {
        const maxSize = slotSize - 20;
        const scale = Math.min(maxSize / tex.width, maxSize / tex.height, 1);
        this.imageSprite.scale.set(scale);
      }
      this.imageSprite.position.set(0, 0);
    }

    const textX = slotX + slotSize * 0.5 + columnGap;
    const textWrap = Math.max(200, rightEdge - textX);
    this.giftText.style.wordWrapWidth = textWrap as never;
    this.giftText.position.set(textX, 0);

    const currentY =
      this.imageSection.y + this.imageSection.boxHeight * 0.5 + sectionGap;

    const pixWidth = contentWidth;
    const pixPadding = basePadding;
    const pixColumnGap = columnGap;
    const pixReferenceHeight = 220;
    this.pixSection.setSize(pixWidth, pixReferenceHeight);

    const pixSlotSize = Math.max(
      120,
      Math.min(
        180,
        imageHeight - pixPadding * 2,
        (pixWidth - pixPadding * 2) * 0.4,
      ),
    );
    this.qrSlot.setSize(pixSlotSize, pixSlotSize);

    const usableWidth = pixWidth - pixPadding * 2;
    const textAreaWidth = usableWidth - pixSlotSize - pixColumnGap;
    const stackPix = textAreaWidth < 260;
    const spacer = 20;

    if (stackPix) {
      const textWrap = Math.max(220, usableWidth);
      this.pixKeyLabel.style.wordWrapWidth = textWrap as never;
      this.noteLabel.style.wordWrapWidth = textWrap as never;
      const keyHeight = this.pixKeyLabel.getLocalBounds().height;
      const noteHeight = this.noteLabel.getLocalBounds().height;
      const textBlockHeight = keyHeight + 12 + noteHeight;
      const pixHeight = pixPadding * 2 + pixSlotSize + spacer + textBlockHeight;
      this.pixSection.setSize(pixWidth, pixHeight);
      this.pixSection.position.set(
        0,
        currentY + this.pixSection.boxHeight * 0.5,
      );
      const sectionTop = -this.pixSection.boxHeight * 0.5 + pixPadding;
      this.qrSlot.position.set(0, sectionTop + pixSlotSize * 0.5);
      const textX = -this.pixSection.boxWidth * 0.5 + pixPadding;
      const textTop = this.qrSlot.y + pixSlotSize * 0.5 + spacer;
      this.pixKeyLabel.position.set(textX, textTop);
      this.noteLabel.position.set(textX, textTop + keyHeight + 12);
    } else {
      const textWrap = Math.max(220, textAreaWidth);
      this.pixKeyLabel.style.wordWrapWidth = textWrap as never;
      this.noteLabel.style.wordWrapWidth = textWrap as never;
      const keyHeight = this.pixKeyLabel.getLocalBounds().height;
      const noteHeight = this.noteLabel.getLocalBounds().height;
      const textBlockHeight = keyHeight + 12 + noteHeight;
      const pixHeight = Math.max(
        pixPadding * 2 + pixSlotSize,
        pixPadding * 2 + textBlockHeight,
      );
      this.pixSection.setSize(pixWidth, pixHeight);
      this.pixSection.position.set(
        0,
        currentY + this.pixSection.boxHeight * 0.5,
      );
      const sectionTop = -this.pixSection.boxHeight * 0.5 + pixPadding;
      const sectionLeft = -this.pixSection.boxWidth * 0.5 + pixPadding;
      this.qrSlot.position.set(sectionLeft + pixSlotSize * 0.5, 0);
      const textX = this.qrSlot.x + pixSlotSize * 0.5 + pixColumnGap;
      this.pixKeyLabel.position.set(textX, sectionTop);
      this.noteLabel.position.set(textX, sectionTop + keyHeight + 12);
    }

    this.qrSlotLabel.visible = !this.qrSprite;

    if (this.qrSprite) {
      const tex = this.qrSprite.texture;
      if (tex.width > 0 && tex.height > 0) {
        const maxSize = this.qrSlot.boxWidth - 20;
        const scale = Math.min(maxSize / tex.width, maxSize / tex.height, 1);
        this.qrSprite.scale.set(scale);
      }
      this.qrSprite.position.set(0, 0);
    }
  }

  public setGiftImage(texture: Texture) {
    if (this.imageSprite) this.imageSprite.destroy();
    this.imageSprite = new Sprite(texture);
    this.imageSprite.anchor.set(0.5);
    this.imageSlot.addChild(this.imageSprite);
    this.resize(
      (this.parent as Container).width,
      (this.parent as Container).height,
    );
  }

  public setPixQr(texture: Texture) {
    if (this.qrSprite) this.qrSprite.destroy();
    this.qrSprite = new Sprite(texture);
    this.qrSprite.anchor.set(0.5);
    this.qrSlot.addChild(this.qrSprite);
    this.resize(
      (this.parent as Container).width,
      (this.parent as Container).height,
    );
  }

  public setPixKey(text: string) {
    this.pixKeyLabel.text = `Chave PIX: ${text}`;
  }
}
