export enum ObjViewTypeDto {
  Screenshot = 'SCREENSHOT',
  Html = 'HTML'
}

export interface ObjLocalDto {
  visible: boolean;
  currentView: ObjViewTypeDto;
}

export interface ObjUrlDto {
  href: string;
  origin: string;
  pathname: string;
  search: string;
}

export interface ObjLinkDto {
  url: ObjUrlDto;
}

export interface ObjIdentityDto {
  user: string;
}

export interface ObjEncryptionDto {
  encrypted: boolean;
}

export enum ObjTypeDto {
  PageBookmark = 'PAGE_BOOKMARK',
  PageNote = 'PAGE_NOTE',
  PagePin = 'PAGE_PIN',
  PageLink = 'PAGE_LINK',
  Note = 'NOTE',
  Drawing = 'DRAWING'
}

export interface ObjDto {
  id: number;
  uid: string;
  version: number;
  type: ObjTypeDto;
  updatedAt: string;
  createdAt: string;
  local: ObjLocalDto;
  link?: ObjLinkDto;
  identity?: ObjIdentityDto;
  encryption: ObjEncryptionDto;
  data: any;
}
