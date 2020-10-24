exports['router renders index.html with undefined mountpath 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <link rel="icon" type="image/png" href="/assets/static/favicon.png">
        <link rel="stylesheet" href="/assets/client.css">
      </head>
      <body>
        <div class="app">
          <div style="position: fixed; left: 0; top: 0; right: 0; height: 36px; background-color: #4a5568;"></div>
        </div>
        <script>
          window.mountpath = "";
        </script>
        <script src="/assets/client.js"></script>
      </body>
    </html>
  
`

exports['router renders index.html with correct mountpath 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <link rel="icon" type="image/png" href="/admin/assets/static/favicon.png">
        <link rel="stylesheet" href="/admin/assets/client.css">
      </head>
      <body>
        <div class="app">
          <div style="position: fixed; left: 0; top: 0; right: 0; height: 36px; background-color: #4a5568;"></div>
        </div>
        <script>
          window.mountpath = "/admin";
        </script>
        <script src="/admin/assets/client.js"></script>
      </body>
    </html>
  
`

exports['router renders index.html for any path 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <link rel="icon" type="image/png" href="/assets/static/favicon.png">
        <link rel="stylesheet" href="/assets/client.css">
      </head>
      <body>
        <div class="app">
          <div style="position: fixed; left: 0; top: 0; right: 0; height: 36px; background-color: #4a5568;"></div>
        </div>
        <script>
          window.mountpath = "";
        </script>
        <script src="/assets/client.js"></script>
      </body>
    </html>
  
`

exports['router renders error message if helppo was not mounted 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <style>
          * {
            margin: 0;
            padding: 0;
            font-style: inherit;
          }
          body {
            font-family: -apple-system, blinkmacsystemfont, "Segoe UI",
              "Roboto", "Helvetica Neue", arial, sans-serif, "Apple Color Emoji",
              "Segoe UI Emoji", "Segoe UI Symbol";
            padding: 20px;
          }
          #title {
            font-size: 24px;
            margin-bottom: 10px;
          }
          #message {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <p id="title">Server Error</p>
        <p id="message"></p>
        <script>
          message.textContent = "Please mount helppo to an existing express router first";
        </script>
      </body>
    </html>
  
`

exports['router renders error message if driver reports connection closed 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <style>
          * {
            margin: 0;
            padding: 0;
            font-style: inherit;
          }
          body {
            font-family: -apple-system, blinkmacsystemfont, "Segoe UI",
              "Roboto", "Helvetica Neue", arial, sans-serif, "Apple Color Emoji",
              "Segoe UI Emoji", "Segoe UI Symbol";
            padding: 20px;
          }
          #title {
            font-size: 24px;
            margin-bottom: 10px;
          }
          #message {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <p id="title">Server Error</p>
        <p id="message"></p>
        <script>
          message.textContent = "Database connection has been interrupted";
        </script>
      </body>
    </html>
  
`

exports['router renders error message if driver reports connection closed with message 1'] = `

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
        <style>
          * {
            margin: 0;
            padding: 0;
            font-style: inherit;
          }
          body {
            font-family: -apple-system, blinkmacsystemfont, "Segoe UI",
              "Roboto", "Helvetica Neue", arial, sans-serif, "Apple Color Emoji",
              "Segoe UI Emoji", "Segoe UI Symbol";
            padding: 20px;
          }
          #title {
            font-size: 24px;
            margin-bottom: 10px;
          }
          #message {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <p id="title">Server Error</p>
        <p id="message"></p>
        <script>
          message.textContent = "Database connection has been interrupted (error: foobar message)";
        </script>
      </body>
    </html>
  
`
