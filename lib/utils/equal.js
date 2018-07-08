/**
 * 配置对比函数
 * @param {Object} page
 * @param {Object} oldPage
 */
function equalConfig(page, oldPage) {
  const keys = Object.keys(page.config || {});
  const oldKeys = Object.keys(oldPage.config || {});

  if (keys.length !== oldKeys.length) return false;
  if (keys.some(key => page.config[key] !== oldPage.config[key])) return false;
  return true;
}

module.exports = {
  equalConfig,
};
