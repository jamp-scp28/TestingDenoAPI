// @deno-types="https://denopkg.com/soremwar/deno_types/react/v16.13.1/react.d.ts"
import React from "https://jspm.dev/react@17.0.2";
// @deno-types="https://denopkg.com/soremwar/deno_types/react-dom/v16.13.1/server.d.ts"
import ReactDOMServer from "https://jspm.dev/react-dom@17.0.2/server";
// @deno-types="https://denopkg.com/soremwar/deno_types/react-dom/v16.13.1/react-dom.d.ts"
import ReactDOM from "https://jspm.dev/react-dom@17.0.2";
export { React, ReactDOM, ReactDOMServer };
import { Application, Router } from "https://deno.land/x/oak@v6.0.1/mod.ts";
import { writeJson, writeJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';
import { readJson, readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

const dbFile = await Deno.readFile("./db/db.json");

interface Color{
  id: number, 
  color: string
}

class db {
  file: any;
  constructor(file: any) {
    this.file = file;  
  }
  public async saveColor(newColor: string){
    const colors: any = this.getColors();
    const color: Color = {id: colors.length + 1, color: newColor}
    colors.push(color)
    writeJson("./db/db.json", colors);
  }
  public getColors(): Array<Color>{
    const colors: any = readJsonSync("./db/db.json");
    return colors;
  }
}

const dbDao = new db(dbFile);
const app = new Application();
const router = new Router();

let colors: Array<Color> = []; 

router.get("/", handlePage);

router
.get("/colors", async (context) => {
  const colors = dbDao.getColors();
  context.response.body = colors;
})
.post("/colors", async (context) => {
  //Body should be: {name: "red"}
  const body = context.request.body();
  if (body.type === "json") {
    const color: any = await body.value;
    dbDao.saveColor(color.name);
  }
  context.response.body = { status: "OK" };
});

app.use(router.routes());
app.use(router.allowedMethods());

function App() {
  const handleSubmit = (event: any) => {
    event.preventDefault();
    const response = fetch("http://localhost:8000/colors", {
      method: "POST",
      body: event.data,
    })
  }
  return (
    <div>
      <div className="jumbotron jumbotron-fluid bg-info">
        <div className="container">
          <h1 className="display-4">Colors</h1>
          <p className="lead">Save your favorites colors here!</p>
          <ListColors items={dbDao.getColors()} />
        </div>
      </div>
      <div className="container">
          <form onSubmit={handleSubmit}> 
            <h3 className="display-8">Save a new color:</h3>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">Color name:</span>
              </div>
              <input className="form-control" type="text" aria-label="color name" />
            </div>
            <button type="submit" className="btn btn-success mt-3">Save</button>
          </form>
      </div>
    </div>
  );
}
interface ListColors{
  items: Color[]
}
function ListColors({ items = [] }: ListColors) {
  return (
    <div>
      <ul className="list-group">
        {items.map((item: any, index: number) => {
          return (
            <li key={index} className="list-group-item" style={{color:item.color}}>
              {item.color}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
function handlePage(ctx: any) {
  try {
    const body = ReactDOMServer.renderToString(<App />);
    ctx.response.body = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
    #root{background-color: grey; width: 100%; height: 100vh}
    </style>
    <title>Document</title>
  </head>
  <body >
    <div id="root">${body}</div>
  </body>
  </html>`;
  }catch(error){
    console.log(error);
  }
}

console.log("server is running on http://localhost:8000/");
await app.listen({ port: 8000 });
