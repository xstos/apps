
function DrawTriangle(x1,y1,x2,y2,x3,y3) {
    // Sort vertices top to bottom
    if (y3 < y1) {
        let tmp = x3
        x3=x1
        x1=tmp

        tmp = y3
        y3=y1
        y1=tmp
    }
    if (y2 < y1) {
        let tmp = x2
        x2=x1
        x1=tmp

        tmp = y2
        y2=y1
        y1=tmp
    }
    if (y3 < y2) {
        let tmp = x3
        x3 = x2
        x2 = tmp

        tmp = y3
        y3 = y2
        y2 = tmp
    }

    if (y1 == y2) { // Flat top
        if (x1 < x2) {
            DrawFlatTriangle(x3,y3, x2,y2, x1,y1);
        }
        else {
            DrawFlatTriangle(x3,y3, x1,y1, x2,y2);
        }
    }
    else {
        if (y2 == y3) { // Flat bottom
                if (x2 < x3) {
                    DrawFlatTriangle(x1,y1, x2,y2, x3,y3);
                }
                else {
                    DrawFlatTriangle(x1,y1, x3,y3, x2,y2);
                }
            }
                // Split triangle if it has no horizontal edges
                // Assuming int's here, use epsilon if floats
            // else if (v2[1] != v1[1] && v3[1] != v1[1] && v2[1] != v3[1]) {
            else {
                let ratio = (y2 - y1) / (y3 - y1);
                let newX = (x3 - x1) * ratio + x1;

                // Draw the split sub-triangles
                if (newX < x2) {
                    DrawFlatTriangle(x1,y1, newX, y2, x2,y2);
                    DrawFlatTriangle(x3,y3, x2,y2, newX, y2);
                }
                else {
                    DrawFlatTriangle(x1,y1, x2,y2, newX, y2);
                    DrawFlatTriangle(x3,y3, x2,y2, newX, y2);
                }
            }
    }
}
function DrawFlatTriangle(x1,y1, x2,y2, x3,y3) {
    let height = y2 - y1;

    if (height == 0) {
        return;
    }

    let dx_left = (x2 - x1) / height;
    let dx_right = (x3 - x1) / height;

    let cx_left = x1;
    let cx_right = x1;

    if (y1 < y2) {
        for (let y = y1; y <= y2; ++y) {
            hline(y,cx_left,cx_right)

            cx_left += dx_left;
            cx_right += dx_right;
        }
    }
    else {
        for (let y = y1; y >= y2; --y) {
            hline(y,cx_left,cx_right)
            cx_left -= dx_left;
            cx_right -= dx_right;
        }
    }
}

function hline(y,x1,x2) {
    // insert pixel op here
}