export const createText = (pos, string, style = {}) => ({
  x: pos.x,
  y: pos.y,
  text: string,
  style: {
    ...defaultStyle,
    ...style
  }
});

const defaultStyle = {
    font: '8px monospace',
    fill: '#000'
  }