/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ContentExtensionData, ContentSettingsData } from '@common/model/settings.model';
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import { BusMessageType } from '@common/model/bus.model';
import { ContentIconColorCommand } from './content-icon-color.command';
import { ObjectStoreKeys } from '../../store/keys/object.store.keys';
import { SettingsKeys } from '../../store/keys/settings.keys';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;
import LinkDto = Pinmenote.Pin.LinkDto;
import BookmarkDto = Pinmenote.Bookmark.BookmarkDto;

export class ContentSettingsCommand implements ICommand<void> {
  constructor(private data: ContentExtensionData) {}

  async execute(): Promise<void> {
    await new ContentIconColorCommand(this.data.theme).execute();

    const settingsData = await BrowserStorageWrapper.get<ContentSettingsData>(SettingsKeys.CONTENT_SETTINGS_KEY);

    let link = await BrowserStorageWrapper.get<LinkDto | undefined>(ObjectStoreKeys.OBJECT_LINK);
    fnConsoleLog('ContentSettingsCommand', link, this.data.href);
    if (this.data.href === link?.url.href) {
      await BrowserStorageWrapper.remove(ObjectStoreKeys.OBJECT_LINK);
    } else {
      link = undefined;
    }

    const bookmarkKey = `${ObjectStoreKeys.OBJECT_BOOKMARK}:${this.data.href}`;
    const bookmark = await BrowserStorageWrapper.get<BookmarkDto | undefined>(bookmarkKey);

    const data: ContentSettingsData = {
      ...settingsData,
      isBookmarked: !!bookmark,
      link
    };
    await sendTabMessage<ContentSettingsData>({ type: BusMessageType.CONTENT_SETTINGS, data });
  }
}
