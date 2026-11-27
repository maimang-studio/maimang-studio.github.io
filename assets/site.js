// Bookmarks from the original one-page portfolio keep their category selection.
if (document.body.classList.contains('home')) {
  const previousUrl = new URL(location.href);
  if (previousUrl.hash === '#projects' || previousUrl.searchParams.has('group')) {
    const catalog = new URL('portfolio/index.html', previousUrl);
    catalog.search = previousUrl.search;
    catalog.hash = '#projects';
    location.replace(catalog.href);
  }
}
const filters = [...document.querySelectorAll('[data-filter]')];

function filterProjects(selected = new URL(location.href).searchParams.get('group') || 'all') {
  const cards = [...document.querySelectorAll('[data-group]')];
  const group = filters.some(button => button.dataset.filter === selected) ? selected : 'all';
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === group));
  for (const card of cards) card.hidden = group !== 'all' && card.dataset.group !== group;
  document.getElementById('filter-result').textContent = '显示 ' + cards.filter(card => !card.hidden).length + ' 个项目';
}
if (filters.length) {
  for (const button of filters) {
    button.addEventListener('click', () => {
      const url = new URL(location.href);
      if (button.dataset.filter === 'all') url.searchParams.delete('group');
      else url.searchParams.set('group', button.dataset.filter);
      if (url.protocol !== 'file:') history.replaceState(null, '', url);
      filterProjects(button.dataset.filter);
    });
  }
  filterProjects();
}
const body = document.getElementById('demo-body');
if (body) {
  const states = {
    start: [0, '准备演示环境', '本次使用一台虚构的 Windows 电脑。开始后，你可以选择检查结果，分别体验顺利完成或需要重试的路径。', [['进入环境检查', 'check']]],
    check: [1, '选择一个示例情形', '引导现在来到环境检查。选择一种情形，看看用户接下来会收到什么反馈。', [['模拟检查通过', 'pass'], ['模拟缺少组件', 'missing']]],
    missing: [1, '示例反馈：缺少组件', '检查发现示例组件尚未就绪。界面保留当前进度，你可以模拟补齐组件，再次检查。', [['模拟补齐并复查', 'pass'], ['重选情形', 'check']]],
    pass: [1, '示例反馈：环境就绪', '检查已通过。继续查看完成提示，结束本次演示。', [['查看完成提示', 'done']]],
    done: [2, '演示已完成', '你已体验安装引导的准备、检查与完成反馈。演示中的操作均未更改设备。', [['重新体验', 'start']]]
  };
  function render(id, focus = false) {
    const [step, title, description, actions] = states[id];
    const heading = document.createElement('h2');
    heading.textContent = title;
    heading.tabIndex = -1;
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    const buttons = document.createElement('div');
    buttons.className = 'actions';
    actions.forEach(([label, next], i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button ' + (i ? 'secondary' : 'primary');
      button.textContent = label;
      button.addEventListener('click', () => render(next, true));
      buttons.append(button);
    });
    document.querySelectorAll('.simnav span').forEach((node, i) => {
      if (i === step) node.setAttribute('aria-current','step');
      else node.removeAttribute('aria-current');
    });
    body.replaceChildren(heading, paragraph, buttons);
    if (focus) heading.focus({preventScroll:true});
  }
  render('start');
}
