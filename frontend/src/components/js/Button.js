import React from 'react'
import '../scss/Button.scss'
const Button = (props) => {
  return (
    <div className='Button-div'>
        {props.text}
    </div>
  )
}

export default Button