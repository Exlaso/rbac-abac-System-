import {Controller, Get} from "@nestjs/common";

@Controller('/')
export class AppController {

    @Get()
    index(){
        return `
        <html >
        <head>
        <title>RBAC + ABAC SYSTEM BY EXLASO</title>
</head>
        
        <body style="display: flex; justify-content: center; align-items: center; flex-direction: column">
        <h1>
        NestJS is running!
</h1>
<p >
<span style="color: red">NOTE* </span> Swagger GUI may not be working on production 
</p>
<br/>
<br/>
<br/>
<div><a href="./swagger" style="background: rgb(0,0,0 ); margin: 2px; border-radius: 2rem; margin-top: 20rem; padding: 1rem; text-decoration: none; color: white">
Swagger GUI
</a>

<a href="./swagger-json" style="background: rgb(0,0,0 );  margin: 2px; border-radius: 2rem; margin-top: 20rem; padding: 1rem; text-decoration: none; color: white">
Swagger JSON
</a></div>
</body>
        </html>
        `;
    }

}