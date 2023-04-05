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
export const CIRCLE_PRELOADER_SVG = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <circle r="25" fill="red" cx="25" cy="25">
      <animate
              attributeName="r"
              dur="1s"
              values="10;25;10"
              repeatCount="indefinite" />
    </circle>
  </svg>`;
