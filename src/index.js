import domready from "domready"
import raf from "raf"
// noinspection ES6UnusedImports
import STYLE from "./style.css"
import intersection from "./intersection";

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

let ctx, canvas;


class DemoState
{
    x0 = 200;
    y0 = 200;
    x1 = 800;
    y1 = 800;
    cx = 700;
    cy = 700;
    r = 300;

    updateBox = true;
    dragging = false;
}

const state = new DemoState();

let prevCount, prevResult;


domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth - 300) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        document.getElementById("form").addEventListener("submit", ev => ev.preventDefault(), true)
        document.getElementById("shape-box").addEventListener("change", ev => state.updateBox = true, true)
        document.getElementById("shape-circle").addEventListener("change", ev => state.updateBox = false, true)

        function mainLoop()
        {
            ctx.fillStyle = "#000";
            ctx.fillRect(0,0,width,height)

            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(Math.min(state.x0, state.x1),Math.min(state.y0, state.y1), Math.abs(state.x0 - state.x1), Math.abs(state.y0 - state.y1));

            ctx.fillStyle = "rgba(0,0,255,0.5)";
            ctx.beginPath();
            ctx.arc(state.cx, state.cy, state.r, 0, TAU, false);
            ctx.fill();

            const imageData = ctx.getImageData(0, 0, width, height);

            const { data } = imageData;


            let offset = 0;
            let count = 0;
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++)
                {
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];

                    if (r > 0 && b > 0)
                    {
                        count++;
                    }

                    offset += 4;
                }
            }

            if (count !== prevCount)
            {
                prevCount = count;
                document.getElementById("pixel-out").innerHTML = String(count) + " purplish pixel";
            }

            const result = intersection(state.x0, state.x1, state.y0, state.y1, state.cx, state.cy, state.r);
            if (result !== prevResult)
            {
                prevResult = result;
                document.getElementById("result-out").innerHTML = String(result);
            }

        }

        window.addEventListener("mousedown", ev => {
            const rect = canvas.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;

            if (x >= 0 && x < width && y >= 0 && y < height)
            {
                if (state.updateBox)
                {
                    state.x0 = x;
                    state.y0 = y;
                }
                else
                {
                    state.cx = x;
                    state.cy = y;
                }

                state.dragging = true;
                raf(mainLoop)
            }

        })
        window.addEventListener("mousemove", ev => {

            if (state.dragging)
            {
                const rect = canvas.getBoundingClientRect();
                const x = ev.clientX - rect.left;
                const y = ev.clientY - rect.top;

                if (state.updateBox)
                {
                    state.x1 = x;
                    state.y1 = y;
                }
                else
                {
                    const dx = state.cx - x;
                    const dy = state.cy - y;
                    state.r = Math.sqrt(dx*dx+dy*dy);
                }
            }
            raf(mainLoop)
        })
        window.addEventListener("mouseup", ev => {
            if (state.dragging)
            {
                state.dragging = false;
            }
            raf(mainLoop)
        })

        raf(mainLoop)
    }
);
