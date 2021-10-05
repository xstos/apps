
import * as React from "react";
import { render } from "react-dom";
import Grid from "@material-ui/core/Grid";
function Align(props) {
    const {
        children,
        top,
        middle,
        bottom,
        left,
        center,
        right,
        style,
        ...rest
    } = props;
    const height = ((top || bottom || middle) && "100%") || undefined;
    const width = ((left || right || center) && "100%") || undefined;
    const justify =
        (left && "flex-start") ||
        (right && "flex-end") ||
        (center && "center") ||
        undefined;
    const alignItems =
        (top && "flex-start") ||
        (middle && "center") ||
        (bottom && "flex-end") ||
        undefined;
    return (
        <Grid
            container
            style={{
                height,
                width,
                ...style
            }}
            justify={justify}
            alignItems={alignItems}
            {...rest}
        >
            {children}
        </Grid>
    );
}
function CenteringExample() {
    return <Align right>sup</Align>;
}
export function Dock(props) {
    const {
        row,
        column,
        fullHeight,
        fullWidth,
        fill,
        children,
        style,

        top,
        middle,
        bottom,
        left,
        center,
        right,
        ...rest
    } = props;
    const isContainer = row || column;
    const hasAlign = top || middle || bottom || left || center || right;
    const alignedChildren = hasAlign ? (
        <Align
            top={top}
            middle={middle}
            bottom={bottom}
            left={left}
            center={center}
            right={right}
            fullHeight={fullHeight}
            fullWidth={fullWidth}
            {...style}
        >
            {children}
        </Align>
    ) : (
        children
    );
    return (
        <Grid
            style={{
                ...{
                    height: fullHeight && "100%",
                    width: fullWidth && "100%"
                    //border: "1px solid black"
                },
                ...style
            }}
            container={isContainer || undefined}
            direction={row ? "column" : column ? "row" : undefined}
            item={!isContainer}
            xs={fill}
            {...rest}
        >
            {alignedChildren}
        </Grid>
    );
}
function Example2() {
    return (
        <Dock column fullWidth fullHeight>
            <Dock row fill>
                <Dock>hello</Dock>
                <Dock>hello</Dock>
                <Dock fullHeight style={{ backgroundColor: "red" }} fill>
                    hello
                </Dock>
            </Dock>
            <Dock fill />
        </Dock>
    );
}
function Example(props) {
    //return CenteringExample();
    return (
        <Dock row fullHeight>
            <Dock style={{ backgroundColor: "LightPink" }}>AAA</Dock>
            <Dock fill>
                <Dock column fullHeight>
                    <Dock center style={{ backgroundColor: "LightBlue" }}>
                        CCC
                    </Dock>
                    <Dock style={{ backgroundColor: "LightGreen" }}>DDD</Dock>
                    <Dock style={{ backgroundColor: "LightSeaGreen" }}>EEE</Dock>
                    <Dock style={{ backgroundColor: "blue" }} fill>
                        <Dock row fullHeight>
                            <Dock middle style={{ backgroundColor: "LightGray" }}>
                                FFF
                            </Dock>
                            <Dock
                                fullHeight
                                middle
                                center
                                style={{ backgroundColor: "LightSkyBlue" }}
                                fill
                            >
                                GGG
                            </Dock>
                        </Dock>
                    </Dock>
                    <Dock bottom style={{ backgroundColor: "Cyan" }}>
                        Right
                    </Dock>
                </Dock>
            </Dock>
            <Dock style={{ backgroundColor: "LightSalmon" }}>BBB</Dock>
        </Dock>
    );
}

function App() {
    return <Example />;
}
function renderApp() {
    document.querySelector("#root").style.height = "500px";
    render(<App />, document.querySelector("#root"));
}
renderApp();
