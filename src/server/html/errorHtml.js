export default function errorHtml(errorMessage) {
  return `
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
          #errorMessage {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <p id="title">Server Error</p>
        <p id="errorMessage"></p>
        <script>
          errorMessage.textContent = ${JSON.stringify(errorMessage)};
        </script>
      </body>
    </html>
  `;
}
