// If config key names or position in the config have been changed with a version change,
// process those config entries and format old values into new
import update_4_24_4 from './ver/4.24.4'
import update_4_24_3 from './ver/4.24.3'
import update_4_24_5 from './ver/4.24.5'
import update_4_24_7 from './ver/4.24.7'
import update_4_24_9 from './ver/4.24.9'
import versionNeedsUpdate from './ver/versionNeedsUpdate'
import { UpdateFunction } from 'json-edit-react'

export const coveUpdateWorker = config => {
  if (config.multiDashboards) {
    config.multiDashboards.forEach((dashboard, index) => {
      dashboard.type = 'dashboard'
      config.multiDashboards[index] = coveUpdateWorker(dashboard)
    })
  }
  let genConfig = config

  const runVersionUpdates = () => {
    const versions = [
      ['4.24.3', update_4_24_3],
      ['4.24.4', update_4_24_4],
      ['4.24.5', update_4_24_5],
      ['4.24.7', update_4_24_7],
      ['4.24.9', update_4_24_9]
    ]

    versions.forEach(([version, updateFunction]: [string, UpdateFunction]) => {
      if (versionNeedsUpdate(genConfig.version, version)) {
        genConfig = updateFunction(genConfig)
      }
    })
  }

  runVersionUpdates()

  return genConfig
}

const asyncWorker = async config => {
  return await coveUpdateWorker(config)
}

export default asyncWorker
