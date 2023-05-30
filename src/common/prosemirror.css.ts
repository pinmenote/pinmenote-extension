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
// https://github.com/parcel-bundler/parcel/issues/7941
// https://github.com/parcel-bundler/parcel/issues/8375
export const prosemirrorCss = `
.ProseMirror p {
    font-family: Roboto, serif;
    font-size: 1em;
}

.ProseMirror:focus {
    outline: none;
}

.ProseMirror p:first-child {
    margin: 0px 0px 4px;
}

.ProseMirror p {
    margin: 0px 0px 4px;
    padding: 0;
    border: none;
}

.ProseMirror ol {
    padding-left: 20px;
    list-style-type: decimal;
    border: none;
}

.ProseMirror ul {
    padding-left: 20px;
    list-style-type: disc;
    border: none;
}

.ProseMirror li {
    position: relative;
    border: none;
}

/* HEADER STYLES */

.ProseMirror h1 {
    display: block;
    margin: 0.67em 0;
    font-size: 2em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror h2 {
    display: block;
    margin: 0.83em 0;
    font-size: 1.5em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror h3 {
    display: block;
    margin: 1em 0;
    font-size: 1.17em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror h4 {
    display: block;
    margin: 1.33em 0;
    font-size: 1em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror h5 {
    display: block;
    margin: 1.67em 0;
    font-size: .83em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror h6 {
    display: block;
    margin: 2.33em 0;
    font-size: .67em;
    font-family: Roboto, serif;
    font-weight: bold;
    border: none;
    color: #000000;
}

.ProseMirror {
    min-height: 30px;
    height: fit-content;
    outline: none;
    overflow: auto;
    border: 1px dashed #000000;
    font-size: 11pt;
    font-family: Roboto, serif;
    color: #000000;
    background-color: #ffffff;
    font-weight: normal;
    text-transform: none;
    line-height: 100%;
    box-shadow: none;
    margin: 2px;
    padding: 2px;
    text-align: left;
    white-space: pre-wrap;
}
`;
