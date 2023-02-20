import React, { FunctionComponent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ObjTypeDto } from '../../../../common/model/obj.model';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

interface AddMenuItem {
  title: string;
  type: ObjTypeDto;
}

const addMenuItemList: AddMenuItem[] = [
  { title: 'Drawing', type: ObjTypeDto.Drawing },
  { title: 'Note', type: ObjTypeDto.Note },
  { title: 'Todo', type: ObjTypeDto.Todo }
];

export const BoardAddElementSearch: FunctionComponent = () => {
  const [anchorEl, setAnchorEl] = React.useState<undefined | HTMLElement>();
  const open = Boolean(anchorEl);

  const handleAddClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleMenuClick = (type: ObjTypeDto) => {
    handleClose();
    fnConsoleLog('BoardAddElementSearch->MenuItem->click', type);
  };

  return (
    <div>
      <IconButton onClick={handleAddClick}>
        <AddIcon />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {addMenuItemList.map((item, index) => (
          <MenuItem key={index} onClick={() => handleMenuClick(item.type)}>
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
