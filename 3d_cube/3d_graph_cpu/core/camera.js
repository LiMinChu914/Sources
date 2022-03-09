import { mat4 } from "../../lib/glMatrix/src/index.js";



export class Camera{
    constructor(screen_height, screen_width, vcamera = [0,0,0], fFov = 90, fFar = 1000, fNear = 0.1){
        this.vcamera = vcamera;

        this.fAspectRatio = screen_height / screen_width;

        this.fFov = fFov;
        this.fFovRad = 1 / Math.tan((fFov / 2) / 180 * Math.PI);

        this.fFar = fFar;
        this.fNear = fNear;
    }

    set_vcamera(vcamera){
        this.vcamera = vcamera;
    }

    set_projMat = (fFov, fFar, fNear)=>{
        this.fFov = fFov;
        this.fFovRad = 1 / Math.tan((fFov / 2) / 180 * Math.PI);

        this.fFar = fFar;
        this.fNear = fNear;

        this.proj_Mat = mat4.set(
            mat4.create(),
            //row1
            this.fAspectRatio*this.fFovRad, 0           , 0                                           , 0,
            //row2
            0                             , this.fFovRad, 0                                           , 0,
            //row3
            0                             , 0           , this.fFar/(this.fFar-this.fNear)            , 1,
            //row4
            0                             , 0           , -this.fFar*this.fNear/(this.fFar-this.fNear), 0
        );
    }

    multiply_projMat = (vec)=>{
        let mat = this.proj_Mat;
        let x = vec[0]*mat[0] + vec[1]*mat[4] + vec[2]*mat[8] + mat[12];
        let y = vec[0]*mat[1] + vec[1]*mat[5] + vec[2]*mat[9] + mat[13];
        let z = vec[0]*mat[2] + vec[1]*mat[6] + vec[2]*mat[10] + mat[14];
        let w = vec[0]*mat[3] + vec[1]*mat[7] + vec[2]*mat[11] + mat[15];

        if(w != 0){
            vec[0] = x / w;
            vec[1] = y / w;
            vec[2] = z / w;
        }
        else{
            vec[0] = x;
            vec[1] = y;
            vec[2] = z;
        }
    }

    projection = (object)=>{
        this.set_projMat(this.fFov, this.fFar, this.fNear);
        
        let proj_vertices = new Float32Array(object.vertices.length);
        for(let i = 0; i < object.vertices.length; i++)
            proj_vertices[i] = object.vertices[i];

        for(let i = 0; i < object.vertice_num; i++){
            this.multiply_projMat(new Float32Array(proj_vertices.buffer, 3*i*Float32Array.BYTES_PER_ELEMENT, 3));
        }
        
        return proj_vertices;
    }

}

