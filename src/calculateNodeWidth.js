export default function calculateNodeWidth(
  uiTextNode,
  sizingStyle,
  hiddenTextarea,
  HIDDEN_TEXTAREA_STYLE,
  minWidth,
  maxWidth,
  autosizeWidthPrecision,
) {
  hiddenTextarea.fill = sizingStyle => {
    // Copied from "if (autosizeWidth) {}" in calculateNodeHeight.js.
    Object.keys(sizingStyle).forEach(key => {
      hiddenTextarea.style[key] = sizingStyle[key];
    });
    Object.keys(HIDDEN_TEXTAREA_STYLE).forEach(key => {
      hiddenTextarea.style.setProperty(
        key,
        HIDDEN_TEXTAREA_STYLE[key],
        'important',
      );
    });
  };

  hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || 'x';

  const getWidthFromCSS = cssWidth => {
    if (cssWidth === '0') {
      return 0;
    }

    const match = cssWidth.match(/^(\d+)px$/);
    if (match) {
      return Number(match[1]);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        'Warning: maxWidth and minWidth should be equal to "0" or match "/^(d+)px$"/',
      );
    }
  };

  minWidth = getWidthFromCSS(minWidth);
  maxWidth = getWidthFromCSS(maxWidth);

  const approximateNodeWidth = () => {
    const getScrollHeight = width => {
      const currentSizingStyle = Object.assign(sizingStyle, {
        width: `${width}px`,
      });
      hiddenTextarea.fill(currentSizingStyle);

      return hiddenTextarea.scrollHeight;
    };

    const initialHigherScrollHeight = getScrollHeight(minWidth);
    const initialLowerScrollHeight = getScrollHeight(maxWidth);
    if (initialHigherScrollHeight === initialLowerScrollHeight) {
      return minWidth;
    }

    const binarySearchMaxWidthMinScrollHeight = (
      lowerBoundary,
      higherBoundary,
      lastLowerScrollHeight,
      lastHigherBoundary,
    ) => {
      if (higherBoundary - lowerBoundary < autosizeWidthPrecision) {
        // lastHigherBoundary should be enough, but for some reason it's not.
        return lastHigherBoundary + 10;
      }

      const lowerScrollHeight = getScrollHeight(higherBoundary);

      if (lowerScrollHeight <= lastLowerScrollHeight) {
        return binarySearchMaxWidthMinScrollHeight(
          lowerBoundary,
          lowerBoundary + (higherBoundary - lowerBoundary) / 2,
          lowerScrollHeight,
          higherBoundary,
        );
      } else {
        return binarySearchMaxWidthMinScrollHeight(
          higherBoundary,
          higherBoundary + (higherBoundary - lowerBoundary),
          lastLowerScrollHeight,
          higherBoundary,
        );
      }
    };

    return binarySearchMaxWidthMinScrollHeight(minWidth, maxWidth, Infinity);
  };

  const width = approximateNodeWidth();
  sizingStyle['width'] = `${width}px`;

  return width;
}
