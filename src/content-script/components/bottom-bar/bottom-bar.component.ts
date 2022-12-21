import { PinObject } from '@common/model/pin.model';
import { VideoTimeComponent } from './video-time/video-time.component';
import { applyStylesToElement } from '@common/style.utils';

const elStyles = {
  'background-color': '#ffffff',
  display: 'none',
  'flex-direction': 'row',
  'justify-content': 'space-between',
  height: '15px',
  margin: '0',
  padding: '5px 5px 5px 5px',
  'align-items': 'center'
};

export class BottomBarComponent {
  private el = document.createElement('div');

  private videoTime: VideoTimeComponent;
  private shouldDisplay = false;

  constructor(private pin: PinObject) {
    this.videoTime = new VideoTimeComponent(pin.content.videoTime);
    this.shouldDisplay = pin.content.videoTime.length > 0;
  }

  render(): HTMLDivElement {
    applyStylesToElement(this.el, elStyles);

    this.el.appendChild(this.videoTime.render());

    return this.el;
  }

  cleanup(): void {
    this.videoTime.cleanup();
  }

  focusin(): void {
    if (this.shouldDisplay) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    if (this.shouldDisplay) this.el.style.display = 'none';
  }
}
