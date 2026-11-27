(() => {
  const root = new URL('../', document.currentScript.src);
  const draft = new URL(location.href).searchParams.get('preview') === 'draft';
  const source = draft ? new URL('https://raw.githubusercontent.com/maimang-studio/maimang-studio.github.io/main/') : root;
  const stamp = draft ? '?t=' + Date.now() : '';
  const groups = ['企业内部流程优化','AI 应用开发','AI 电商创作','产品设计创新'];
  const url = path => new URL(path, root).href;
  function element(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function replaceText(selector, text) {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  }
  function caseUrl(id) {
    return url('projects/' + id + '.html') + (draft ? '?preview=draft' : '');
  }
  function card(project, type, featured) {
    const link = element('a', 'project ' + (featured ? 'featured' : 'compact'));
    link.href = caseUrl(project.id);
    link.dataset.group = type.group;
    const art = element('div', featured ? 'cardart' : 'listicon');
    const path = project.cover;
    const prefix = draft ? '/editor-media/' : '/assets/covers/';
    if (path && path.startsWith(prefix) && !path.slice(prefix.length).match(/[/\\]/)) {
      const image = element('img');
      image.alt = project.title + '封面';
      image.src = new URL(prefix.slice(1) + encodeURIComponent(path.slice(prefix.length)), source).href + stamp;
      image.className = project.id === 'installer' ? 'cover-contain' : 'cover-photo';
      art.append(image);
    } else {
      art.classList.add('project-symbol');
      art.textContent = type.icon;
      art.setAttribute('aria-hidden', 'true');
    }
    const body = element('div', 'cardbody');
    const meta = element('div', 'meta');
    meta.append(element('span','',groups[Number(type.group)]),
      element('span', 'status' + (type.status === '已有案例' ? ' ready' : ''), type.status));
    body.append(meta, element('h3','',project.title), element('p','',project.summary));
    link.append(art, body, element('span','detailhint','查看案例'));
    return link;
  }
  function render(data, types) {
    const projects = data.projects;
    if (!Array.isArray(projects) || new Set(projects.map(p => p.id)).size !== Object.keys(types).length ||
        projects.length !== Object.keys(types).length || projects.some(p => !Object.hasOwn(types, p.id) || !p.title || !p.summary)) {
      throw Error('项目数据不完整');
    }
    const home = document.body.classList.contains('home');
    if (home) {
      replaceText('.herotext .intro', data.homeIntro);
      const hero = projects.find(p => p.id === 'cup-rack');
      replaceText('.herofigure .caption strong', hero.title);
      document.querySelector('.herofigure a')?.setAttribute('aria-label', '查看' + hero.title + '案例');
    }
    replaceText('#catalog-title', data.catalogTitle);
    replaceText('.catalog-intro', data.catalogIntro);
    const cards = document.querySelector('.cards');
    if (cards) {
      const shown = home ? projects.slice(0, 2) : projects;
      cards.replaceChildren(...shown.map((p,i) => card(p,types[p.id],i < 2)));
      if (document.querySelector('[data-filter]')) filterProjects();
    }
    const id = location.pathname.split('/').pop().replace(/\.html$/, '');
    const index = projects.findIndex(p => p.id === id);
    if (document.querySelector('.casehead') && index >= 0) {
      const p = projects[index];
      replaceText('.casehead h1',p.title);
      replaceText('.casehead > p',p.intro || p.summary);
      document.title = p.title + ' · 麦芒的产品手记';
      const next = projects[(index+1) % projects.length];
      const link = document.querySelector('.casenext a');
      if (link) { link.href = caseUrl(next.id); link.textContent = next.title; }
    }
    if (draft) {
      for (const link of document.querySelectorAll('a[href]')) {
        const target = new URL(link.href);
        if (target.origin === root.origin && !target.pathname.includes('/edit/') && !target.pathname.includes('/demos/')) {
          target.searchParams.set('preview','draft'); link.href = target.href;
        }
      }
    }
  }
  function banner(text) {
    const bar = element('aside','draft-banner');
    bar.setAttribute('role','status');
    const link = element('a','','返回编辑入口');
    link.href = url('edit/');
    bar.append(element('span','',text),link);
    document.body.prepend(bar);
    return bar;
  }
  async function read(address) {
    const response = await fetch(address, {cache:'no-cache', credentials:'omit'});
    if (!response.ok) throw Error('读取失败');
    return response.json();
  }
  if (location.protocol === 'file:') return;
  const bar = draft ? banner('正在读取最近保存的草稿…') : null;
  Promise.all([
    read(new URL(draft ? 'editor-data/draft.json' + stamp : 'assets/portfolio.json',source)),
    read(url('assets/project-types.json'))
  ]).then(([data,types]) => {
    render(data, types);
    if (bar) bar.firstChild.textContent = '草稿预览 · 当前展示最近保存的草稿';
  }).catch(() => {
    if (bar) {
      bar.firstChild.textContent = '草稿读取失败，请刷新重试。';
      document.querySelector('main')?.setAttribute('hidden','');
    }
  });
})();
