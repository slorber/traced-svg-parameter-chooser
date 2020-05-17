import rough from 'roughjs';

/**
 * Attributes that should not be transferred to the new shape
 */

const blacklist = [
  'cx',
  'cy',
  'd',
  'fill',
  'height',
  'points',
  'r',
  'rx',
  'ry',
  'stroke-width',
  'stroke',
  'width',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2'
];

/**
 * Convert an svg server-side with rough
 * @kind function
 * @param {string} input An svg string to render with rough
 * @param {Object} [options={}] Global configuration options for rough
 * @returns {string} The converted svg as a string
 */

export const coarse = (svg, options = {}) => {
  // const { window } = new JSDOM();

  // Parse svg and initialize rough
  // window.document.body.insertAdjacentHTML('beforebegin', input);
  // const svg = window.document.querySelector('svg');
  const rc = rough.svg(svg, { options });

  // Get all descendants of the svg that should be processed
  const children = svg.querySelectorAll('circle, rect, ellipse, line, polygon, polyline, path');

  // Loop through all child elements
  for (let i = 0; i < children.length; i += 1) {
    const original = children[i];
    const params = [];
    let shapeType;

    switch (original.tagName) {
      case 'circle':
        params.push(...getNum(original, ['cx', 'cy']), ...getDiam(original, ['r']));
        shapeType = 'circle';
        break;
      case 'rect':
        params.push(...getNum(original, ['x', 'y', 'width', 'height']));
        shapeType = 'rectangle';
        break;
      case 'ellipse':
        params.push(...getNum(original, ['cx', 'cy']), ...getDiam(original, ['rx', 'ry']));
        shapeType = 'ellipse';
        break;
      case 'line':
        params.push(...getNum(original, ['x1', 'y1', 'x2', 'y2']));
        shapeType = 'line';
        break;
      case 'polygon':
        params.push(getCoords(original, 'points'));
        shapeType = 'polygon';
        break;
      case 'polyline':
        params.push(getCoords(original, 'points'));
        shapeType = 'linearPath';
        break;
      case 'path':
        params.push(original.getAttribute('d'));
        shapeType = 'path';
        break;
    }

    // Generate the new shape
    const replacement = rc[shapeType](...params, getSettings(original));

    // Get all attributes from the original element that should be copied over
    const attributes = getAttributes(original).filter(
      attribute => !blacklist.includes(attribute.name)
    );

    // Copy all valid attributes to the replacement
    attributes.forEach(({ name, value }) => {
      replacement.setAttribute(name, value);
    });

    original.replaceWith(replacement);
  }

  return svg.outerHTML;
};





const getAttributes = element => Array.prototype.slice.call(element.attributes);

const getNum = (element, attributes) =>
  attributes.map(attribute => parseFloat(element.getAttribute(attribute), 10));

const getDiam = (element, attributes) =>
  attributes.map(attribute => 2 * parseFloat(element.getAttribute(attribute), 10));

const getCoords = (element, attribute) =>
  element
    .getAttribute(attribute)
    .trim()
    .split(' ')
    .filter(item => item.length > 0)
    .map(item =>
      item
        .trim()
        .split(',')
        .map(num => parseFloat(num, 10))
    );

const getSettings = element => {
  const settings = {};

  if (element.hasAttribute('stroke')) {
    settings.stroke = element.getAttribute('stroke');
  }

  if (element.hasAttribute('fill')) {
    settings.fill = element.getAttribute('fill');
  }

  if (element.hasAttribute('stroke-width') && !element.getAttribute('stroke-width').includes('%')) {
    settings.strokeWidth = parseFloat(element.getAttribute('stroke-width'), 10);
  }

  return settings;
};
