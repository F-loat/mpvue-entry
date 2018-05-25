/**
 * 页面配置对比函数
 * @param {Object} page
 * @param {Object} [page.config]
 * @param {Object[]} oldPages
 */
function isConfigChanged(page, oldPages) {
  const oldPageIndex = oldPages.findIndex(oldPage => oldPage.path === page.path);

  if (oldPageIndex === -1) return true;

  const oldPage = oldPages[oldPageIndex];

  const keys = Object.keys(page.config || {});
  const oldKeys = Object.keys(oldPage.config || {});

  if (keys.length !== oldKeys.length) return true;

  return keys.some(key => page.config[key] !== oldPage.config[key]);
}

module.exports = {
  isConfigChanged,
};
