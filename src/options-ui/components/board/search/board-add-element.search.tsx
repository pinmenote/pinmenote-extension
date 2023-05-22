import React, { FunctionComponent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { ObjTypeDto } from '../../../../common/model/obj/obj.dto';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

interface AddMenuItem {
  title: string;
  type: ObjTypeDto;
  icon: React.ReactNode;
}

const addMenuItemList: AddMenuItem[] = [{ title: 'Note', type: ObjTypeDto.Note, icon: <NoteOutlinedIcon /> }];

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
        <AddIcon sx={{ color: '#ffffff' }} />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {addMenuItemList.map((item, index) => (
          <MenuItem key={index} onClick={() => handleMenuClick(item.type)} style={{ padding: 10, minWidth: 150 }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
