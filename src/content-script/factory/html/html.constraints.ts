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
import { PageSkipAttribute } from '@pinmenote/page-compute';

export class HtmlConstraints {
  // keep this in constraints for now
  /* eslint-disable max-len */
  static YOUTUBE_SKIP: PageSkipAttribute[] = [
    {
      key: 'class',
      value: 'ytp-suggested-action-badge-expanded-content-container'
    },
    {
      key: 'class',
      value:
        'ytp-button ytp-suggested-action-badge ytp-suggested-action-badge-with-controls ytp-suggested-action-badge-expanded'
    },
    {
      key: 'class',
      value: 'ytp-featured-product-container'
    }
  ];
  static SKIP_URLS: { [key: string]: PageSkipAttribute[] } = {
    'www.youtube.com': this.YOUTUBE_SKIP,
    'youtube.com': this.YOUTUBE_SKIP
  };
}
