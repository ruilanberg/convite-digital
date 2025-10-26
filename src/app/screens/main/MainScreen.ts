import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container, TextStyle } from "pixi.js";


import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { Bouncer } from "./Bouncer";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;

  private confirmAttendanceButton: FancyButton;
  private accessLocationButton: FancyButton;
  private giftSuggestionButton: FancyButton;

  private bouncer: Bouncer;
  private paused = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    this.bouncer = new Bouncer();

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };

    const textStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 48, // tamanho base
    fill: 0xffffff,
    align: 'center',
});

    this.confirmAttendanceButton = new Button({
      text: "Confirmar presença",
      width: 175,
      height: 175,
    });
    this.confirmAttendanceButton.padding = 12;
    this.confirmAttendanceButton.onPress.connect(() => this.bouncer.add());
    this.addChild(this.confirmAttendanceButton);

    this.accessLocationButton = new Button({
      text: "Acessar localizaçao",
      width: 175,
      height: 175,
    });
    this.accessLocationButton.onPress.connect(() => this.bouncer.add());
    this.addChild(this.accessLocationButton);

    this.giftSuggestionButton = new Button({
      text: "Sugestao de presente",
      width: 175,
      height: 175,
    });
    this.giftSuggestionButton.onPress.connect(() => this.bouncer.remove());
    this.addChild(this.giftSuggestionButton);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.bouncer.update();
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
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

    this.bouncer.resize(width, height);
  }

  public ResizeText() {
    const maxWidth = this.confirmAttendanceButton.width * 0.8; // 80% da largura do botão
    const maxHeight = this.confirmAttendanceButton.height * 0.6; // 60% da altura do botão
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

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
    this.bouncer.show(this);
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
