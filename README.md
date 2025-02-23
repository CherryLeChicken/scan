# sCAN

sCAN is a barcode scanning program designed to identify products through their barcodes using the camera. When a barcode 
is detected, the program retrieves product information, checks if it's made in Canada, and if not, suggests Canadian-made alternatives. 

sCAN leverages several APIs and databases to provide real-time product information:

Open Food Facts API: This API is used to fetch product details based on the scanned barcode. 

Node.js with Ollama: For generating Canadian-made alternatives, the program integrates with a backend running a model (via Ollama) that processes products and suggests alternatives based on the product name.

sCAN was created during Hack Canada 2025.

## Instructions
Please make sure to have [node.js](https://nodejs.org/en) and [git](https://git-scm.com/) installed.

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
