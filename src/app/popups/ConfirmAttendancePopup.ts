import { List } from "@pixi/ui";
import { Container } from "pixi.js";
import { BasePopup } from "./BasePopup";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/TextInput";
import { INVITE } from "../data/invitation";

class GuestRow extends Container {
  public typeButton: Button;
  public removeButton: Button;
  public constructor() {
    super();
    this.typeButton = new Button({
      text: "Adulto",
      width: 140,
      height: 80,
      fontSize: 20,
    });
    this.typeButton.x = 200;
    this.typeButton.y = 0;
    this.addChild(this.typeButton);

    this.removeButton = new Button({
      text: "Remover",
      width: 140,
      height: 60,
      fontSize: 20,
    });
    this.removeButton.x = 360;
    this.removeButton.y = 0;
    this.addChild(this.removeButton);
  }
}

export class ConfirmAttendancePopup extends BasePopup {
  private list: List;
  private rows: GuestRow[] = [];
  private nameInputs: TextInput[] = [];
  private maxRows = 5;
  private addButton: Button;

  constructor() {
    super({
      text: "Confirmar presença",
      fontSize: 40,
      width: 860,
      height: 760,
    });

    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 40;
    if (this.doneButton.textView) this.doneButton.textView.text = "Concluir";

    this.list = new List({ type: "vertical", elementsMargin: 24 });
    this.list.x = 0;
    this.list.y = -this.panelBase.boxHeight * 0.5 + 160;
    this.panel.addChild(this.list);

    this.panel.eventMode = "static";

    this.addButton = new Button({
      text: "Adicionar convidado",
      width: 260,
      height: 80,
      fontSize: 24,
    });
    this.addButton.x = -140;
    this.addButton.y = this.panelBase.boxHeight * 0.5 - 40;
    this.addButton.onPress.connect(() => this.addRow());
    this.panel.addChild(this.addButton);

    this.addRow();
    this.updateAddButtonState();
    this.layoutRows();
    this.doneButton.onPress.connect(() => this.handleDone());
  }

  private addRow() {
    if (this.rows.length >= this.maxRows) return;
    const row = new GuestRow();
    const nameInput = new TextInput({
      width: 300,
      height: 80,
      placeholder: "Nome do convidado",
    });
    nameInput.x = -this.panelBase.boxWidth * 0.5 + 40 + 300 * 0.5;
    nameInput.y = 0;
    row.addChild(nameInput);

    this.rows.push(row);
    this.nameInputs.push(nameInput);
    this.list.addChild(row);
    this.layoutRows();

    row.typeButton.onPress.connect(() => {
      if (!row.typeButton.textView) return;
      const next =
        row.typeButton.textView.text === "Adulto" ? "Criança" : "Adulto";
      row.typeButton.textView.text = next;
    });

    row.removeButton.onPress.connect(() => this.removeRow(row));
    this.updateAddButtonState();
  }

  private removeRow(row: GuestRow) {
    const idx = this.rows.indexOf(row);
    if (idx >= 0) this.rows.splice(idx, 1);
    if (row.parent) row.parent.removeChild(row);
    const input = this.nameInputs[idx];
    if (input) input.destroy();
    this.nameInputs.splice(idx, 1);
    this.layoutRows();
    this.updateAddButtonState();
  }

  private updateAddButtonState() {
    const atLimit = this.rows.length >= this.maxRows;
    this.addButton.alpha = atLimit ? 0.5 : 1;
    this.addButton.eventMode = atLimit ? "none" : "static";
    if (this.addButton.textView) {
      this.addButton.textView.text = atLimit
        ? "Limite atingido"
        : "Adicionar convidado";
    }
  }

  public override resize(width: number, height: number): void {
    super.resize(width, height);
    this.list.x = 0;
    this.list.y = -this.panelBase.boxHeight * 0.5 + 160;
    this.addButton.x = -this.panelBase.boxWidth * 0.25;
    this.addButton.y = this.panelBase.boxHeight * 0.5 - 40;
    this.doneButton.x = this.panelBase.boxWidth * 0.25;
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 40;
    this.addButton.width = 260;
    this.doneButton.width = 220;
    this.layoutRows();
  }

  private layoutRows() {
    const boxW = this.panelBase.boxWidth;
    const leftPadding = 40;
    const inputWidth = 300;
    const gap = 20;
    const typeW = 140;
    const removeW = 140;
    this.rows.forEach((row, i) => {
      const input = this.nameInputs[i];
      if (input) {
        input.x = -boxW * 0.5 + leftPadding + inputWidth * 0.5;
        input.y = 0;
        input.repositionOverlay();
      }
      row.typeButton.x =
        -boxW * 0.5 + leftPadding + inputWidth + gap + typeW * 0.5;
      row.typeButton.y = 0;
      row.removeButton.x = row.typeButton.x + typeW * 0.5 + gap + removeW * 0.5;
      row.removeButton.y = 0;
    });
    type MaybeUpdatable = { update?: () => void };
    const maybe = this.list as unknown as MaybeUpdatable;
    if (typeof maybe.update === "function") maybe.update();
  }

  public override async hide() {
    this.nameInputs.forEach((i) => i.blur());
    await super.hide();
  }

  private handleDone() {
    const guests: { name: string; type: string }[] = [];
    for (let i = 0; i < this.rows.length; i++) {
      const name = this.nameInputs[i]?.getValue().trim() ?? "";
      if (!name) continue;
      const btn = this.rows[i].typeButton;
      const label = btn.textView?.text || "Adulto";
      const type = /adult/i.test(label) ? "Adulto" : "Criança";
      guests.push({ name, type });
    }
    if (guests.length === 0) return;

    const lines = guests.map((g, idx) => `${idx + 1}. ${g.name} - ${g.type}`);
    const message = `Confirmação de presença:\n${lines.join("\n")}`;
    const phone = INVITE.whatsappPhone as string | undefined;
    const clean = (phone || "").replace(/[^0-9]/g, "");
    const url = clean
      ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }
}
