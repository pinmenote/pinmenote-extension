import { HtmlContent } from './html.model';

interface ObjPagePin {
  title: string;
  pinList: PinData[];
}

interface PinData {
  screenshot?: string;
  content: HtmlContent;
  border: PinBorderData;
}

interface PinBorderData {
  radius: string;
  style: string;
}
