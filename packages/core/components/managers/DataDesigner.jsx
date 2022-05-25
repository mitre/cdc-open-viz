import React from 'react'

import { DATA_TABLE_VERTICAL, DATA_TABLE_HORIZONTAL, DATA_TABLE_SINGLE_ROW, DATA_TABLE_MULTI_ROW } from '../../data/dataDesignerTables'

import Button from '../elements/Button'
import Card from '../elements/Card'

import '../../styles/v2/components/data-designer.scss'

const DataDesigner = (props) => {
  const { configureData, updateDescriptionProp, visualizationKey, dataKey } = props;

  return (
    <>
      <div className="mb-2">
        <div className="cove-heading--3">Describe Data</div>
        <div className="cove-heading--4">Data Orientation</div>
        <div className="grid grid-gap-2 mb-4">
          <div className="col-12 col-xl-6">
            <button
              className={'cove-data-designer__button' + (configureData.dataDescription && configureData.dataDescription.horizontal === false ? ' active' : '')}
              onClick={() => {
                updateDescriptionProp(visualizationKey, dataKey, 'horizontal', false)
              }}>
              <Card>
                <strong>Vertical</strong>
                <p>Values for map geography or chart date/category axis are contained in a
                  single <em>column</em>.
                </p>
                {DATA_TABLE_VERTICAL}
              </Card>
            </button>
          </div>
          <div className="col-12 col-xl-6">
            <button
              className={'cove-data-designer__button' + (configureData.dataDescription && configureData.dataDescription.horizontal === true ? ' active' : '')}
              onClick={() => {
                updateDescriptionProp(visualizationKey, dataKey, 'horizontal', true)
              }}>
              <Card>
                <strong>Horizontal</strong>
                <p>Values for map geography or chart date/category axis are contained in a single <em>row</em>
                </p>
                {DATA_TABLE_HORIZONTAL}
              </Card>
            </button>
          </div>
        </div>
      </div>
      {configureData.dataDescription && (
        <>
          <div className="mb-2">
            <div className="cove-heading--4">Are there multiple series represented in your data?</div>
            <div>
              <Button
                style={{ backgroundColor: '#00345d' }}
                hoverStyle={{ backgroundColor: '#015daa' }}
                className="mr-1"
                onClick={() => {
                  updateDescriptionProp(visualizationKey, dataKey, 'series', true)
                }}
                active={configureData.dataDescription.series === true}
              >
                Yes
              </Button>
              <Button
                style={{ backgroundColor: '#00345d' }}
                hoverStyle={{ backgroundColor: '#015daa' }}
                onClick={() => {
                  updateDescriptionProp(visualizationKey, dataKey, 'series', false)
                }}
                active={configureData.dataDescription.series === false}
              >
                No
              </Button>
            </div>
          </div>
          {configureData.dataDescription.horizontal === true && configureData.dataDescription.series === true && (
            <div className="mb-2">
              <div className="cove-heading--4">Which property in the dataset represents which series the row is describing?</div>
              <select onChange={(e) => {
                updateDescriptionProp(visualizationKey, dataKey, 'seriesKey', e.target.value)
              }} value={configureData.dataDescription.seriesKey}>
                <option value="">Choose an option</option>
                {Object.keys(configureData.data[0]).map((value, index) => <option value={value} key={index}>{value}</option>)}
              </select>
            </div>
          )}
          {configureData.dataDescription.horizontal === false && configureData.dataDescription.series === true && (
            <>
              <div className="mb-2">
                <div className="cove-heading--4">Are the series values in your data represented in a
                  single row, or across multiple rows?
                </div>
                <div className="grid grid-gap-2 mb-4">
                  <div className="col-12 col-xl-6">
                    <button
                      className={'cove-data-designer__button' + (configureData.dataDescription.singleRow === true ? ' active' : '')}
                      onClick={() => {configureData.dataFileName, updateDescriptionProp('singleRow', true)}}>
                      <Card>
                        <strong>Single Row</strong>
                        <p>Each row contains the data for an individual series in itself.</p>
                        {DATA_TABLE_SINGLE_ROW}
                      </Card>
                    </button>
                  </div>
                  <div className="col-12 col-xl-6">
                    <button
                      className={'cove-data-designer__button' + (configureData.dataDescription.singleRow === false ? ' active' : '')}
                      onClick={() => {
                        updateDescriptionProp(visualizationKey, dataKey, 'singleRow', false)
                      }}>
                      <Card>
                        <strong>Multiple Rows</strong>
                        <p>Each series data is broken out into multiple rows.</p>
                        {DATA_TABLE_MULTI_ROW}
                      </Card>
                    </button>
                  </div>
                </div>
              </div>
              {configureData.dataDescription.singleRow === false && (
                <>
                  <div className="mb-2">
                    <div className="cove-heading--4">Which property in the dataset represents which series the row is describing?</div>
                    <select onChange={(e) => {
                      updateDescriptionProp(visualizationKey, dataKey, 'seriesKey', e.target.value)
                    }}>
                      <option value="">Choose an option</option>
                      {Object.keys(configureData.data[0]).map((value, index) => (
                        <option value={value} key={index}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <div className="cove-heading--4">Which property in the dataset represents the values for the category/date axis or map geography?</div>
                    <select onChange={(e) => {
                      updateDescriptionProp(visualizationKey, dataKey, 'xKey', e.target.value)
                    }}>
                      <option value="">Choose an option</option>
                      {Object.keys(configureData.data[0]).map((value, index) => (
                        <option value={value} key={index}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <div className="cove-heading--4">Which property in the dataset represents the numeric value?</div>
                    <select onChange={(e) => {
                      updateDescriptionProp(visualizationKey, dataKey, 'valueKey', e.target.value)
                    }}>
                      <option value="">Choose an option</option>
                      {Object.keys(configureData.data[0]).map((value, index) => (
                        <option value={value} key={index}>{value}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      {configureData.dataDescription && configureData.formattedData && (
        <p>Data configured successfully</p>
      )}
    </>
  )
}

export default DataDesigner
