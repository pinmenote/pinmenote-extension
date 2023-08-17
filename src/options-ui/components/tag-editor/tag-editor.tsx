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
import TextField from '@mui/material/TextField';
import { fnConsoleLog } from '../../../common/fn/fn-console';

interface Props {
  tags: string[];
  saveCallback: (newTags: string[]) => void;
}

export const TagEditor: FunctionComponent<Props> = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string[]>([...props.tags]);
  const [tagsChanged, setTagsChanged] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<string[] | undefined>(undefined);
  const loading = open && tagOptions === undefined;

  useEffect(() => {
    setTagOptions([]);
  }, []);

  const handleSave = () => {
    props.saveCallback(currentValue);
    setTagsChanged(false);
  };

  const handleCancel = () => {
    setCurrentValue([...props.tags]);
    setTagsChanged(false);
  };

  return (
    <div>
      <p>Tags {tagsChanged}</p>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: 378 }}>
          <Autocomplete
            multiple
            freeSolo
            limitTags={3}
            value={currentValue}
            size="small"
            open={open}
            onOpen={() => setOpen(true)}
            onChange={(event: any, newValue: string[]) => {
              const missing = newValue.filter((item) => props.tags.indexOf(item) < 0);
              fnConsoleLog('TagEditor->diff', props.tags, newValue, missing);
              missing.length > 0 ? setTagsChanged(true) : setTagsChanged(false);

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
                components.push(<Chip variant="outlined" label={option} {...getTagProps({ index })} />);
              }
              return components;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add tags"
                InputProps={{
                  ...params.InputProps,
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
          <Button size="medium" variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="medium" variant="outlined" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
