function isPagesChanged(pages, oldPages) {
  if (pages.length !== oldPages) return true;
  return pages.some(page => oldPages.findIndex(oldPage => oldPage.path === page.path) === -1);
}

// 配置对比函数
function isConfigChanged(page, oldPages) {
  // 获取备份的页面索引
  const oldPageIndex = oldPages.findIndex(oldPage => oldPage.path === page.path);

  // 不存在备份配置说明为新增页面
  if (oldPageIndex === -1) return true;

  const oldPage = oldPages[oldPageIndex];

  // 对比新旧配置的键
  const keys = Object.keys(page.config || {});
  const oldKeys = Object.keys(oldPage.config || {});

  if (keys.length !== oldKeys.length) return true;

  // 对比新旧配置的值
  return keys.some(key => page.config[key] !== oldPage.config[key]);
}

module.exports = {
  isPagesChanged,
  isConfigChanged,
};
