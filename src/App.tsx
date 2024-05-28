import { Expand, Minimize, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react"

export function App() {
  return (
    <div className="bg-zinc-950 text-zinc-50 w-full h-screen flex justify-center items-center">
      <Video src="video/tears-of-steel-battle-clip-medium.mp4" />
    </div>
  )
}

function Video(props: ComponentProps<'video'>) {
  const DEFAULT_SKIP = useRef(5)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying,setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handlerTogglePlay = useCallback(() => {
    if(!videoRef.current) return

    if(videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }

    setIsPlaying(state => !state)
  },[setIsPlaying])
  const handlerSkipFowardInSeconds = useCallback(() => {
    if(!videoRef.current) return

    videoRef.current.currentTime += DEFAULT_SKIP.current
  },[])
  const handlerSkipBackInSeconds = useCallback(() => {
    if(!videoRef.current) return

    videoRef.current.currentTime -= DEFAULT_SKIP.current
  },[])
  const handleTimeUpdate = useCallback(() => {
    if(!videoRef.current) return

    setCurrentTime(videoRef.current.currentTime)
  }, [setCurrentTime])
  const handleLoadedMetadata = useCallback(() => {
    if(!videoRef.current) return
        setDuration(videoRef.current.duration)
  }, [setDuration])
  const handlerProgressClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!videoRef.current) return

    const progressBar = event.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const clickPosition = event.clientX - rect.left
    const clickRatio = clickPosition / rect.width
    const newTime = clickRatio * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }
  const handleToggleFullScreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const handleFullScreenChange = useCallback(() => {
    setIsFullScreen(Boolean(document.fullscreenElement))
  }, [])

  // Attach event listener for fullscreen change
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
    }
  }, [handleFullScreenChange])

  return (
    <div>
      <h1 className="text-2xl text-center font-bold mb-8">Video player component</h1>

      <div className="p-4">
        <div ref={containerRef} className="relative rounded flex flex-col items-center justify-center">
          <video 
            onTimeUpdate={handleTimeUpdate} 
            onLoadedMetadata={handleLoadedMetadata} 
            ref={videoRef} 
            data-fullScreen={isFullScreen}
            className="rounded w-[900px] data-[fullScreen=true]:w-full" 
            {...props}
          />
          <div className="absolute inset-0" onClick={handlerTogglePlay} />
          <Controls
            isPlaying={isPlaying}
            isFullScreen={isFullScreen}
            currentTimeInSeconds={currentTime}
            durationInSeconds={duration}
            onSkipBackInSeconds={handlerSkipBackInSeconds} 
            onSkipFowardInSeconds={handlerSkipFowardInSeconds} 
            onTogglePlay={handlerTogglePlay}
            onProgressClick={handlerProgressClick}
            onToggleFullScreen={handleToggleFullScreen}
          />
        </div>
      </div>
    </div>
  )
}

interface ControlsProps {
  isPlaying: boolean
  isFullScreen: boolean
  currentTimeInSeconds: number
  durationInSeconds: number
  onTogglePlay: () => void
  onSkipBackInSeconds: () => void
  onSkipFowardInSeconds: () => void
  onToggleFullScreen: () => void
  onProgressClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

function Controls(props: ControlsProps) {
  const { 
    isPlaying,
    isFullScreen,
    currentTimeInSeconds = 0,
    durationInSeconds = 0,
    onTogglePlay,
    onSkipBackInSeconds,
    onSkipFowardInSeconds,
    onProgressClick,
    onToggleFullScreen
  } = props

  const currentTimeFormated = formatTime(currentTimeInSeconds)
  const durationFormated = formatTime(durationInSeconds)
  const timeForView = `${currentTimeFormated} / ${durationFormated}`
  const progressPercent = (currentTimeInSeconds / durationInSeconds) * 100

  return (
    <div className="absolute bottom-2 left-2 right-2 rounded bg-zinc-950/80 p-2 flex flex-col gap-2">
      <div className="relative w-full h-1 bg-zinc-700 rounded cursor-pointer" onClick={onProgressClick}>
        <div className="absolute left-0 top-0 h-1 bg-zinc-50 rounded" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onSkipBackInSeconds}>
            <SkipBack className="size-4" />
          </button>
          <button onClick={onTogglePlay}>
            { isPlaying ? <Pause className="size-4" /> : <Play className="size-4" /> }
          </button>
          <button onClick={onSkipFowardInSeconds}>
            <SkipForward className="size-4" />
          </button>

          <span className="text-[0.65rem] leading-none">{timeForView}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onToggleFullScreen}>
            { isFullScreen ? <Minimize className="size-4" /> : <Expand className="size-4" /> }
          </button>
        </div>
      </div>
    </div>
  )
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}