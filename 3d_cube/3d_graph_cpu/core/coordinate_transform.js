
export class CoordinateTransform{
    constructor(h, w){
        this.origin = [w/2, h/2];
        this.w_unit_blocks = w/2;
        this.h_unit_blocks = h/2;
    }

    transform_vertice = (vertice)=>{
        //let vertice_out = vec3.create();
        vertice[0] = Math.floor(this.origin[0] + vertice[0]*this.w_unit_blocks);
        vertice[1] = Math.floor(this.origin[1] + vertice[1]*this.h_unit_blocks);
        //return vertice_out;
    }

}