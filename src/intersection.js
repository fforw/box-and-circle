function assert(b)
{
    if (!b)
    {
        console.error("Assertion failed", new Error().stack)
    }
}


function section(h, r = 1) // returns the positive root of intersection of line y = h with circle centered at the origin and radius r
{
    assert(r >= 0); // assume r is positive, leads to some simplifications in the formula below (can factor out r from the square root)
    return (h < r) ? Math.sqrt(r * r - h * h) : 0; // http://www.wolframalpha.com/input/?i=r+*+sin%28acos%28x+%2F+r%29%29+%3D+h
}


function g(x, h, r = 1) // indefinite integral of circle segment
{
    return .5 * (Math.sqrt(1 - x * x / (r * r)) * x * r + r * r * Math.asin(x / r) - 2 * h * x); // http://www.wolframalpha.com/input/?i=r+*+sin%28acos%28x+%2F+r%29%29+-+h
}


function area(x0, x1, h, r) // area of intersection of an infinitely tall box with left edge at x0, right edge at x1, bottom edge at h and top edge at infinity, with circle centered at the origin with radius r
{
    if (x0 > x1)
    {
        const h = x0;
        x0 = x1;
        x1 = h;
    } // this must be sorted otherwise we get negative area
    const s = section(h, r);
    return g(Math.max(-s, Math.min(s, x1)), h, r) - g(Math.max(-s, Math.min(s, x0)), h, r); // integrate the area
}


function areaCentered(x0, x1, y0, y1, r) // area of the intersection of a finite box with a circle centered at the origin with radius r
{
    if (y0 > y1)
    {
        const h = y0;
        y0 = y1;
        y1 = h;
    }

    if (y0 < 0)
    {
        if (y1 < 0)
        {
            return areaCentered(x0, x1, -y0, -y1, r);
        }// the box is completely under, just flip it above and try again
        else
        {
            return areaCentered(x0, x1, 0, -y0, r) + areaCentered(x0, x1, 0, y1, r);
        } // the box is both above and below, divide it to two boxes and go again
    }
    else
    {
        assert(y1 >= 0); // y0 >= 0, which means that y1 >= 0 also (y1 >= y0) because of the swap at the beginning
        return area(x0, x1, y0, r) - area(x0, x1, y1, r); // area of the lower box minus area of the higher box
    }
}


export default function intersection(x0, x1, y0, y1, cx, cy, r) // area of the intersection of a general box with a general circle
{
    x0 -= cx;
    x1 -= cx;
    y0 -= cy;
    y1 -= cy;
    // get rid of the circle center

    return areaCentered(x0, x1, y0, y1, r);
}
