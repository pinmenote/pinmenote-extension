import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;
import ICommand = Pinmenote.Common.ICommand;

export class PopupBookmarkRemoveCommand implements ICommand<Promise<void>> {
  constructor(private readonly msg: BookmarkDto) {}

  async execute(): Promise<void> {
    fnConsoleLog('PopupBookmarkRemoveCommand->execute', this.msg);
    if (!this.msg.url) {
      fnConsoleLog('PopupBookmarkRemoveCommand-> missing url !!!');
      return;
    }
    const key = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.msg.url.href}`;
    await BrowserStorageWrapper.remove(key);
    await this.addBookmarkToList();
  }

  private async addBookmarkToList(): Promise<void> {
    if (!this.msg.url) return;
    const url = this.msg.url.href;
    const bookmarkList = (await BrowserStorageWrapper.get<string[] | undefined>(ObjectStoreKeys.BOOKMARK_LIST)) || [];
    bookmarkList.push(url);
    await BrowserStorageWrapper.set(ObjectStoreKeys.BOOKMARK_LIST, bookmarkList);
  }
}
