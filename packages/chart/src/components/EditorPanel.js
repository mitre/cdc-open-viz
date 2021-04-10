import React, { useState, useEffect, useCallback, memo, useContext } from 'react'

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from 'react-accessible-accordion';
import { useDebounce } from 'use-debounce';

import Context from '../context';

import ErrorBoundary from '@cdc/core/components/ErrorBoundary'
import Waiting from '@cdc/core/components/Waiting'

// IE11 Custom Event polyfill
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  window.CustomEvent = CustomEvent;
})();

const TextField = memo(({label, section = null, subsection = null, fieldName, updateField, value: stateValue, type = "input", ...attributes}) => {
  const [ value, setValue ] = useState(stateValue);

  const [ debouncedValue ] = useDebounce(value, 500);

  useEffect(() => {
    if('string' === typeof debouncedValue && stateValue !== debouncedValue ) {
      updateField(section, subsection, fieldName, debouncedValue)
    }
  }, [debouncedValue])

  let name = subsection ? `${section}-${subsection}-${fieldName}` : `${section}-${subsection}-${fieldName}`;

  const onChange = (e) => setValue(e.target.value);

  let formElement = <input type="text" name={name} onChange={onChange} {...attributes} value={value} />

  if('textarea' === type) {
    formElement = (
      <textarea name={name} onChange={onChange} {...attributes} value={value}></textarea>
    )
  }
  
  if('number' === type) {
    formElement = <input type="number" name={name} onChange={onChange} {...attributes} value={value} />
  }

  return (
    <label>
      <span className="edit-label column-heading">{label}</span>
      {formElement}
    </label>
  )
})

const CheckBox = memo(({label, value, fieldName, section = null, subsection = null, updateField}) => (
  <label className="checkbox mt-4">
    <input type="checkbox" name={fieldName} checked={ value } onChange={() => { updateField(section, subsection, fieldName, !value) }} />
    <span className="edit-label">{label}</span>
  </label>
))

const Select = memo(({label, value, options, fieldName, section = null, subsection = null, updateField}) => {
  let optionsJsx = options.map(optionName => <option value={optionName}>{optionName}</option>)

  return (
    <label>
      <span className="edit-label">{label}</span>
      <select name={fieldName} value={value} onChange={(event) => { updateField(section, subsection, fieldName, event.target.value) }}>
        {optionsJsx}
      </select>
    </label>
  )
})

const headerColors = ['theme-blue','theme-purple','theme-brown','theme-teal','theme-pink','theme-orange','theme-slate','theme-indigo','theme-cyan','theme-green','theme-amber']

const EditorPanel = memo(() => {
  const { config, setConfig, loading, data } = useContext(Context);

  const updateField = (section, subsection, fieldName, newValue) => {
    const isArray = Array.isArray(config[section]);
    const isString = typeof config[section] === "string";

    if(isString && null === subsection) {
      setConfig({...config, [section]: newValue})
      return
    } 

    let sectionValue = isArray ? [...config[section], newValue] : {...config[section], [fieldName]: newValue};

    if(null !== subsection) {
      if(isArray) {
        sectionValue = [...config[section]]
        sectionValue[subsection] = {...sectionValue[subsection], [fieldName]: newValue}
      } else {
        sectionValue = {...config[section], [subsection]: { ...config[section][subsection], [fieldName]: newValue}}
      }
    }

    let updatedConfig = {
      [section]: sectionValue
    }

    setConfig({...config, ...updatedConfig})
  }

  const [ requiredColumns, setRequiredColumns ] = useState([])

  const [ displayPanel, setDisplayPanel ] = useState(true)

  if(loading) {
    return null
  }

  return (
    <ErrorBoundary component="EditorPanel">
      {0 !== requiredColumns.length && <Waiting requiredColumns={requiredColumns} className={displayPanel ? `waiting` : `waiting collapsed`} />}
      <button className={displayPanel ? `editor-toggle` : `editor-toggle collapsed`} title={displayPanel ? `Collapse Editor` : `Expand Editor`} onClick={() => setDisplayPanel(!displayPanel) }></button>
      <section className={displayPanel ? 'editor-panel' : 'hidden editor-panel'}>
        <h2>Configure Chart</h2>
        <section className="form-container">
          <form>
            <Accordion allowZeroExpanded={true}>
              <AccordionItem> {/* General */}
                <AccordionItemHeading>
                  <AccordionItemButton>
                    General
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <Select value={config.visualizationType} section="visualizationType" fieldName="chart-vis-type" label="Chart Type" updateField={updateField} options={['Bar', 'Line', 'Area']} />
                  <TextField value={config.title.text} section="title" fieldName="text" label="Title" updateField={updateField} />
                  <TextField type="textarea" value={config.description.html || ''} section="description" fieldName="html" label="Description" updateField={updateField} />
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Y Axis
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <TextField value={config.yAxis.label} section="yAxis" fieldName="label" label="Label" updateField={updateField} />
                  <Select value={config.yAxis.dataKey} section="yAxis" fieldName="dataKey" label="Data Key" updateField={updateField} options={['Race', 'Age-adjusted rate']} />
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    X Axis
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <TextField value={config.xAxis.label} section="xAxis" fieldName="label" label="Label" updateField={updateField} />
                  <Select value={config.xAxis.dataKey} section="xAxis" fieldName="dataKey" label="Data Key" updateField={updateField} options={['Race', 'Age-adjusted rate']} />
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Legend
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <CheckBox value={config.legend.hide} section="legend" fieldName="hide" label="Hide Legend" updateField={updateField} />
                  <TextField value={config.legend.label} section="legend" fieldName="label" label="Label" updateField={updateField} />
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Visual
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <label className="header">
                      <span className="edit-label">Header Theme</span>
                      <ul className="color-palette">
                        {headerColors.map( (palette) => (
                          <li title={ palette } key={ palette } onClick={ () => { setConfig({...config, theme: palette})}} className={ config.theme === palette ? "selected " + palette : palette}>
                          </li>
                        ))}
                      </ul>
                    </label>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Data Table
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <CheckBox value={config.table.expanded} section="table" fieldName="expanded" label="Expanded by Default" updateField={updateField} />
                  <CheckBox value={config.table.download} section="table" fieldName="download" label="Display Download Button" updateField={updateField} />
                  <TextField value={config.table.label} section="table" fieldName="label" label="Label" updateField={updateField} />
                </AccordionItemPanel>
              </AccordionItem>
           </Accordion>
          </form>
        </section>
      </section>
    </ErrorBoundary>
  )
})

export default EditorPanel;