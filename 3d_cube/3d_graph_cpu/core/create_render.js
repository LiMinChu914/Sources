import { VerticesHandler } from "../mesh/mesh_manage.js";
import { vec3 } from "../../lib/glMatrix/src/index.js";
import { Camera } from "./camera.js";
import { CoordinateTransform } from "./coordinate_transform.js";

export class GetTris{
    constructor(camera){
        this.camera = camera;
    }

    get_tri(mesh, vertices, i){
        let tri_vertice_indices = new Uint32Array(mesh.relations.buffer, 3*i*Uint32Array.BYTES_PER_ELEMENT, 3);
        
        let tri_vertices = new Float32Array(9);
        for(let i = 0; i < 3; i++){
            tri_vertices[i*3] = vertices[3*tri_vertice_indices[i]];
            tri_vertices[i*3+1] = vertices[3*tri_vertice_indices[i]+1];
            tri_vertices[i*3+2] = vertices[3*tri_vertice_indices[i]+2];
        }

        return tri_vertices;
    }

    can_see_from_vcamera(tri_vertices){
        let norm = vec3.normalize(
                vec3.create(),
                vec3.cross(
                    vec3.create(), 
                    vec3.subtract(vec3.create(), new Float32Array(tri_vertices.buffer, 3*Float32Array.BYTES_PER_ELEMENT, 3), new Float32Array(tri_vertices.buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3)),
                    vec3.subtract(vec3.create(), new Float32Array(tri_vertices.buffer, 6*Float32Array.BYTES_PER_ELEMENT, 3), new Float32Array(tri_vertices.buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3))
                )
            );
        
        return [vec3.dot(norm, vec3.subtract(vec3.create(), new Float32Array(tri_vertices.buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3), this.camera.vcamera)) < 0, vec3.dot(norm, vec3.subtract(vec3.create(), new Float32Array(tri_vertices.buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3), this.camera.vcamera))];
    }    

    

    *get_proj_mesh_tris(mesh, coordinate_transform, is_cover = true, r, g, b){
        let proj_vertices = this.camera.projection(mesh);

        for(let i = 0; i < mesh.vertice_num; i++){
            coordinate_transform.transform_vertice(new Float32Array(proj_vertices.buffer, 3*i*Float32Array.BYTES_PER_ELEMENT, 3));
        }

        let draw_tris_vertices = Array(mesh.relations_num);
        for(let i = 0; i < mesh.relations_num; i++){
            draw_tris_vertices[i] = this.get_tri(mesh, proj_vertices, i);
        }

        for(let i = 0; i < mesh.relations_num; i++){
            if(!is_cover || this.can_see_from_vcamera(draw_tris_vertices[i])[0])
                yield [draw_tris_vertices[i], [r*-1*this.can_see_from_vcamera(draw_tris_vertices[i])[1],
                                               g*-1*this.can_see_from_vcamera(draw_tris_vertices[i])[1],
                                               b*-1*this.can_see_from_vcamera(draw_tris_vertices[i])[1],
                                              ]
                      ];
        }

    }
}

export class Controller{
    constructor(screen){
        this.screen = screen;
        this.camera = new Camera(screen.ColSize, screen.RowSize, [0,0,0], 60);
        this.coordinate_transform = new CoordinateTransform(screen.ColSize, screen.RowSize);
        this.getTris = new GetTris(this.camera);
    }

    draw_mesh(mesh, r = 255, g = 255, b = 255){
        this.vertices_handler = new VerticesHandler(mesh.vertices);

        let timer = setInterval(()=>{
            this.vertices_handler.rotateX([-0.25, -0.25, 3.75], (1/40)*Math.PI);
            this.vertices_handler.rotateY([-0.25, -0.25, 3.75], (1/40)*Math.PI);
            this.vertices_handler.rotateZ([-0.25, -0.25, 3.75], (1/80)*Math.PI);
        }, 40);

        const draw = () => {
            this.screen.reset_colors();

            const it = this.getTris.get_proj_mesh_tris(mesh, this.coordinate_transform, true, r, g, b);

            for(let i = it.next(); !i.done; i = it.next()){
                this.screen.fill_triangle(new Float32Array(i.value[0].buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3),
                                         new Float32Array(i.value[0].buffer, 3*Float32Array.BYTES_PER_ELEMENT, 3),
                                         new Float32Array(i.value[0].buffer, 6*Float32Array.BYTES_PER_ELEMENT, 3),
                                         'rgb('+ String(i.value[1][0]) + ',' + String(i.value[1][1]) + ',' + String(i.value[1][2]) + ')'
                                        );

                /*this.screen.draw_triangle(new Float32Array(i.value[0].buffer, 0*Float32Array.BYTES_PER_ELEMENT, 3),
                                          new Float32Array(i.value[0].buffer, 3*Float32Array.BYTES_PER_ELEMENT, 3),
                                          new Float32Array(i.value[0].buffer, 6*Float32Array.BYTES_PER_ELEMENT, 3),
                                          'rgb(169, 27, 197)'
                                        );*/
            }
            //this.camera.set_vcamera(vec3.add(vec3.create(), this.camera.vcamera, [0,0.01,0]));
            this.screen.update();
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
        //setInterval(draw, 40);
    }
}