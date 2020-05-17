import * as React from 'react';

import rough from 'roughjs';


// @ts-ignore
import {createPotrace} from './potrace';

// @ts-ignore
import {coarse} from './coarse';


type RoughConfig = Exclude<Parameters<typeof rough.svg>[1], undefined>['options']


import {ComponentProps, ReactNode, useEffect, useRef, useState} from 'react';

const TurnPolicies = [
  'black',
  'white',
  'left',
  'right',
  'minority',
  'majority',
] as const;
type TurnPolicy = typeof TurnPolicies[number];

// See https://github.com/kilobtye/potrace/blob/master/potrace.js
// See also https://github.com/tooolbox/node-potrace#parameters
type TracedSvgProps = {
  url: string;
  color: string;
  width: number;
  style?: ComponentProps<"div">["style"];

  roughOptions?: RoughConfig

  // turnpolicy: how to resolve ambiguities in path decomposition. (default: "minority")
  turnPolicy?: TurnPolicy;

  // turdsize: suppress speckles of up to this size (default: 2)
  turdSize?: number;

  // optcurve: turn on|off curve optimization (default: true)
  optimizeCurve?: boolean;

  // alphamax: corner threshold parameter (default: 1)
  alphaMax?: number;

  // opttolerance: curve optimization tolerance (default: 0.2)
  curveOptimizationTolerance?: number;
};

const useTracedSvg = ({
                        url,
                        turnPolicy,
                        turdSize,
                        optimizeCurve,
                        alphaMax,
                        curveOptimizationTolerance,
                      }: TracedSvgProps) => {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    setSvg(null);
    const imgUrl = 'lena.jpg';
    const potrace = createPotrace();

    const params: any = {
      ...(turnPolicy && {turnpolicy: turnPolicy}),
      ...(turdSize && {turdsize: turdSize}),
      ...(optimizeCurve && {optcurve: optimizeCurve}),
      ...(alphaMax && {alphamax: alphaMax}),
      ...(curveOptimizationTolerance && {
        opttolerance: curveOptimizationTolerance,
      }),
    };
    console.debug('params', params);
    potrace.setParameter(params);

    const loadImage = () => potrace.loadImageFromUrl(imgUrl);
    loadImage();
    potrace.process(() => {
      const svgResult = potrace.getSVG(1);
      // console.debug("svgResult",svgResult);
      setSvg(svgResult);
    });
  }, [
    url,
    turnPolicy,
    turdSize,
    optimizeCurve,
    alphaMax,
    curveOptimizationTolerance,
  ]);

  return svg;
};

const TracedSvg = (props: TracedSvgProps) => {
  const {style, width, color, roughOptions} = props;
  const svg = useTracedSvg(props);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svg === null) {
      return;
    }
    const div = ref.current!;
    div.innerHTML = svg;
    const svgElement = div.firstChild! as SVGElement;

    const originalWidth = parseInt(svgElement.getAttribute('width')!);
    const originalHeight = parseInt(svgElement.getAttribute('height')!);
    svgElement.setAttribute(
      'viewBox',
      `0 0 ${originalWidth} ${originalHeight}`,
    );

    const ratio = originalWidth / originalHeight;
    const finalWidth = width;
    const finalHeight = width / ratio;
    svgElement.setAttribute('width', `${finalWidth}`);
    svgElement.setAttribute('height', `${finalHeight}`);

    //svgElement.style.color = color;
    svgElement.childNodes.forEach((path: any) => {
      //path.style.fill = 'currentColor';
    });

    console.debug('div', div, div.innerHTML);
    if (roughOptions){
        div.innerHTML = coarse(svgElement, roughOptions);
    }

    return () => svgElement.remove();
  }, [svg, width, color, roughOptions]);

  return <div ref={ref} style={{...style}}/>;
};



const Row = ({children}: {children: ReactNode}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      // justifyContent: 'center',
      width: '100%',
      flexWrap: 'wrap',
    }}
  >
    {children}
  </div>
);

function App({}: React.Props<{}>) {
  const width = 300;
  const url = 'lena.jpg';

  return (
    <>
      <Row>

        <div style={{padding: 10}}>
          <img src={url} style={{width}}/>
        </div>
        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
          />
        </div>
        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
            turdSize={5000}
          />
        </div>
        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
            turdSize={5000}
            roughOptions={{roughness: 2.8, fill: 'blue'}}
          />
        </div>
        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
            turdSize={5000}
            roughOptions={{roughness: 8, fill: 'red'}}
          />
        </div>
        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
            turdSize={5000}
            roughOptions={{
              fill: "blue",
              fillStyle: "dashed",
              fillWeight: 1 // thicker lines for hachure
            }}
          />
        </div>

        <div style={{padding: 10}}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="minority"
            turdSize={5000}
            roughOptions={{
              fill: 'red',
              hachureAngle: 60, // angle of hachure,
              hachureGap: 8,
              stroke: 'red',
              bowing: 6,
              strokeWidth: 3
            }}
          />
        </div>
        {/*
        <div style={{ padding: 10 }}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="majority"
          />
        </div>
        <div style={{ padding: 10 }}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="black"
          />
        </div>
        <div style={{ padding: 10 }}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="white"
          />
        </div>
        <div style={{ padding: 10 }}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="left"
          />
        </div>
        <div style={{ padding: 10 }}>
          <TracedSvg
            url="lena.jpg"
            color="lightgrey"
            width={width}
            turnPolicy="right"
          />
        </div>
        */}
      </Row>
      {/*}
            <Row>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        turdSize={5000}
                    />
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        turdSize={0.001}
                    />
                </div>
            </Row>

            <Row>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        alphaMax={5000}
                    />
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        alphaMax={0.001}
                    />
                </div>
            </Row>


            <Row>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        curveOptimizationTolerance={0.001}
                    />
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        curveOptimizationTolerance={1000}
                    />
                </div>
            </Row>


            <Row>
                <div style={{padding: 10}}>
                    <TracedSvg
                        url="lena.jpg"
                        color="lightgrey"
                        width={width}
                        optimizeCurve={false}
                    />
                </div>
            </Row>
            */}
    </>
  );
}

export default App;
