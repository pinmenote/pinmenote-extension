import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import ICommand = Pinmenote.Common.ICommand;
import PinUrl = Pinmenote.Pin.PinUrl;

export class BookmarkRemoveCommand implements ICommand<Promise<void>> {
  constructor(private url: PinUrl) {}

  async execute(): Promise<void> {
    const key = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.url.href}`;
    await BrowserStorageWrapper.remove(key);
    await this.removeBookmarkFromList(this.url);
  }

  private async removeBookmarkFromList(url: PinUrl): Promise<void> {
    const bookmarkList = (await BrowserStorageWrapper.get<string[] | undefined>(ObjectStoreKeys.BOOKMARK_LIST)) || [];
    await BrowserStorageWrapper.set(
      ObjectStoreKeys.BOOKMARK_LIST,
      bookmarkList.filter((u) => u !== url.href)
    );
  }
}
