import { vec3 } from "../../lib/glMatrix/src/index.js";

export class Mesh{
    constructor(vertices){
        this.vertices = new Float32Array(vertices);
        this.vertice_num = Math.floor(vertices.length / 3);
    }

    set_object_tris(relations){
        this.relations = new Uint32Array(relations);
        this.relations_num = Math.floor(relations.length / 3);
    }
}

export class VerticesHandler {

    /**
     * @type {Float32Array}
     */         
    vertices = null;

    /**
     * Number of vertices.
     * @type {number}
     */
    num_vertices = -1;

    /**
     * 
     * @param {Float32Array} vertices 
     */
    constructor(vertices) {
        if (!(vertices instanceof Float32Array))
            throw TypeError("vertices must be Float32Array.");
        this.vertices = vertices;
        this.num_vertices = Math.floor(vertices.length / 3);
    }

    processVertices(callback) {
        for (let i = 0; i < this.num_vertices; i++) {
            const v = new Float32Array(this.vertices.buffer, i * 3 * Float32Array.BYTES_PER_ELEMENT, 3);
            callback(v, i);
        }
    }

    rotateX(rotate_point = [0, 0, 2.7], theta = (1/50)*Math.PI){
        this.processVertices(function (v) {
            vec3.rotateX(v, v, rotate_point, theta);
        });
    }

    rotateY(rotate_point = [0, 0, 2.7], theta = (1/50)*Math.PI){
        this.processVertices(function (v) {
            vec3.rotateY(v, v, rotate_point, theta);
        });
    }

    rotateZ(rotate_point = [0, 0, 2.7], theta = (1/50)*Math.PI){
        this.processVertices(function (v) {
            vec3.rotateZ(v, v, rotate_point, theta);
        });
    }

}