export default function indexHtml(mountpath: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <link rel="icon" type="image/png" href="${mountpath}/assets/static/favicon.png">
        <link rel="stylesheet" href="${mountpath}/assets/client.css">
      </head>
      <body>
        <div class="app">
          <div style="position: fixed; left: 0; top: 0; right: 0; height: 36px; background-color: #4a5568;"></div>
        </div>
        <script>
          window.mountpath = ${JSON.stringify(mountpath)};
        </script>
        <script src="${mountpath}/assets/client.js"></script>
      </body>
    </html>
  `;
}
