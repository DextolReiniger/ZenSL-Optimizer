/* eslint-disable prettier/prettier */
import './App.css'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWindowMinimize,
  faXmark,
  faCog,
  faRotateRight,
  faTriangleExclamation,
  faCircleInfo,
  faChevronLeft,
  faFolder,
  faWifi3
} from '@fortawesome/free-solid-svg-icons'

function App() {
  const [isRevertMenuOpen, setIsRevertMenuOpen] = useState(false)
  const [output, setOutput] = useState('')
  const [revertoutput, setRevertOutput] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [isOptimizeButtonDisabled, setIsOptimizeButtonDisabled] = useState(false)
  const [isRevertButtonDisabled, setIsRevertButtonDisabled] = useState(false)
  const [error, setError] = useState('')
  const [hover, setHover] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const minimizeWindow = () => {
    window.electron.minimizeWindow()
  }
  const closeWindow = () => {
    window.electron.closeWindow()
  }
  const restartComputer = () => {
    setOutput('Restarting...')
    window.electron.restartComputer()
  }

  const openSourceFolder = () => {
    window.electron.openSourceFolder()
    setRevertOutput('Restart Your Computer To Apply Changes')

  }
  
  const startOptimization = () => {
    setOutput('')
    setRevertOutput('')
    setError('')
    setIsOptimizing(true)
    setIsOptimizeButtonDisabled(true)
    setIsRevertButtonDisabled(true)
    window.electron.startOptimization()
  }

  const revertChanges = () => {
    setOutput('')
    setRevertOutput('')
    setError('')
    setIsReverting(true)
    setIsRevertButtonDisabled(true)
    setIsOptimizeButtonDisabled(true)
    window.electron.revertChanges()
  }

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsRevertMenuOpen(false)
      }
    }

    if (isRevertMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    } else {
      document.removeEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isRevertMenuOpen])

  useEffect(() => {
    const handlePythonOutput = (event, data) => {
      const newOutput = data.toString()
      if (newOutput.includes('progress_update')) {
        setOutput((prevOutput) => prevOutput + newOutput)
      }
    }

    const handlePythonError = (event, data) => {
      setError((prevError) => prevError + data.toString())
    }

    const handlePythonClose = () => {
      setOutput('Restart Your Computer')
      if (isOptimizing) {
        setIsOptimizeButtonDisabled(true)
      }
      if (isReverting) {
        setIsRevertButtonDisabled(true) 
      }
      setIsOptimizing(false)
      setIsReverting(false)
    }

    if (isRevertButtonDisabled ) {
      setRevertOutput('Restart Your Computer To Apply Changes')
    }
    else {
      setRevertOutput(' ')
    }

    window.electron.on('python-output', handlePythonOutput)
    window.electron.on('python-error', handlePythonError)
    window.electron.on('python-close', handlePythonClose)

    return () => {
      window.electron.removeListener('python-output', handlePythonOutput)
      window.electron.removeListener('python-error', handlePythonError)
      window.electron.removeListener('python-close', handlePythonClose)
    }
  }, [isOptimizing, isReverting])

  // Network status handling
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        console.log('Connection : ONLINE');
      } else {
        console.log('Connection : OFFLINE');
        setOutput('No Internet connection');
        setIsOptimizeButtonDisabled(true);
        setIsRevertButtonDisabled(false);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);


  const toggleRevertMenu = () => {
    setIsRevertMenuOpen(!isRevertMenuOpen)
  }

  const clientVersion = '1.9.5'

  return (
    <div className="app">
      <div className="title-bar">
        <div className="title-bar-left">
          <FontAwesomeIcon icon={faCog} className="title-bar-icon" />
          <span className="title-bar-text">ZenSL Optimizer {clientVersion}</span>
        </div>
        <div className="title-bar-right">
          <FontAwesomeIcon
            icon={faRotateRight}
            className="title-bar-button revert-icon"
            onClick={toggleRevertMenu}
            disabled={isOptimizeButtonDisabled}
          />
          <FontAwesomeIcon
            icon={faWindowMinimize}
            className="title-bar-button"
            onClick={minimizeWindow}
          />
          <FontAwesomeIcon
            icon={faXmark}
            className="title-bar-button xmark"
            onClick={closeWindow}
          />
        </div>
      </div>
      <div className="star-background"></div>
      {!isOnline ? (
        <div className="no-internet">
          <FontAwesomeIcon icon={faWifi3} className="net-icon" />
          <p className="net-text" style={{ fontWeight: 300 }}>
            Please Check Your Internet Connection And Try Again!
          </p>
          <p className="note-text revert-menu-subtitle no-internet-revert-text" style={{ fontWeight: 300 }}>
            <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />
            Revert the optimizations made to your computer.
          </p>
          <button
            className="optimize-button revert-button no-internet-revert-button"
            onClick={revertChanges}
            disabled={isRevertButtonDisabled || isOptimizing} 
          >
            {isReverting ? 'Reverting' : 'Revert Changes'}
            {isReverting && <span className="loading-indicator"></span>}
          </button>
        </div>
      ) : isRevertMenuOpen ? (
        <div>
          <h1 className="revert-menu-infotitle">STABLE v2.6</h1>
          <p className="note-text revert-menu-subtitle" style={{ fontWeight: 300 }}>
            <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />
            Revert the optimizations made to your computer.
          </p>
          <button
            className="optimize-button revert-button"
            onClick={revertChanges}
            disabled={isRevertButtonDisabled || isOptimizing} 
          >
            {isReverting ? 'Reverting' : 'Revert Changes'}
            {isReverting && <span className="loading-indicator"></span>}
          </button>
          <div className="output-container">
            {revertoutput && (
              <pre className="output revert-output" onClick={restartComputer}>
                {revertoutput}
              </pre>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
          <div>
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="back-button"
              onClick={toggleRevertMenu}
              disabled={isReverting} 
            />
          </div>
          <div>
            <FontAwesomeIcon
              icon={faFolder}
              className="folder-button"
              onClick={openSourceFolder}
            />
          </div>
        </div>
      ) : (
        <div className="header-container">
          <h1 className="app-header">ZenSL Optimizer</h1>
          <p className="app-subtitle" style={{ fontWeight: 300 }}>
            Optimize your PC to increase FPS and reduce system latency.
          </p>
          <button
            className="optimize-button"
            onClick={startOptimization}
            disabled={isOptimizeButtonDisabled || isReverting}
          >
            {isOptimizing ? 'Optimizing' : 'Start Optimization'}
            {isOptimizing && <span className="loading-indicator"></span>}
          </button>
          <div className="output-container">
            {output && (
              <pre 
                className={`output ${hover ? 'hidden' : ''}`}
                onClick={restartComputer}
                onMouseEnter={() => {
                  setHover(true)
                  setTimeout(() => setOutput('  Restart Now'), 0)
                }}
                onMouseLeave={() => {
                  setHover(false)
                  setTimeout(() => setOutput('Restart Your Computer'), 0)
                }}
              >
                {output}
              </pre>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
          <p className="note-text">
            <FontAwesomeIcon icon={faTriangleExclamation} className="note-icon" />
            All optimizations can be reverted through the Revert Menu.
          </p>
        </div>
      )}
    </div>
  )
}

export default App
