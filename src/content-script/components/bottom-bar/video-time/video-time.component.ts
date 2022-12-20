import { ContentVideoTime } from '@common/model/html.model';
import { applyStylesToElement } from '@common/style.utils';
import { fnFindElementXpath } from '@common/fn/xpath.fn';
import { fnVideoSecondsTime } from '@common/fn/date.fn';

const elStyles = {
  display: 'flex',
  'flex-direction': 'row',
  padding: '0',
  margin: '0',
  'user-select': 'none',
  cursor: 'pointer'
};

const titleStyle = {
  'font-weight': 'bold',
  'margin-right': '5px'
};

export class VideoTimeComponent {
  private el = document.createElement('div');
  private video?: ContentVideoTime;

  constructor(private videoTime: ContentVideoTime[]) {}

  render(): HTMLDivElement {
    applyStylesToElement(this.el, elStyles);
    if (this.videoTime.length > 0) {
      const title = document.createElement('div');
      applyStylesToElement(title, titleStyle);
      title.innerText = 'video';
      this.el.appendChild(title);

      this.video = this.videoTime[0];
      const from = document.createElement('div');
      from.innerText = fnVideoSecondsTime(this.video.currentTime);

      this.el.appendChild(from);

      const between = document.createElement('div');
      between.innerText = '-';
      this.el.appendChild(between);
      /*
            const to = document.createElement('div');
            to.innerText = fnVideoSecondsTime(this.video.currentTime+this.video.displayTime);

            this.el.appendChild(to);*/
    }

    this.el.addEventListener('click', this.handleNavigateClick);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleNavigateClick);
  }

  private handleNavigateClick = () => {
    if (!this.video) return;
    const value = fnFindElementXpath(this.video.xpath);
    const node = value.singleNodeValue as HTMLVideoElement;
    if (!node) return;
    node.currentTime = this.video.currentTime;
  };
}
