import typescript from "@rollup/plugin-typescript"

export default[
    {
        input:"src/ts/app.ts",
        output:{
            dir:"public/js",
            format:"esm",
            sourcemap:true
        },
        plugins:[
            typescript ({
                tsconfig:"./tsconfig.json"
            })
        ]
    }
    
]