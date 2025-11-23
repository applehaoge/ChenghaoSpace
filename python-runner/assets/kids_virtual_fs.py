# -*- coding: utf-8 -*-
"""
轻量虚拟文件系统注入：
- 从 stdin 读取一行 JSON，包含 base64 文件内容
- 覆盖 open / pygame.image.load / pygame.mixer.Sound / numpy.load 以优先读取内存数据
- 未命中时回退到原生实现
"""
import base64
import builtins
import json
import sys
from io import BytesIO, StringIO

RAW = sys.stdin.readline()
VFS = {}
if RAW:
    try:
        payload = json.loads(RAW)
        files = payload.get("vfs", {}).get("files", {})
        for path, b64 in files.items():
            try:
                VFS[path.replace("\\", "/")] = base64.b64decode(b64)
            except Exception:
                continue
    except Exception:
        VFS = {}


def _normalize(path: str) -> str:
    return path.replace("\\", "/").lstrip("./")


_orig_open = builtins.open


def virtual_open(path, mode="r", *args, **kwargs):
    key = _normalize(path)
    if key in VFS:
        data = VFS[key]
        if "b" in mode:
            return BytesIO(data)
        return StringIO(data.decode("utf-8"))
    return _orig_open(path, mode, *args, **kwargs)


builtins.open = virtual_open

# pygame 兼容（如未安装则忽略）
try:
    import pygame

    _orig_pygame_load = pygame.image.load

    def _vfs_image_load(path, *args, **kwargs):
        key = _normalize(path)
        if key in VFS:
            return _orig_pygame_load(BytesIO(VFS[key]), *args, **kwargs)
        return _orig_pygame_load(path, *args, **kwargs)

    pygame.image.load = _vfs_image_load

    if hasattr(pygame, "mixer") and hasattr(pygame.mixer, "Sound"):
        _orig_sound = pygame.mixer.Sound

        def _vfs_sound(path, *args, **kwargs):
            key = _normalize(path)
            if key in VFS:
                return _orig_sound(BytesIO(VFS[key]), *args, **kwargs)
            return _orig_sound(path, *args, **kwargs)

        pygame.mixer.Sound = _vfs_sound
except Exception:
    pass

# numpy 兼容（文件流加载）
try:
    import numpy as np

    _orig_np_load = np.load

    def _vfs_np_load(file, *args, **kwargs):
        if isinstance(file, (str, bytes)):
            key = _normalize(file.decode() if isinstance(file, bytes) else file)
            if key in VFS:
                return _orig_np_load(BytesIO(VFS[key]), *args, **kwargs)
        return _orig_np_load(file, *args, **kwargs)

    np.load = _vfs_np_load
except Exception:
    pass
