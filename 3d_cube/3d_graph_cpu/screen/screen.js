import { vec2, vec3, mat2 } from "../../lib/glMatrix/src/index.js";


export class Monitor {
    constructor(id, width, height, block_width, block_height, initial_color) {
        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");

        this.canvas.width = width;
        this.canvas.height = height;
        this.block_width = block_width;
        this.block_height = block_height;
        this.initial_color = initial_color;

        this.RowSize = Math.floor(width / block_width);
        this.ColSize = Math.floor(height / block_height);

        this.color_table = Array(this.ColSize).fill().map((value, index) => Array(this.screen_RowSize));
        for(let i = 0; i < this.ColSize; i++){
            for(let j = 0; j < this.RowSize; j++){
                this.color_table[i][j] = '#FFFFFF';
            }
        }

        this.color_table_buffer = Array(this.ColSize).fill().map((value, index) => Array(this.screen_RowSize));
        for(let i = 0; i < this.ColSize; i++){
            for(let j = 0; j < this.RowSize; j++){
                this.color_table_buffer[i][j] = initial_color;
            }
        }
    }
    
    draw_line = (p1, p2, color)=>{
        let v = vec3.create();
        vec3.subtract(v, p2, p1);
        let length_v = vec3.length(v);
        let norm_v = vec3.create();
        vec3.normalize(norm_v, v);
        
        for(let i = 0; i < Math.floor(length_v); i++){
            if(Math.floor(p1[1]+i*norm_v[1]) >= this.ColSize || Math.floor(p1[1]+i*norm_v[1]) < 0 || 
                          Math.floor(p1[0]+i*norm_v[0]) >= this.RowSize || Math.floor(p1[0]+i*norm_v[0]) < 0)
                continue;
            this.color_table_buffer[Math.floor(p1[1]+i*norm_v[1])][Math.floor(p1[0]+i*norm_v[0])] = color;
        }
    }

    draw_triangle = (p1, p2, p3, color)=>{
        this.draw_line(p1, p2, color);
        this.draw_line(p2, p3, color);
        this.draw_line(p3, p1, color);
    }

    fill_triangle = (p1, p2, p3, color)=>{
        let x_range = [this.RowSize, 0];
        let y_range = [this.ColSize, 0];

        const basis0_length = vec2.length(vec2.set(vec2.create(), p2[0]-p1[0], p2[1]-p1[1]));
        const basis1_length = vec2.length(vec2.set(vec2.create(), p3[0]-p1[0], p3[1]-p1[1]));
        const max_basis_length = (basis0_length > basis1_length)? basis0_length: basis1_length;
        
        const basis_transition_mtx = mat2.set(mat2.create(), p2[0]-p1[0], p2[1]-p1[1], p3[0]-p1[0], p3[1]-p1[1]);
        
        for(let i = 0; i <= 1; i += 1/max_basis_length){
            for(let j = 0; j <= 1; j += 1/max_basis_length){
                if(i + j <= 1){
                    const v = vec2.set(vec2.create(), i, j);
                    const mv = vec2.transformMat2(vec2.create(), v, basis_transition_mtx);
                    const x = Math.floor(mv[0] + p1[0]);
                    const y = Math.floor(mv[1] + p1[1]);
                    if(y >= this.ColSize || y < 0 || 
                       x >= this.RowSize || x < 0)
                        continue;
                    this.color_table_buffer[y][x] = color;
                }
            }
        }

    }

    set_colors = (colors)=>{
        for (let i = 0; i < this.ColSize; i++) {
            for (let j = 0; j < this.RowSize; j++) {
                this.color_table_buffer[i][j] = colors[i][j];
            }
        }
    }

    reset_colors = ()=>{
        for(let i = 0; i < this.ColSize; i++){
            for(let j = 0; j < this.RowSize; j++){
                this.color_table_buffer[i][j] = this.initial_color;
            }
        }
    }

    update = () => {
        for (let i = 0; i < this.ColSize; i++) {
            for (let j = 0; j < this.RowSize; j++) {
                if(this.color_table_buffer[i][j] == this.color_table[i][j])
                    continue;
                this.color_table[i][j] = this.color_table_buffer[i][j];
                this.ctx.fillStyle = this.color_table[i][j];
                this.ctx.fillRect(
                    this.block_width * j, this.block_height * i,
                    this.block_width, this.block_height);
            }
        }
    }
}
