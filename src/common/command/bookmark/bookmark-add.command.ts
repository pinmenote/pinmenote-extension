import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ObjNextIdCommand } from '../obj/obj-next-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;
import PinUrl = Pinmenote.Pin.PinUrl;

export class BookmarkAddCommand implements ICommand<Promise<BookmarkDto>> {
  constructor(private value: string, private url: PinUrl) {}

  async execute(): Promise<BookmarkDto> {
    const key = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.url.href}`;
    const id = await new ObjNextIdCommand().execute();
    const data: BookmarkDto = {
      id,
      value: this.value,
      url: this.url,
      isDirectory: false
    };
    await BrowserStorageWrapper.set(key, data);
    return data;
  }
}
