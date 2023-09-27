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
import { COLOR_DEFAULT_GREY, COLOR_DEFAULT_RED } from '../../../../common/components/colors';
import React, { FunctionComponent, useState } from 'react';
import CommentIcon from '@mui/icons-material/Comment';
import { DATE_YEAR_SECOND } from '../../../../common/date-format.constraints';
import DataArrayIcon from '@mui/icons-material/DataArray';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { TagEditor } from '../../tag-editor/tag-editor';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { SettingsStore } from '../../../store/settings.store';
import { ObjHashtag, ObjHashtagList } from '../../../../common/model/obj/obj-hashtag.dto';

interface Props {
  title: string;
  createdAt: number;
  words: string[];
  tags: ObjHashtag[];
  url?: string;
  saveTags: (newTags: ObjHashtag[]) => void;
}

export const BoardItemFooter: FunctionComponent<Props> = (props) => {
  const [wordsVisible, setWordsVisible] = useState<boolean>(false);
  const [tagsVisible, setTagsVisible] = useState<boolean>(false);
  const handleWordsIconClick = () => {
    setWordsVisible(!wordsVisible);
  };

  const handleTagIconClick = () => {
    setTagsVisible(!tagsVisible);
  };

  let url = '';
  if (props.url) {
    url = decodeURI(props.url).length > 50 ? decodeURI(props.url).substring(0, 50) : decodeURI(props.url);
  }
  return (
    <div>
      <Link target="_blank" style={{ marginTop: 5, display: props.url ? 'inline-block' : 'none' }} href={props.url}>
        <Typography fontSize="0.9em" style={{ wordBreak: 'break-all' }}>
          {url}
        </Typography>
      </Link>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>{dayjs(props.createdAt).format(DATE_YEAR_SECOND)}</p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleWordsIconClick}
            title="Show / Hide indexed words"
            style={{ display: SettingsStore.settings?.expertMode ? 'flex' : 'none' }}
          >
            <DataArrayIcon style={{ color: wordsVisible ? COLOR_DEFAULT_RED : COLOR_DEFAULT_GREY }} />
          </IconButton>
          <IconButton title="Show / Hide tags" onClick={handleTagIconClick}>
            <TagIcon style={{ color: tagsVisible ? COLOR_DEFAULT_RED : COLOR_DEFAULT_GREY }} />
          </IconButton>
          {/*<IconButton style={{ marginTop: 4 }} title="Show / Hide comments">
            <CommentIcon />
          </IconButton>*/}
        </div>
      </div>
      <div style={{ display: wordsVisible ? 'inline-block' : 'none', maxHeight: 100, overflow: 'auto' }}>
        {props.words.join(', ')}
      </div>
      <div style={{ display: tagsVisible ? 'inline-block' : 'none' }}>
        <TagEditor tags={props.tags} saveCallback={props.saveTags} />
      </div>
    </div>
  );
};
