const githubApkUpdates = process.env.GITHUB_APK_UPDATES === 'true';
const installPermission = 'android.permission.REQUEST_INSTALL_PACKAGES';

module.exports = ({ config }) => {
  const basePermissions = config.android?.permissions || [];
  const baseBlockedPermissions = config.android?.blockedPermissions || [];

  return {
    ...config,
    android: {
      ...config.android,
      permissions: githubApkUpdates
        ? [...new Set([...basePermissions, installPermission])]
        : basePermissions.filter((permission) => permission !== installPermission),
      blockedPermissions: githubApkUpdates
        ? baseBlockedPermissions.filter((permission) => permission !== installPermission)
        : [...new Set([...baseBlockedPermissions, installPermission])],
    },
    extra: {
      ...config.extra,
      githubRepo: 'mrAbhimanyuVishwakarma/Water-Tracker',
      githubApkUpdates,
    },
  };
};
