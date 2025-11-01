import { BasePopup } from "./BasePopup";

export class ConfirmAttendancePopup extends BasePopup {
  constructor() {
    super({
      text: "Confirmar presença",
      fontSize: 40,
    });
  }
}
