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
import { SwTaskData, SwTaskType } from '../../common/model/sw-task.model';
import { IndexWordsAddCommand } from '../command/task/index-words-add.command';
import { IndexWordsRemoveCommand } from '../command/task/index-words-remove.command';
import { SwTaskStore } from '../../common/store/sw-task.store';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { fnSleep } from '../../common/fn/fn-sleep';

export class TaskExecutor {
  private static runningTask?: string;
  static async dequeue() {
    const queue = await SwTaskStore.getQueue();
    fnConsoleLog('TaskExecutor.dequeue', queue.length);
    await this.execute(queue);
  }

  static async execute(queue: SwTaskData[]) {
    if (queue.length === 0) return;
    const task = queue[0];
    if (task.uid === this.runningTask) return;

    fnConsoleLog('TaskExecutor->execute', task);
    this.runningTask = task.uid;

    switch (task.type) {
      case SwTaskType.WORDS_ADD_INDEX:
        await new IndexWordsAddCommand(task, async (t) => {
          await this.updateTask(t);
        }).execute();
        break;
      case SwTaskType.WORDS_REMOVE_INDEX:
        await new IndexWordsRemoveCommand(task, async (t) => {
          await this.updateTask(t);
        }).execute();
        break;
    }

    queue.shift();
    await SwTaskStore.saveQueue(queue);
    this.runningTask = undefined;
    // Try empty queue
    if (queue.length > 0) {
      await fnSleep(1000);
      await this.dequeue();
    }
  }

  private static updateTask = async (task: SwTaskData): Promise<void> => {
    const queue = await SwTaskStore.getQueue();
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].uid == task.uid) {
        queue[i] = task;
        break;
      }
    }
    await SwTaskStore.saveQueue(queue);
  };
}
