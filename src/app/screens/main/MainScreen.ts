import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { Button } from "../../ui/Button";

import { GiftSuggestionPopup } from "../../popups/GiftSuggestion.Popup";
import { ConfirmAttendancePopup } from "../../popups/ConfirmAttendancePopup";
import { Invitation } from "./Invitation";
import { INVITE } from "../../data/invitation";

export class MainScreen extends Container {
  public static assetBundles = ["main"];

  public mainContainer: Container;

  private confirmAttendanceButton: FancyButton;
  private accessLocationButton: FancyButton;
  private giftSuggestionButton: FancyButton;

  private invitation: Invitation;
  private paused = false;
  private bgmStarted = false;
  private _gestureHandler?: () => void;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    this.invitation = new Invitation();

    this.confirmAttendanceButton = new Button({
      text: "Confirmar presença",
      width: 175,
      height: 175,
    });
    this.confirmAttendanceButton.onPress.connect(() => {
      this.startBgmOnce();
      engine().navigation.presentPopup(ConfirmAttendancePopup);
    });
    this.addChild(this.confirmAttendanceButton);

    this.accessLocationButton = new Button({
      text: "Acessar localização",
      width: 175,
      height: 175,
    });
    this.accessLocationButton.onPress.connect(() => {
      this.startBgmOnce();
      window.open(INVITE.mapUrl, "_blank");
    });
    this.addChild(this.accessLocationButton);

    this.giftSuggestionButton = new Button({
      text: "Sugestão de presente",
      width: 175,
      height: 175,
    });
    this.giftSuggestionButton.onPress.connect(() => {
      this.startBgmOnce();
      engine().navigation.presentPopup(GiftSuggestionPopup);
    });
    this.addChild(this.giftSuggestionButton);

    // Start BGM on the very first user gesture anywhere
    this._gestureHandler = () => {
      this.startBgmOnce();
      document.removeEventListener("pointerdown", this._gestureHandler!);
      document.removeEventListener("touchstart", this._gestureHandler!);
      document.removeEventListener("keydown", this._gestureHandler!);
    };
    document.addEventListener("pointerdown", this._gestureHandler, {
      once: true,
    } as AddEventListenerOptions);
    document.addEventListener("touchstart", this._gestureHandler, {
      once: true,
    } as AddEventListenerOptions);
    document.addEventListener("keydown", this._gestureHandler, {
      once: true,
    } as AddEventListenerOptions);
  }

  public prepare() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.invitation.update();
  }

  public reset() {}

  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;

    const isDesktop = width >= 1024;
    const btnH = isDesktop ? 100 : 175;
    const btnW = isDesktop ? 260 : 175;
    const bottomMargin = isDesktop ? 120 : 300;
    const gap = isDesktop ? 220 : 200;

    // size
    this.confirmAttendanceButton.width = btnW;
    this.confirmAttendanceButton.height = btnH;
    this.accessLocationButton.width = btnW;
    this.accessLocationButton.height = btnH;
    this.giftSuggestionButton.width = btnW;
    this.giftSuggestionButton.height = btnH;

    // position
    this.confirmAttendanceButton.x = width / 2 - gap;
    this.confirmAttendanceButton.y = height - bottomMargin;

    this.giftSuggestionButton.x = width / 2;
    this.giftSuggestionButton.y = height - bottomMargin;

    this.accessLocationButton.x = width / 2 + gap;
    this.accessLocationButton.y = height - bottomMargin;

    this.invitation.resize(width, height);
  }

  public async show(): Promise<void> {
    // BGM starts on first user gesture (see constructor/startBgmOnce)

    const elementsToAnimate = [
      this.confirmAttendanceButton,
      this.accessLocationButton,
      this.giftSuggestionButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
    this.invitation.show(this);
  }

  public async hide() {}

  public blur() {}

  private startBgmOnce() {
    if (this.bgmStarted) return;
    this.bgmStarted = true;
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
  }
}

