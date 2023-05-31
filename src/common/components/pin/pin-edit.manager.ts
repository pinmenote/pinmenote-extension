/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { PinComponent } from './pin.component';
import { fnConsoleLog } from '../../fn/fn-console';

enum VisibleState {
  None = 1,
  DrawBar,
  PinEditBar,
  DownloadBar
}

export class PinEditManager {
  private takingScreenshot = false;

  private prevState = VisibleState.None;

  constructor(private parent: PinComponent) {}

  get isScreenshot(): boolean {
    return this.takingScreenshot;
  }

  startDraw = () => {
    this.parent.drawComponent.drawArea.canDraw = true;
    this.parent.topBar.drawVisibleIcon.hide();
    this.parent.topBar.drawActionIcon.hide();
    this.changeVisibleBar(VisibleState.DrawBar);
  };

  stopDraw = () => {
    this.parent.drawComponent.drawArea.canDraw = false;
    this.stopEdit();
    this.parent.topBar.drawVisibleIcon.show();
    this.parent.topBar.drawActionIcon.show();
  };

  showDraw = () => {
    this.parent.drawComponent.focusin();
  };

  hideDraw = () => {
    this.parent.drawComponent.focusout();
  };

  startDownload = () => {
    this.changeVisibleBar(VisibleState.DownloadBar);
  };

  startPinEdit = () => {
    this.changeVisibleBar(VisibleState.PinEditBar);
  };

  stopEdit(): void {
    this.changeVisibleBar(VisibleState.None);
  }

  showText = () => {
    this.parent.text.show();
  };

  hideText = () => {
    this.parent.text.hide();
  };

  showScreenshot = (): void => {
    this.takingScreenshot = false;
    this.parent.topBar.focusin();
    this.parent.downloadBar.show();
  };

  hideScreenshot = (): void => {
    this.takingScreenshot = true;
    this.parent.topBar.focusout();
    this.parent.downloadBar.hide();
  };

  private changeVisibleBar(nextState: VisibleState) {
    fnConsoleLog('PinComponent->changeVisibleBar', nextState);
    // Draw cleanup
    if (this.prevState === VisibleState.DrawBar) {
      this.parent.drawBar.hide();
      this.parent.topBar.drawTurnoff();
    }

    // Edit cleanup
    if (this.prevState === VisibleState.PinEditBar) {
      this.parent.editBar.hide();
      this.parent.topBar.editTurnOff();
    }

    // Download cleanup
    if (this.prevState === VisibleState.DownloadBar) {
      this.parent.downloadBar.hide();
      this.parent.topBar.downloadTurnoff();
    }

    switch (nextState) {
      case VisibleState.None:
        this.parent.topBar.movedown();
        if (!this.parent.model.local.drawVisible) this.parent.drawComponent.focusout();
        break;
      case VisibleState.PinEditBar:
        this.parent.topBar.moveup();

        this.parent.editBar.show();
        break;
      case VisibleState.DrawBar:
        this.parent.topBar.moveup();
        this.parent.drawComponent.focusin();
        this.parent.drawBar.show();
        break;
      case VisibleState.DownloadBar:
        this.parent.topBar.moveup();
        this.parent.downloadBar.show();
        break;
    }
    this.prevState = nextState;
  }
}
