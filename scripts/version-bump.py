#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import json


def load_version() -> list[str]:
    with open('package.json', 'r') as f:
        data = json.load(f)
    return data['version'].split('.')


def bump_version(version: list[str]):
    version[-1] = str(int(version[-1])+1)
    return '.'.join(version)


def write_version(fpath: str, version: str):
    with open(fpath, 'r') as f:
        data = json.load(f)
        data['version'] = version
    with open(fpath, 'w+') as f:
        f.write(json.dumps(data, indent=2))


def save_manifest(version: str):
    data = os.listdir('src')
    for d in data:
        if d.endswith('.json') and d.startswith('manifest'):
            fpath = os.path.join('src', d)
            write_version(fpath, version)


def save_version(version: str):
    write_version('package.json', version)
    save_manifest(version)


if __name__ == '__main__':
     version = load_version()
     version = bump_version(version)
     save_version(version)
