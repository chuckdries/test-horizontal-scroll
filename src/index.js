import React, { useCallback, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useSpring, animated as a, interpolate } from 'react-spring'
import useWindowScroll from '@react-hook/window-scroll'
import useScrollWidth from './useScrollWidth'

// TODO: header video is sticky (bg of scrolling el? or real position fixed?)
// work takes up bottom 1/3rd over header video

import './styles.css'

function ScrollCarousel({ children }) {
  const refHeight = useRef(null)
  const refTransform = useRef(null)

  const { scrollWidth } = useScrollWidth(refTransform)

  // the argument is the fps that the hook uses,
  // since react spring interpolates values we can safely reduce this below 60
  const scrollY = useWindowScroll(45)
  const [{ st, xy }, set] = useSpring(() => ({ st: 0, xy: [0, 0] }))

  useEffect(() => {
    set({ st: scrollY })
  }, [scrollY, set])

  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => set({ xy: [x - window.innerWidth / 2, y - window.innerHeight / 2] }), [])

  const top = refHeight.current ? refHeight.current.offsetTop : 0
  const width = refHeight.current ? refHeight.current.offsetWidth : 0

  // we want to set the scrolling element *height* to the value of the *width* of the horizontal content
  // plus some other calculations to convert it from a width to a height value
  const elHeight = scrollWidth - (window.innerWidth - window.innerHeight) + width * 0.5 // scroll away when final viewport width is 0.5 done

  const interpTransform = interpolate([st, xy], (o, xy) => {
    const mouseMoveDepth = 40 // not necessary, but nice to have
    const x = width - (top - o) - width

    // (width * 0.5) so that it starts moving just slightly before it comes into view
    if (x < -window.innerHeight - width * 0.5) {
      // element is not yet in view, we're currently above it. so don't animate the translate value
      return `translate3d(${window.innerHeight}px, 0, 0)`
    }

    if (Math.abs(x) > elHeight) {
      // element is not in view, currently below it.
      return `translate3d(${elHeight}px, 0, 0)`
    }

    // else animate as usual
    return `translate3d(${-x}px, 0, 0)`
  })

  return (
    <div onMouseMove={onMouseMove} className="scroll-carousel" ref={refHeight} style={{ height: elHeight }}>
      <div className="sticky-box" style={{ height: '33vh' }}>
        <div id="asdf" style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ flex: 1, fontSize: '3em', display: 'inline-block' }}>Work</h1>
          <a href="#" style={{ marginRight: '1em' }}>
            all poetry ->
          </a>
          <a href="#" style={{ marginRight: '1em' }}>
            all performance ->
          </a>
        </div>
        <a.div style={{ transform: interpTransform }} className="transform-box" ref={refTransform}>
          {children}
        </a.div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="container">
      <div
        className="padding-block"
        // just setting arbitrary values to simulate real content above and below the component
        style={{ height: '90vh' }}>
        <h2>Header Video</h2>
      </div>

      <ScrollCarousel>
        <div className="box">
          <img src="https://picsum.photos/720/540/?image=88" alt="" className="img" />
        </div>
        <div className="box box--narrower">
          <img src="https://picsum.photos/720/540/?image=512" alt="" className="img" />
        </div>
        <div className="box">
          <img src="https://picsum.photos/720/540/?image=435" alt="" className="img" />
        </div>
        <div className="box box--narrower">
          <img src="https://picsum.photos/720/540/?image=840" alt="" className="img" />
        </div>
        <div className="box">
          <img src="https://picsum.photos/720/540/?image=472" alt="" className="img" />
        </div>
      </ScrollCarousel>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
