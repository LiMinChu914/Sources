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
    ctl.draw_mesh(mesh, 169, 27, 197);


    /*const glCanvas = document.getElementById("canvas");
    const glScreen = new GLScreen(glCanvas);
    const fps = document.getElementById("fps");
    glScreen.setBackground([0.0, 0.0, 0.0, 1.0]);

    glScreen.start(function () {
        glScreen.beginFrame();

        //engine.rotateZ([-0.5, -0,5, 3], 0.06);
        //engine.rotateY([-0.5, -0,5, 3], 0.05);
        engine.rotateX([-0.5, -0,5, 3], 0.03);

        let cube_tris = engine.projection();

        for (let i = 0; i < 1; i++) {
            for(let j = 0; j < 12; j++){
                glScreen.drawPolygon([
                    cube_tris[j].p1[0],cube_tris[j].p1[1],cube_tris[j].p1[2],
                    cube_tris[j].p2[0],cube_tris[j].p2[1],cube_tris[j].p2[2],
                    cube_tris[j].p3[0],cube_tris[j].p3[1],cube_tris[j].p3[2]
                ], [
                    1.0, 1.0, 0.0, 1.0,
                    0.0, 1.0, 1.0, 1.0,
                    1.0, 0.0, 1.0, 1.0,
                ], 3);
            }
        }
        fps.textContent = glScreen.getFps();
    });*/
}