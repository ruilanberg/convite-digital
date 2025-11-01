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

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
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
      window.open("https://maps.app.goo.gl/p6gTYMxGi3NgV2H29", "_blank");
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

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.invitation.update();
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;

    this.confirmAttendanceButton.x = width / 2 - 200;
    this.confirmAttendanceButton.y = height - 100;

    this.giftSuggestionButton.x = width / 2;
    this.giftSuggestionButton.y = height - 100;

    this.accessLocationButton.x = width / 2 + 200;
    this.accessLocationButton.y = height - 100;

    this.invitation.resize(width, height);
  }

  /** Show screen with animations */
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

  /** Hide screen with animations */
  public async hide() {}

  public blur() {}

  private startBgmOnce() {
    if (this.bgmStarted) return;
    this.bgmStarted = true;
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
  }
}
