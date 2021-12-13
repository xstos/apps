import {Grid} from "@material-ui/core";

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
        fullWidth,
        fullHeight,
        ...rest
    } = props;
    const height = ((top || bottom || middle) && '100%') || undefined;
    const width = ((left || right || center) && '100%') || undefined;
    const justify =
        (left && 'flex-start') || (right && 'flex-end') || (center && 'center') || undefined;
    const alignItems =
        (top && 'flex-start') || (middle && 'center') || (bottom && 'flex-end') || undefined;
    return (
        <Grid
            container
    style={{
        height,
            width,
    ...style,
    }}
    justify={justify}
    alignItems={alignItems}
    {...rest}
>
    {children}
    </Grid>
);
}