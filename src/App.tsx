import * as React from "react";

// @ts-ignore
import {createPotrace} from "./potrace";
import {useEffect, useRef, useState} from "react";

const TurnPolicies = ["black", "white", "left", "right", "minority", "majority"] as const;
type TurnPolicy = typeof TurnPolicies[number];


type TracedSvgProps = {
    url: string
    color: string
    width: number;

    // turnpolicy: how to resolve ambiguities in path decomposition. (default: "minority")
    turnPolicy?: TurnPolicy

    // turdsize: suppress speckles of up to this size (default: 2)
    turdSize?: number;

    // optcurve: turn on|off curve optimization (default: true)
    optimizeCurve?: boolean

    // alphamax: corner threshold parameter (default: 1)
    alphaMax?: number;

    // opttolerance: curve optimization tolerance (default: 0.2)
    curveOptimizationTolerance?: number
}


const useTracedSvg = ({url, turnPolicy, turdSize, optimizeCurve, alphaMax, curveOptimizationTolerance}: TracedSvgProps) => {
    const [svg, setSvg] = useState<string | null>(null);

    useEffect(() => {
        setSvg(null);
        const imgUrl = "lena.jpg"
        const potrace = createPotrace();

        const params: any = {
            ...(turnPolicy && ({turnpolicy: turnPolicy})),
            ...(turdSize && ({turdsize: turdSize})),
            ...(optimizeCurve && ({optcurve: optimizeCurve})),
            ...(alphaMax && ({alphamax: alphaMax})),
            ...(curveOptimizationTolerance && ({opttolerance: curveOptimizationTolerance})),
        };
        potrace.setParameter(params)

        const loadImage = () => potrace.loadImageFromUrl(imgUrl);
        loadImage();
        potrace.process(() => {
            const svgResult = potrace.getSVG(1);
            // console.debug("svgResult",svgResult);
            setSvg(svgResult);
        })
    }, [url, turnPolicy, turdSize, optimizeCurve, alphaMax, curveOptimizationTolerance])

    return svg;
}


const TracedSvg = (props: TracedSvgProps) => {
    const {width, color, url} = props;
    const svg = useTracedSvg(props);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (svg === null) {
            return;
        }
        const div = ref.current!;
        div.innerHTML = svg;
        const svgElement = div.firstChild! as SVGElement;

        const originalWidth = parseInt(svgElement.getAttribute("width")!)
        const originalHeight = parseInt(svgElement.getAttribute("height")!)
        svgElement.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);


        const ratio = originalWidth / originalHeight
        const finalWidth = width;
        const finalHeight = width / ratio;
        svgElement.setAttribute("width", `${finalWidth}`);
        svgElement.setAttribute("height", `${finalHeight}`);


        svgElement.style.color = color;
        svgElement.childNodes.forEach((path: any) => {
            path.style.fill = "currentColor"
        });

        return () => svgElement.remove();

    }, [svg, width, color]);

    return (
        <div ref={ref} style={{width}}/>
    )
}


function App({}: React.Props<{}>) {
    const width = 300;
    const url = "lena.jpg";

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                flexWrap: "wrap"
            }}>
                <div style={{padding: 10}}>
                    <img src={url} style={{width}}/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="minority"/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="majority"/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="black"/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="white"/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="left"/>
                </div>
                <div style={{padding: 10}}>
                    <TracedSvg url="lena.jpg" color="lightgrey" width={width} turnPolicy="right"/>
                </div>
            </div>
        </>
    );
}

export default App;
