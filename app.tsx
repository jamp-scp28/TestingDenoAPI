import { Application, Router } from "https://deno.land/x/oak/mod.ts";
// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"
import React from "https://dev.jspm.io/react@16.13.1";
import ReactDOMServer from "https://dev.jspm.io/react-dom@16.13.1/server";
import { createApp } from "https://deno.land/x/servest/mod.ts";

const dbFile = await Deno.readFile("./db/db.json");

class db {
  constructor(file) {
    this.file = file;  
  }

  public saveColor(color: string){
    await Deno.writeTextFile("./db/db.json", {color});
  }

}

const dbDao = new db(dbFile);

const app = createApp();
app.handle("/", async (req) => {
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/html; charset=UTF-8",
    }),
    body: ReactDOMServer.renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Deno API Testing</title>
        </head>
        <body>
          <form>
            <div class="form-group">
              <label>Please Enter a Color:</label>
              <input type="text" required="true" />
            </div>
            <button type="submit">Save Color</button>
          </form>
        </body>
      </html>,
    ),
  });
});

app.listen({ port: 8888 });