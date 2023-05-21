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
import React, { FunctionComponent } from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

interface Props {
  title: string;
  createdAt: number;
  words: string[];
  url?: string;
}

export const BoardItemFooter: FunctionComponent<Props> = (props) => {
  let url = '';
  if (props.url) {
    url = decodeURI(props.url).length > 50 ? decodeURI(props.url).substring(0, 50) : decodeURI(props.url);
  }
  return (
    <div>
      <p>{props.words.join(', ')}</p>
      <Link target="_blank" style={{ marginTop: 5, display: props.url ? 'inline-block' : 'none' }} href={props.url}>
        <Typography fontSize="0.9em" style={{ wordBreak: 'break-all' }}>
          {url}
        </Typography>
      </Link>
      <div>
        <p>
          {props.title} {props.createdAt}
        </p>
      </div>
    </div>
  );
};
