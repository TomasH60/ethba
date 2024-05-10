import React from 'react'
import '../scss/Button.scss'
const Button = (props) => {
  return (
    <div className='Button-div' style={props.style} onClick={props.onclick}>
        {props.text}
    </div>
  )
}

export default Button