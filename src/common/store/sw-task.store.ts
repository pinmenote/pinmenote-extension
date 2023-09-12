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
import { SwTaskData, SwTaskDataType, SwTaskType } from '../model/sw-task.model';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ObjectStoreKeys } from '../keys/object.store.keys';
import { fnUid } from '../fn/fn-uid';

export class SwTaskStore {
  static addTask = async (type: SwTaskType, data: SwTaskDataType): Promise<void> => {
    const queue = await this.getQueue();
    queue.push({
      uid: fnUid(),
      type,
      data
    });
    await this.saveQueue(queue);
  };

  static saveQueue = async (queue: SwTaskData[]): Promise<void> => {
    await BrowserStorage.set(ObjectStoreKeys.TASK_QUEUE, queue);
  };

  static getQueue = async (): Promise<SwTaskData[]> => {
    const tasks = await BrowserStorage.get<SwTaskData[] | undefined>(ObjectStoreKeys.TASK_QUEUE);
    return tasks || [];
  };
}
