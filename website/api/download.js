const repo = 'mrAbhimanyuVishwakarma/Water-Tracker';
const releasesPage = `https://github.com/${repo}/releases/latest`;

// Resolve on every request, including downloads from tabs left open across releases.
module.exports = async function download(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  let destination = releasesPage;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'WaterTrackerBrownie' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Release lookup failed');
    const release = await response.json();
    if (release.draft || release.prerelease) throw new Error('Unpublished stable release');
    const assets = (release.assets || []).filter(asset =>
      /\.apk$/i.test(asset.name || '') && !/debug|development|androidTest/i.test(asset.name) &&
      asset.state === 'uploaded' && asset.size > 0
    ).sort((a, b) => Number(/universal/i.test(b.name)) - Number(/universal/i.test(a.name)) ||
      Date.parse(b.updated_at || b.created_at) - Date.parse(a.updated_at || a.created_at));
    if (assets.length) {
      const url = new URL(assets[0].browser_download_url);
      if (url.protocol === 'https:' && url.hostname === 'github.com' &&
          url.pathname.startsWith(`/${repo}/releases/download/`)) {
        // Refresh an asset replaced under the same release tag and filename.
        url.searchParams.set('updated', assets[0].updated_at || String(assets[0].id));
        destination = url.href;
      }
    }
  } catch {
    // Never silently serve an older release when lookup fails or no APK exists.
  }
  res.setHeader('Location', destination);
  return res.status(302).end();
};
