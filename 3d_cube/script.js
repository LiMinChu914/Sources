import { vec3 } from "./lib/glMatrix/src/index.js";
import { Monitor } from "./3d_graph_cpu/screen/screen.js";
import { Mesh } from "./3d_graph_cpu/mesh/mesh_manage.js";
import { Controller } from "./3d_graph_cpu/core/create_render.js";
//import { GLScreen } from "./lib/screen/screen.js";


window.addEventListener("load", startup);



function startup() {
    const screen = new Monitor('canvas', 900, 900, 4, 4, '#000000');
    let mesh = new Mesh([
        -1, -1 ,3,
        -1, 0.5 ,3,
        0.5, 0.5, 3,
        0.5, -1, 3,
        -1, -1, 4.5,
        -1, 0.5, 4.5,
        0.5, 0.5, 4.5,
        0.5, -1, 4.5
    ]);
    mesh.set_object_tris([
        0, 1, 2,
        0, 2, 3,
        3, 2, 6,
        3, 6, 7,
        7, 6, 5,
        7, 5, 4,
        4, 5, 1,
        4, 1, 0,
        1, 5, 6,
        1, 6, 2,
        0, 3, 7,
        0, 7, 4
    ]);
    const ctl = new Controller(screen);
    ctl.draw_mesh(mesh, 21, 163, 206);

}
