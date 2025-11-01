import { animate } from "motion";

import { randomFloat } from "../../../engine/utils/random";
import { waitFor } from "../../../engine/utils/waitFor";

import type { MainScreen } from "./MainScreen";
import { LetterBackground } from "./LetterBackground";

export class Invitation {
  private static readonly LOGO_COUNT = 3;
  private static readonly ANIMATION_DURATION = 1;
  private static readonly WAIT_DURATION = 0.5;

  public screen!: MainScreen;

  private allLogoArray: LetterBackground[] = [];
  private activeLogoArray: LetterBackground[] = [];
  private yMin = -400;
  private yMax = 400;
  private xMin = -400;
  private xMax = 400;

  public async show(screen: MainScreen): Promise<void> {
    this.screen = screen;

    for (let i = 0; i < Invitation.LOGO_COUNT; i++) {
      this.add();
      await waitFor(Invitation.WAIT_DURATION);
    }
  }

  public add(): void {
    const width = randomFloat(this.xMin, this.xMax);
    const height = randomFloat(this.yMin, this.yMax);
    const logo = new LetterBackground();

    logo.alpha = 0;
    logo.position.set(width, height);
    animate(logo, { alpha: 1 }, { duration: Invitation.ANIMATION_DURATION });
    this.screen.mainContainer.addChild(logo);
    this.allLogoArray.push(logo);
    this.activeLogoArray.push(logo);
  }

  public remove(): void {
    const logo = this.activeLogoArray.pop();
    if (logo) {
      animate(logo, { alpha: 0 }, { duration: Invitation.ANIMATION_DURATION })
        .then(() => {
          this.screen.mainContainer.removeChild(logo);
          const index = this.allLogoArray.indexOf(logo);
          if (index !== -1) this.allLogoArray.splice(index, 1);
        })
        .catch((error) => {
          console.error("Error during logo removal animation:", error);
        });
    }
  }

  public update(): void {
    // No-op for now
  }

  public resize(w: number, h: number): void {
    this.xMin = -w / 2;
    this.xMax = w / 2;
    this.yMin = -h / 2;
    this.yMax = h / 2;
  }
}
