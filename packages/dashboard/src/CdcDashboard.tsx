import { useEffect, useState } from 'react'
import CdcDashboard from './CdcDashboardComponent'
import { MultiDashboardConfig } from './types/MultiDashboard'
import Loading from '@cdc/core/components/Loading'
import defaults from './data/initial-state'
import { processData } from './helpers/processData'
import { getVizKeys } from './helpers/getVizKeys'
import { processDataLegacy } from './helpers/processDataLegacy'
import { WCMSProps } from '@cdc/core/types/WCMSProps'
import { initialState } from './DashboardContext'
import { getUpdateConfig } from './helpers/getUpdateConfig'
import { InitialState } from './types/InitialState'
import { DashboardConfig } from './types/DashboardConfig'
import { coveUpdateWorker } from '@cdc/core/helpers/coveUpdateWorker'
import _ from 'lodash'
import { hasDashboardApplyBehavior } from './helpers/hasDashboardApplyBehavior'

type MultiDashboardProps = Omit<WCMSProps, 'configUrl'> & {
  configUrl?: string
  config?: MultiDashboardConfig
}

const MultiDashboardWrapper: React.FC<MultiDashboardProps> = ({ configUrl, config: editorConfig, isEditor, isDebug }) => {
  const [initial, setInitial] = useState<InitialState>(undefined)

  const getSelectedConfig = (config: MultiDashboardConfig, selectedConfig?: string): number | null => {
    if (!config.multiDashboards) return null
    // TODO: if query parameter select based on query parameter
    if (selectedConfig) {
      const foundConfig = Object.values(config.multiDashboards).findIndex(({ label }) => {
        return label === selectedConfig
      })
      if (foundConfig > -1) return foundConfig
    }
    // else select the first available
    return 0
  }

  const formatInitialState = (newConfig: MultiDashboardConfig | DashboardConfig, datasets: Record<string, Object[]>) => {
    const [config, filteredData] = getUpdateConfig(initialState)(newConfig, datasets)
    const versionedConfig = coveUpdateWorker(config)
    return { ...initialState, config: versionedConfig, filteredData, data: datasets }
  }

  const loadConfig = async (selectedConfig?: string) => {
    const _config: MultiDashboardConfig = editorConfig || (await (await fetch(configUrl)).json())
    const selected = getSelectedConfig(_config, selectedConfig)

    const { newConfig, datasets } = selected !== null ? await loadMultiDashboard(_config, selected) : await loadSingleDashboard(_config)
    setInitial(formatInitialState(newConfig, datasets))
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const loadData = async (initialConfig: DashboardConfig | MultiDashboardConfig) => {
    let newConfig = { ...initialConfig }
    let datasets: Record<string, Object[]> = {}
    await Promise.all(
      Object.keys(initialConfig.datasets).map(async key => {
        const legacySupportApply = (initialConfig as any).filterBehavior === 'Apply Button'
        const hasApplyBehavior = hasDashboardApplyBehavior(initialConfig.visualizations) || legacySupportApply
        const data = await processData(initialConfig.datasets[key], !hasApplyBehavior)
        datasets[key] = data || []
      })
    )

    getVizKeys(newConfig).forEach(vizKey => {
      const formattedData = datasets[newConfig.visualizations[vizKey].dataKey]
      if (formattedData) {
        newConfig.visualizations[vizKey].formattedData = formattedData
      }
    })

    Object.keys(datasets).forEach(key => {
      newConfig.datasets[key].data = datasets[key]
    })

    return { newConfig, datasets }
  }

  const loadSingleDashboard = async config => {
    let newConfig = { ...defaults, ...config } as DashboardConfig

    if (config.datasets) {
      return await loadData(newConfig)
    } else {
      const dataKey = newConfig.dataFileName || 'backwards-compatibility'
      const data = await processDataLegacy(config)

      const datasetsFull = {}
      datasetsFull[dataKey] = {
        data,
        dataDescription: newConfig.dataDescription
      }
      newConfig.datasets = datasetsFull

      getVizKeys(newConfig).forEach(vizKey => {
        const newData = { dataKey, ..._.pick(newConfig, 'dataDescription', 'formattedData') }
        newConfig.visualizations[vizKey] = { ...newConfig.visualizations[vizKey], ...newData }
      })

      const blankFields = { data: [], dataUrl: '', dataFileName: '', dataFileSourceType: '', dataDescription: {}, formattedData: [] }
      newConfig = { ...newConfig, ...blankFields }

      if (newConfig.dashboard.filters) {
        const dashboard = { ...newConfig.dashboard }
        // replace filters with sharedFilters
        if (!dashboard.sharedFilters) dashboard.sharedFilters = []
        const filters = dashboard.filters.map(filter => {
          return { ...filter, key: filter.label, showDropdown: true, usedBy: getVizKeys(newConfig) }
        })
        dashboard.sharedFilters = [...dashboard.sharedFilters, ...filters]
        newConfig.dashboard = { ...dashboard, filters: undefined }
      }

      const datasets: Record<string, Object[]> = { [dataKey]: data }
      return { newConfig, datasets }
    }
  }

  const loadMultiDashboard = async (multiConfig: MultiDashboardConfig, selectedConfig: number) => {
    const selectedDashboard = multiConfig.multiDashboards[selectedConfig]
    let newConfig = { ...defaults, ...multiConfig, ...selectedDashboard, multiDashboards: multiConfig.multiDashboards, activeDashboard: selectedConfig } as MultiDashboardConfig
    return await loadData(newConfig)
  }

  if (!initial) return <Loading />
  return <CdcDashboard isEditor={isEditor} isDebug={isDebug} initialState={initial} />
}

export default MultiDashboardWrapper
