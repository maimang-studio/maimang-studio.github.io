"""Create a public snapshot of the saved portfolio and its covers."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
types = json.loads((root / 'assets/project-types.json').read_text(encoding='utf-8'))
draft = json.loads((root / 'editor-data/draft.json').read_text(encoding='utf-8'))
cover_dir = root / 'assets/covers'
cover_dir.mkdir(exist_ok=True)

def text_field(record, key, required=True):
    value = record.get(key) or ''
    if not isinstance(value, str) or (required and not value.strip()):
        raise ValueError(f'请填写有效的 {key}')
    return value.strip()

def snapshot_cover(value):
    if not value:
        return ''
    source_dir = (root / 'editor-media').resolve()
    prefix = '/editor-media/'
    name = value.removeprefix(prefix)
    source = (source_dir / name).resolve()
    if not value.startswith(prefix) or source.parent != source_dir or source.suffix.lower() not in {'.png','.jpg','.jpeg','.webp'}:
        raise ValueError('封面必须选择自作品集图片库')
    contents = source.read_bytes()
    if not (contents.startswith(b'\x89PNG\r\n\x1a\n') or contents.startswith(b'\xff\xd8\xff') or
            (contents[:4] == b'RIFF' and contents[8:12] == b'WEBP')):
        raise ValueError('无法识别封面图片')
    target = cover_dir / (hashlib.sha256(contents).hexdigest() + source.suffix.lower())
    target.write_bytes(contents)
    return '/' + target.relative_to(root).as_posix()

projects = draft['projects']
if len(projects) != len(types) or {p['id'] for p in projects} != set(types):
    raise ValueError('草稿必须包含现有的完整项目列表')
published = {key: text_field(draft,key) for key in ('homeIntro','catalogTitle','catalogIntro')}
published['projects'] = [
    {'id':p['id'], 'title':text_field(p,'title'), 'summary':text_field(p,'summary'),
     'intro':text_field(p,'intro',False), 'cover':snapshot_cover(p.get('cover'))}
    for p in projects
]
(root / 'assets/portfolio.json').write_text(json.dumps(published,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
