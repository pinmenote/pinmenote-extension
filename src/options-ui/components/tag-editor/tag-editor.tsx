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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

interface TagEditorProps {
  tags: string[];
}

export const TagEditor: FunctionComponent<TagEditorProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[] | undefined>(undefined);
  const loading = open && tagOptions === undefined;

  useEffect(() => {
    setTagOptions([]);
  }, []);

  return (
    <div>
      <p>Tag editor {props.tags}</p>
      <div style={{ width: 300 }}>
        <Autocomplete
          multiple
          freeSolo
          limitTags={3}
          defaultValue={[...props.tags]}
          size="small"
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => {
              // Add new option if not exists
              if (!tagOptions?.includes(option)) tagOptions?.push(option);
              // eslint-disable-next-line react/jsx-key
              return <Chip variant="outlined" label={option} {...getTagProps({ index })} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
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
    </div>
  );
};
