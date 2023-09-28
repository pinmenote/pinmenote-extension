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
import React, { FunctionComponent, useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { ObjHashtag } from '../../../common/model/obj/obj-hashtag.dto';
import TextField from '@mui/material/TextField';
import { BoardItemMediator } from '../board/board-item.mediator';

interface Props {
  tags: ObjHashtag[];
  saveCallback: (newTags: ObjHashtag[]) => void;
}

const TAG_LIMIT = 5;

export const TagEditor: FunctionComponent<Props> = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string[]>([...props.tags.map((t) => t.value)]);
  const [tagsChanged, setTagsChanged] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<string[] | undefined>(undefined);
  const loading = open && tagOptions === undefined;

  useEffect(() => {
    setTimeout(async () => {
      const tags = await BoardItemMediator.fetchTags();
      setTagOptions(tags);
    }, 100);
  }, []);

  const handleSave = () => {
    props.saveCallback(
      currentValue.map((t) => {
        return { value: t };
      })
    );
    setTagsChanged(false);
  };

  const handleCancel = () => {
    setCurrentValue([...props.tags.map((t) => t.value)]);
    setTagsChanged(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: 378 }}>
          <Autocomplete
            multiple
            freeSolo
            limitTags={TAG_LIMIT}
            value={currentValue}
            sx={{ fontSize: '0.8em' }}
            size="small"
            open={open}
            onOpen={() => setOpen(true)}
            onChange={(event: any, newValue: string[]) => {
              const propTags = props.tags.map((t) => t.value).sort();
              propTags.toString() === newValue.sort().toString() ? setTagsChanged(false) : setTagsChanged(true);
              setCurrentValue(newValue);
            }}
            onClose={() => setOpen(false)}
            renderTags={(values: readonly string[], getTagProps) => {
              const components = [];
              for (let index = 0; index < values.length; index++) {
                const option = values[index];
                // Add new option if not exists
                if (!tagOptions?.includes(option)) tagOptions?.push(option);
                // eslint-disable-next-line react/jsx-key
                components.push(
                  <Chip
                    variant="outlined"
                    style={{ fontSize: '0.9em', margin: 0, height: 'auto' }}
                    label={option}
                    {...getTagProps({ index })}
                  />
                );
              }
              return components;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Tags"
                InputLabelProps={{ sx: { fontSize: '1em' }, ...params.InputLabelProps }}
                InputProps={{
                  ...params.InputProps,
                  sx: { fontSize: '1em' },
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  )
                }}
              />
            )}
            options={tagOptions || []}
          />
        </div>
        <div
          style={{
            marginTop: 5,
            display: tagsChanged ? 'flex' : 'none',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Button size="small" variant="outlined" onClick={handleSave}>
            Save
          </Button>
          <Button size="small" variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
