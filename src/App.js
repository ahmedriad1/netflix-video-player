import { useState } from 'react';
import Player from './components/Player';

const App = () => {
  const [video, setVideo] = useState();

  const handleChange = e => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith('video')) return;

    const name = file.name.split('.');
    name.pop();

    setVideo({ src: URL.createObjectURL(file), name: name.join(' ') });
  };

  return (
    <div className='app'>
      {video ? (
        <Player src={video.src} name={video.name} />
      ) : (
        <div className='input-screen'>
          <label htmlFor='file'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
              />
            </svg>
          </label>
          <input id='file' type='file' accept='video/*' onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default App;
