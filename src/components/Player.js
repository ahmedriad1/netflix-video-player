import { useEffect, useRef, useState } from 'react';
import Time from 'hh-mm-ss';
import convert from '../utils/convertToVTT';
import Seeker from './Seeker';

const Player = ({ src, name }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [duration, setDuration] = useState({ total: 0, watched: 0 });
  const [captions, setCaptions] = useState();

  const [showIcon, setShowIcon] = useState(false);

  const [volume, setVolume] = useState(100);

  const videoRef = useRef();
  const videoContainerRef = useRef();

  const togglePlay = () => {
    setShowIcon(true);
    setTimeout(() => {
      setShowIcon(false);
    }, 700);
    setIsPlaying(playing => !playing);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(full => !full);
  };

  const toggleMuted = () => {
    setVolume(vol => (vol === 0 ? 100 : 0));
  };

  const rewind = () => {
    videoRef.current.currentTime -= 10;
  };

  const forward = () => {
    videoRef.current.currentTime += 10;
  };

  const getRemainingTime = () => {
    let time = '00:00:00';

    try {
      time = Time.fromS(duration.watched, 'hh:mm:ss').split('.')[0];
    } catch (error) {}
    return time;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setDuration({ total: video.duration, watched: video.currentTime });
  };

  useEffect(() => {
    let controlsTimeout;
    const showControls = () => {
      setIsMouseMoving(true);
      if (controlsTimeout) clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => {
        setIsMouseMoving(false);
      }, 5000);
    };

    const handleKeybinds = e => {
      switch (e.code) {
        case 'Space':
          togglePlay();
          break;

        case 'KeyM':
          toggleMuted();
          break;

        case 'KeyF':
          toggleFullscreen();
          break;

        case 'ArrowRight':
          forward();
          break;

        case 'ArrowLeft':
          rewind();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keyup', handleKeybinds);
    window.addEventListener('mousemove', showControls);

    return () => {
      document.removeEventListener('keyup', handleKeybinds);
      window.removeEventListener('mousemove', showControls);
    };
  }, []);

  useEffect(() => {
    videoRef.current[isPlaying ? 'play' : 'pause']();
  }, [isPlaying]);

  useEffect(() => {
    videoRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (isFullscreen && !document.fullscreenElement)
      videoContainerRef.current.requestFullscreen();
    else {
      if (document.fullscreenElement) document.exitFullscreen();
    }
  }, [isFullscreen]);

  const handleSubtitleChange = async e => {
    const file = e.target.files[0];
    if (!file && (!file.name.endsWith('.srt') || !file.name.endsWith('.vtt'))) return;
    const url = URL.createObjectURL(
      new Blob([convert(await file.text())], {
        type: 'text/plain',
      }),
    );
    setCaptions(url);
  };

  return (
    <div
      className='video-container'
      style={{ cursor: isMouseMoving ? 'initial' : 'none' }}
      ref={videoContainerRef}
    >
      <video
        src={src}
        ref={videoRef}
        style={{ cursor: isMouseMoving ? 'pointer' : 'none' }}
        autoPlay
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      >
        {captions && (
          <track
            // label='English'
            kind='subtitles'
            // srcLang='en'
            src={captions}
            default
          />
        )}
      </video>

      <div
        className='played-icon'
        style={{
          opacity: showIcon && !isPlaying ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${showIcon && !isPlaying ? 1.2 : 1})`,
        }}
      >
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
          <polygon points='5 3 19 12 5 21 5 3'></polygon>
        </svg>
      </div>

      <div
        className='paused-icon'
        style={{
          opacity: showIcon && isPlaying ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${showIcon && isPlaying ? 1.2 : 1})`,
        }}
      >
        <svg viewBox='0 0 24 24'>
          <rect x='6' y='4' width='4' height='16'></rect>
          <rect x='14' y='4' width='4' height='16'></rect>
        </svg>
      </div>

      <div className='controls-container' style={{ opacity: isMouseMoving ? 1 : 0 }}>
        <div className='progress-controls'>
          <Seeker
            max={duration.total}
            value={duration.watched}
            onChange={newValue => {
              videoRef.current.currentTime = newValue;
              setDuration({ ...duration, watched: newValue });
            }}
          />
          <div className='time-remaining'>{getRemainingTime()}</div>
        </div>

        <div className='controls'>
          <button className='play-pause' onClick={togglePlay}>
            {isPlaying ? (
              <svg className='paused' viewBox='0 0 24 24'>
                <rect x='6' y='4' width='4' height='16'></rect>
                <rect x='14' y='4' width='4' height='16'></rect>
              </svg>
            ) : (
              <svg
                className='playing'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
              >
                <polygon points='5 3 19 12 5 21 5 3'></polygon>
              </svg>
            )}
          </button>
          <button className='rewind' onClick={rewind}>
            <svg viewBox='0 0 24 24'>
              <path
                fill='#ffffff'
                d='M12.5,3C17.15,3 21.08,6.03 22.47,10.22L20.1,11C19.05,7.81 16.04,5.5 12.5,5.5C10.54,5.5 8.77,6.22 7.38,7.38L10,10H3V3L5.6,5.6C7.45,4 9.85,3 12.5,3M10,12V22H8V14H6V12H10M18,14V20C18,21.11 17.11,22 16,22H14A2,2 0 0,1 12,20V14A2,2 0 0,1 14,12H16C17.11,12 18,12.9 18,14M14,14V20H16V14H14Z'
              />
            </svg>
          </button>

          <button className='fast-forward' onClick={forward}>
            <svg viewBox='0 0 24 24'>
              <path
                fill='#ffffff'
                d='M10,12V22H8V14H6V12H10M18,14V20C18,21.11 17.11,22 16,22H14A2,2 0 0,1 12,20V14A2,2 0 0,1 14,12H16C17.11,12 18,12.9 18,14M14,14V20H16V14H14M11.5,3C14.15,3 16.55,4 18.4,5.6L21,3V10H14L16.62,7.38C15.23,6.22 13.46,5.5 11.5,5.5C7.96,5.5 4.95,7.81 3.9,11L1.53,10.22C2.92,6.03 6.85,3 11.5,3Z'
              />
            </svg>
          </button>

          <button className='volume' onClick={toggleMuted}>
            {volume === 0 ? (
              <svg className='muted' viewBox='0 0 24 24'>
                <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'></polygon>
                <line x1='23' y1='9' x2='17' y2='15'></line>
                <line x1='17' y1='9' x2='23' y2='15'></line>
              </svg>
            ) : (
              <svg className='full-volume' viewBox='0 0 24 24'>
                <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'></polygon>
                <path d='M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'></path>
              </svg>
            )}
          </button>

          <div>
            <Seeker
              max={100}
              playheadSize={15}
              hidePlayhead={false}
              value={volume}
              onChange={newValue => setVolume(newValue)}
            />
          </div>

          <p className='title'>
            <span className='series'>{name}</span>{' '}
            {/* <span className='episode'>Episode 30</span> */}
          </p>

          <label className='captions' htmlFor='subtitle'>
            <svg viewBox='0 0 20 20'>
              <path d='M17 0H3a3 3 0 00-3 3v10a3 3 0 003 3h11.59l3.7 3.71A1 1 0 0019 20a.84.84 0 00.38-.08A1 1 0 0020 19V3a3 3 0 00-3-3zM3.05 9.13h2a.75.75 0 010 1.5h-2a.75.75 0 110-1.5zm3.89 4.44H3.05a.75.75 0 010-1.5h3.89a.75.75 0 110 1.5zm5 0H10a.75.75 0 010-1.5h2a.75.75 0 010 1.5zm0-2.94H8.08a.75.75 0 010-1.5H12a.75.75 0 010 1.5zm5 0H15a.75.75 0 010-1.5h2a.75.75 0 010 1.5z' />
            </svg>
          </label>
          <input
            style={{ display: 'none' }}
            id='subtitle'
            type='file'
            // accept='*.srt'
            onChange={handleSubtitleChange}
          />

          <button className='full-screen' onClick={toggleFullscreen}>
            {isFullscreen ? (
              <svg className='minimize' viewBox='0 0 24 24'>
                <path d='M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'></path>
              </svg>
            ) : (
              <svg className='maximize' viewBox='0 0 24 24'>
                <path d='M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
