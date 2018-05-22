// 配置对比函数
function isConfigChanged(page, oldPages) {
  // 获取备份的页面索引
  const oldPageIndex = oldPages.findIndex(oldPage => oldPage.path === page.path);

  // 不存在备份配置说明为新增页面
  if (oldPageIndex === -1) return true;

  // 获取并移除备份的页面配置
  const oldPage = oldPages.splice(oldPageIndex, 1)[0];

  // 对比新旧配置的键
  const keys = Object.keys(page.config || {});
  const oldKeys = Object.keys(oldPage.config || {});

  if (keys.length !== oldKeys.length) return true;

  // 对比新旧配置的值
  return keys.some(key => page.config[key] !== oldPage.config[key]);
}

module.exports = {
  isConfigChanged,
};
