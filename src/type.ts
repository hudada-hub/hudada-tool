export interface CommandOptions {
    search?: string;
}

export type optionsType = {
    search?: string;
    global?: boolean;
    dir?:string;
    list?:boolean;
    removeDir?: string;
    rm?: string;  // 添加 rm 选项
    append?: string;
}
