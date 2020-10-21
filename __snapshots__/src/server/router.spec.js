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
Error: please mount helppo to an existing express router first
`
