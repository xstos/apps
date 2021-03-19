import { Autocomplete } from '@material-ui/lab'
import TextField from '@material-ui/core/TextField'
import React from 'react'

export function JumpMenu(demoMenu, dispatch) {
  let selectedValue = { title: '', command: [] }
  return (
    <Autocomplete
      id="combo-box-demo"
      autoHighlight
      openOnFocus
      options={demoMenu}
      getOptionLabel={(option) => option.title}
      getOptionSelected={(option, value) => value}
      style={{ width: 300 }}
      ref={(input: HTMLElement) =>
        input && (input.style.display = 'inline-block')
      }
      onChange={(_, value) => (selectedValue = value)}
      onClose={(e, value) => {
        const { nativeEvent } = e
        const { key } = nativeEvent
        dispatch('menuClose', { key, value: selectedValue })
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Actions"
          variant="outlined"
          inputRef={(input) => {
            if (!input) return
            if (input.myfirstTime) return
            input.myfirstTime = true
            setTimeout(() => input.focus(), 0)
          }}
        />
      )}
    />
  )
}
