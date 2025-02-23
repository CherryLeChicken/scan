# sCAN

sCAN is a barcode scanning program designed to identify products through their barcodes using a live camera feed. When a barcode 
is detected, the program retrieves product information, checks if it's made in Canada, and suggests Canadian-made alternatives if 
needed. It combines real-time scanning with API calls to provide feedback on the product, creating an efficient and 
user-friendly experience for consumers.

sCAN leverages several APIs and databases to provide real-time product information:

Open Food Facts API: This API is used to fetch product details based on the scanned barcode. 

Node.js with Ollama: For generating Canadian-made alternatives, the program integrates with a custom backend running a model (via Ollama) that processes prompts and suggests alternatives based on the product name.

These APIs and databases work together to provide accurate, up-to-date, and relevant product data, enhancing the user experience by offering localized product suggestions and information based on barcode scans.

sCAN was created during Hack Canada 2025.

## Instructions
1. Clone the repository
```sh
git clone https://github.com/CherryLeChicken/scan
```
2. Install dependencies
```sh
npm install
```
3. Start the server
```sh 
npm start
```

## Made by


* Cherry Ke
* Emma Zhang
