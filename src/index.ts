type StartOptions = {
  onClick: (element: Element) => void;
  hoverStyle?: any;
};

let onClick = (_: any) => {};
let applyStyle: Partial<CSSStyleDeclaration> = {};

let lastTarget: HTMLElement | null = null;
let lastTargetStyle: Partial<CSSStyleDeclaration> = {};

const reset = () => {
  document.body.style.cursor = 'auto';

  document.removeEventListener('click', onMouseClick, false);
  document.removeEventListener('mousemove', onMouseClick, false);

  const iframes = document.querySelectorAll('iframe');

  iframes.forEach((iframe) => {
    if (iframe.contentDocument?.body) {
      iframe.contentDocument.body.style.cursor = 'auto';
    }

    iframe.contentDocument?.removeEventListener('click', onMouseClick, false);
    iframe.contentDocument?.removeEventListener(
      'mousemove',
      onMouseMove,
      false
    );
  });

  removeTargetStyle();

  applyStyle = {};
  onClick = (_: any) => {};

  lastTarget = null;
  lastTargetStyle = {};
};

const removeTargetStyle = () => {
  if (lastTarget) {
    Object.keys(applyStyle).forEach((key: any) => {
      lastTarget!.style[key] = lastTargetStyle[key] || '';
    });
  }
};

const applyTargetStyle = (target: any) => {
  Object.keys(applyStyle).forEach((key: any) => {
    lastTargetStyle[key] = target.style[key];
    target.style[key] = applyStyle[key];
  });
};

const onMouseClick = (event: Event) => {
  event.preventDefault && event.preventDefault();
  event.stopPropagation && event.stopPropagation();

  onClick(event.target);
  reset();
};

const onMouseMove = (event: Event) => {
  removeTargetStyle();

  lastTarget = event.target as HTMLElement;

  applyTargetStyle(lastTarget);
};

const start = (options: StartOptions) => {
  reset();

  onClick = options.onClick;
  applyStyle = options.hoverStyle || {};

  document.body.style.cursor = 'pointer';

  document.addEventListener('click', onMouseClick, false);
  document.addEventListener('mousemove', onMouseMove, false);

  const iframes = document.querySelectorAll('iframe');

  iframes.forEach((iframe) => {
    if (iframe.contentDocument) {
      if (iframe.contentDocument?.body) {
        iframe.contentDocument.body.style.cursor = 'pointer';
      }

      iframe.contentDocument?.addEventListener('click', onMouseClick, {
        capture: true,
      });
      iframe.contentDocument?.addEventListener('mousemove', onMouseMove, {
        capture: true,
      });
    }
  });
};

export default { start };
