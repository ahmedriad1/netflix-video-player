import { Range, getTrackBackground } from 'react-range';

const Seeker = ({
  value,
  max,
  onChange = () => {},
  hidePlayhead = true,
  playheadSize = 20,
}) => {
  return (
    <Range
      step={1}
      min={0}
      max={max || 1}
      values={[value]}
      onChange={newValues => onChange(newValues[0])}
      renderTrack={({ props, children }) => (
        <div
          {...props}
          className='track'
          style={{
            ...props.style,
            cursor: 'pointer',
            height: '6px',
            width: '100%',
            background: getTrackBackground({
              values: [value],
              colors: ['#e31221', '#5b5b5b'],
              min: 0,
              max: max || 1,
            }),
          }}
        >
          {children}
        </div>
      )}
      renderThumb={({ props }) => (
        <div
          {...props}
          style={{
            ...props.style,
            opacity: hidePlayhead ? 0 : 1,
            height: playheadSize,
            width: playheadSize,
          }}
          className='thumb'
        />
      )}
    />
  );
};

export default Seeker;
