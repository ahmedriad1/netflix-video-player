const srt2webvtt = data => {
  const cuelist = data
    .replace(/\r+/g, '')
    .replace(/^\s+|\s+$/g, '')
    .split('\n\n');
  let result = '';
  if (cuelist.length > 0) {
    result += 'WEBVTT\n\n';
    for (let i = 0; i < cuelist.length; i = i + 1) {
      result += convertSrtCue(cuelist[i]);
    }
  }
  return result;
};

const convertSrtCue = caption => {
  // remove all html tags for security reasons
  //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
  let cue = '';
  let s = caption.split(/\n/);
  // concatenate muilt-line string separated in array into one
  while (s.length > 3) {
    for (let i = 3; i < s.length; i++) {
      s[2] += '\n' + s[i];
    }
    s.splice(3, s.length - 3);
  }
  let line = 0;
  // detect identifier
  if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
    cue += s[0].match(/\w+/) + '\n';
    line += 1;
  }
  // get time strings
  if (s[line].match(/\d+:\d+:\d+/)) {
    // convert time string
    let m = s[1].match(
      /(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/,
    );
    if (m) {
      cue +=
        m[1] +
        ':' +
        m[2] +
        ':' +
        m[3] +
        '.' +
        m[4] +
        ' --> ' +
        m[5] +
        ':' +
        m[6] +
        ':' +
        m[7] +
        '.' +
        m[8] +
        ' line:-5\n';
      line += 1;
    } else {
      // Unrecognized timestring
      return '';
    }
  } else {
    // file format error or comment lines
    return '';
  }
  // get cue text
  if (s[line]) {
    cue += s[line] + '\n\n';
  }
  return cue;
};

const convert = file => {
  return srt2webvtt(file);
};

export default convert;
