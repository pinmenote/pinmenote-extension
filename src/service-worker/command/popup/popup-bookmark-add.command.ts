import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../store/keys/object.store.keys';
import { fnConsoleLog } from '@common/fn/console.fn';
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;
import ICommand = Pinmenote.Common.ICommand;

export class PopupBookmarkAddCommand implements ICommand<Promise<void>> {
  constructor(private readonly msg: BookmarkDto) {}

  async execute(): Promise<void> {
    fnConsoleLog('PopupBookmarkAddCommand->execute', this.msg);
    if (!this.msg.url) {
      fnConsoleLog('PopupBookmarkAddCommand-> missing url !!!');
      return;
    }
    const key = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.msg.url?.href}`;
    await BrowserStorageWrapper.remove(key);
    await this.removeBookmarkFromList();
  }

  private async removeBookmarkFromList(): Promise<void> {
    if (!this.msg.url) return;
    const url = this.msg.url.href;
    const bookmarkList = (await BrowserStorageWrapper.get<string[] | undefined>(ObjectStoreKeys.BOOKMARK_LIST)) || [];
    await BrowserStorageWrapper.set(
      ObjectStoreKeys.BOOKMARK_LIST,
      bookmarkList.filter((u) => u !== url)
    );
  }
}
