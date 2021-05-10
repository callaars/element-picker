type DocumentWindows = { win: Window; doc: DocumentExtended }[];

type StartOptions = {
  onClick: (element: Element) => void;
  ignore?: (element: Element) => boolean;
  hoverStyle?: any;
};

type ElementSize = {
  x: string;
  y: string;
  height: string;
  width: string;
};

type DocumentAttached = {
  window: Window;
  document: DocumentExtended;
  onMouseClick: (_: any) => void;
  onMouseMove: (_: any) => void;
  onScroll: (_: any) => void;
};

type IgnoreFunction = null | ((element: Element) => boolean);

interface DocumentExtended extends Document {
  __hoverId?: string;
}

let documentsAttached: DocumentAttached[] = [];

let onClick = (_: any) => {};
let applyStyle: Partial<CSSStyleDeclaration> = {};
let igoreFilter: IgnoreFunction = null;

let lastTarget: HTMLElement | null = null;

let currentHoverDocument: DocumentExtended | null;
let lastHoverDocument: DocumentExtended | null;

const mousePosition = { x: 0, y: 0 };

let tickRequest: number;

let scrollPositions: { [iframe: string]: { x: number; y: number } } = {};

const getElementSize = (
  offsetX: number,
  offsetY: number,
  element: HTMLElement
): ElementSize => {
  const vector = element.getBoundingClientRect();

  return {
    x: `${offsetX + vector.left}px`,
    y: `${offsetY + vector.top}px`,
    height: `${element.offsetHeight}px`,
    width: `${element.offsetWidth}px`,
  };
};

const reset = () => {
  if (tickRequest) {
    window.cancelAnimationFrame(tickRequest);
  }

  documentsAttached.forEach((props) => {
    const {
      onMouseClick,
      onMouseMove,
      document: doc,
      window: win,
      onScroll,
    } = props;

    doc.body.style.cursor = 'auto';

    doc.__hoverId = undefined;
    doc.removeEventListener('click', onMouseClick, true);
    doc.removeEventListener('mousemove', onMouseMove, true);

    removeTargetStyle(doc);

    win.removeEventListener('scroll', onScroll, true);
  });

  documentsAttached = [];
  onClick = (_: any) => {};
  lastTarget = null;
  currentHoverDocument = null;
  lastHoverDocument = null;
  scrollPositions = {};
};

const removeTargetStyle = (doc: DocumentExtended) => {
  const hoverBox = doc.getElementById('hoverbox');

  try {
    hoverBox?.remove();
  } catch (error) {
    console.warn('Document error', error, doc, hoverBox);
  }
};

const hideTargetStyle = (doc: DocumentExtended) => {
  let hoverBox = doc.getElementById('hoverbox');

  if (!hoverBox) {
    return;
  }

  hoverBox.style.pointerEvents = 'none';
};

const applyTargetStyle = (doc: DocumentExtended, target: HTMLElement) => {
  let hoverBox = doc.getElementById('hoverbox');

  if (!hoverBox) {
    const div = doc.createElement('div');

    div.id = 'hoverbox';
    div.style.border = '2px solid orange';
    div.style.position = 'absolute';
    div.style.zIndex = '100';

    doc.body.appendChild(div);

    hoverBox = doc.getElementById('hoverbox');
  }

  const { x = 0, y = 0 } = scrollPositions[doc.__hoverId!] || {};

  const size = getElementSize(x, y, target);

  hoverBox!.style.pointerEvents = 'auto';
  hoverBox!.style.top = size.y;
  hoverBox!.style.left = size.x;
  hoverBox!.style.width = size.width;
  hoverBox!.style.height = size.height;
};

const onMouseClick = (event: MouseEvent) => {
  event.preventDefault && event.preventDefault();
  event.stopPropagation && event.stopPropagation();

  onClick(lastTarget);

  reset();
};

const onMouseMove = (doc: DocumentExtended) => (event: MouseEvent) => {
  lastHoverDocument = currentHoverDocument;
  currentHoverDocument = doc;

  mousePosition.x = event.x;
  mousePosition.y = event.y;
};

const onScroll = (win: Window, index: string) => () => {
  scrollPositions[index] = {
    x: win.scrollX,
    y: win.scrollY,
  };
};

const tick = () => {
  if (currentHoverDocument) {
    if (
      lastHoverDocument &&
      lastHoverDocument.__hoverId !== currentHoverDocument.__hoverId
    ) {
      removeTargetStyle(lastHoverDocument);
    }

    hideTargetStyle(currentHoverDocument);

    const freshTarget = currentHoverDocument.elementFromPoint(
      mousePosition.x,
      mousePosition.y
    ) as HTMLElement;

    if (freshTarget && (!igoreFilter || !igoreFilter(freshTarget))) {
      lastTarget = freshTarget;
      applyTargetStyle(currentHoverDocument, lastTarget);
    }
  }

  tickRequest = window.requestAnimationFrame(tick);
};

const parseFrames = (doc: Document, documentWindows: DocumentWindows) => {
  doc.querySelectorAll('iframe').forEach((iframe, index) => {
    if (iframe.contentDocument) {
      (iframe.contentDocument as DocumentExtended).__hoverId = `doc-${index}`;

      documentWindows.push({
        doc: iframe.contentDocument as DocumentExtended,
        win: iframe.contentWindow!,
      });

      parseFrames(iframe.contentDocument, documentWindows);
    }
  });

  doc.querySelectorAll('frame').forEach((frame, index) => {
    if (frame.contentDocument) {
      (frame.contentDocument as DocumentExtended).__hoverId = `doc-${index}`;

      documentWindows.push({
        doc: frame.contentDocument as DocumentExtended,
        win: frame.contentWindow!,
      });

      parseFrames(frame.contentDocument, documentWindows);
    }
  });
};

const start = (options: StartOptions) => {
  onClick = options.onClick;
  applyStyle = options.hoverStyle || {};
  igoreFilter = options.ignore || null;

  (document as DocumentExtended).__hoverId = `doc-${0}`;

  const documentWindows: DocumentWindows = [
    { doc: document as DocumentExtended, win: window },
  ];

  parseFrames(document, documentWindows);

  documentWindows.forEach(({ doc, win }) => {
    doc.body.style.cursor = 'pointer';

    const eventMouseClick = onMouseClick;
    const eventMouseMove = onMouseMove(doc);
    const eventOnScroll = onScroll(win, doc.__hoverId!);

    documentsAttached.push({
      window: win,
      onScroll: eventOnScroll,
      onMouseMove: eventMouseMove,
      onMouseClick: eventMouseClick,
      document: doc,
    });

    doc.addEventListener('click', eventMouseClick, true);
    doc.addEventListener('mousemove', eventMouseMove, true);

    win.addEventListener('scroll', eventOnScroll, true);

    scrollPositions[doc.__hoverId!] = {
      x: win.scrollX,
      y: win.scrollY,
    };

    tick();
  });
};

export default { start };
