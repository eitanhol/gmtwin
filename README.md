# Chess Style Analyzer

A web application that analyzes your chess games and tells you which famous grandmaster your playing style resembles.

## Features

- Upload PGN files or paste PGN text
- Analyze games with Stockfish chess engine
- View detailed playstyle metrics
- Match your style with famous grandmasters
- Review your game with computer analysis

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. **Important**: Download both Stockfish.js and Stockfish.wasm files and place them in the `public` directory
4. Run the development server with `npm run dev`

## Stockfish Setup

The application requires both `stockfish.js` and `stockfish.wasm` files to be present in the `public` directory. You can obtain these files by:

### Option 1: Download pre-built files

1. Visit the [Stockfish.js releases page](https://github.com/nmrugg/stockfish.js/releases)
2. Download the latest release
3. Extract the files and copy `stockfish.js` and `stockfish.wasm` to your project's `public` directory

### Option 2: Build from source

1. Clone the Stockfish.js repository: `git clone https://github.com/nmrugg/stockfish.js.git`
2. Follow the build instructions in the repository
3. Copy the resulting `stockfish.js` and `stockfish.wasm` files to your project's `public` directory

### Verifying the setup

After placing the files in the `public` directory, you should be able to access them at:
- `http://localhost:3000/stockfish.js`
- `http://localhost:3000/stockfish.wasm`

If these URLs return the files correctly, the chess engine should work properly.

## Using the Application

1. Upload a PGN file or paste PGN text
2. Select which player to analyze (White or Black)
3. Choose between standard or deep analysis
4. Click "Analyze Game"
5. View the results in the tabs below

## License

MIT
