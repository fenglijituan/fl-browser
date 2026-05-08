const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const UPDATE_SERVER = 'https://api.github.com/repos/flbrowser/fl-browser/releases/latest';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

class AutoUpdater {
  constructor() {
    this.currentVersion = app.getVersion();
    this.lastCheck = 0;
  }

  checkForUpdates(showDialogIfLatest = false) {
    const now = Date.now();
    if (now - this.lastCheck < UPDATE_CHECK_INTERVAL && !showDialogIfLatest) {
      return Promise.resolve({ status: 'skipped' });
    }
    this.lastCheck = now;

    return new Promise((resolve, reject) => {
      https.get(UPDATE_SERVER, {
        headers: { 'User-Agent': 'FL-Browser' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name.replace(/^v/, '');
            
            if (this.isNewer(latestVersion, this.currentVersion)) {
              resolve({
                status: 'available',
                version: latestVersion,
                notes: release.body || '新版本已发布',
                downloadUrl: this.getDownloadUrl(release),
                size: this.getAssetSize(release)
              });
            } else {
              if (showDialogIfLatest) {
                resolve({ status: 'latest', version: this.currentVersion });
              } else {
                resolve({ status: 'latest' });
              }
            }
          } catch(e) {
            reject(new Error('解析更新信息失败'));
          }
        });
      }).on('error', reject);
    });
  }

  isNewer(latest, current) {
    const parse = v => v.split('.').map(Number);
    const l = parse(latest), c = parse(current);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      if ((l[i] || 0) > (c[i] || 0)) return true;
      if ((l[i] || 0) < (c[i] || 0)) return false;
    }
    return false;
  }

  getDownloadUrl(release) {
    if (release.assets && release.assets.length > 0) {
      const winAsset = release.assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.zip'));
      if (winAsset) return winAsset.browser_download_url;
      return release.assets[0].browser_download_url;
    }
    return release.html_url;
  }

  getAssetSize(release) {
    if (release.assets && release.assets.length > 0) {
      const asset = release.assets[0];
      return asset.size ? (asset.size / 1024 / 1024).toFixed(1) + ' MB' : '未知';
    }
    return '未知';
  }

  downloadAndInstall(updateInfo) {
    const downloadPath = path.join(app.getPath('temp'), `FL-Browser-Update-${updateInfo.version}.exe`);
    const file = fs.createWriteStream(downloadPath);

    return new Promise((resolve, reject) => {
      https.get(updateInfo.downloadUrl, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          https.get(res.headers.location, (res2) => {
            res2.pipe(file);
            file.on('finish', () => {
              file.close();
              this.runInstaller(downloadPath);
              resolve();
            });
          }).on('error', reject);
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          this.runInstaller(downloadPath);
          resolve();
        });
      }).on('error', reject);
    });
  }

  runInstaller(installerPath) {
    spawn(installerPath, [], {
      detached: true,
      stdio: 'ignore'
    }).unref();
    app.quit();
  }
}

module.exports = AutoUpdater;
