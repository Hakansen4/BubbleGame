import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { initAssets } from "./assets";
import { gsap } from "gsap";
import { CustomEase, PixiPlugin } from "gsap/all";
import Game from "./game";
import Matter from "matter-js";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const app = new Application({
  backgroundColor: 0x000000,
  antialias: true,
  hello: true,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
});

app.ticker.stop();
gsap.ticker.add(() => {
  app.ticker.update();
});

async function init() {

  document.body.appendChild(app.view);

  let assets = await initAssets();
  console.log("assets", assets);

  gsap.registerPlugin(PixiPlugin, CustomEase);
  PixiPlugin.registerPIXI(PIXI);

  let starterLetters = ["W","O","R","D","S","O","A","N","L","W","G","E","A","T","O"];
  let starterSizes = [100,90,80,100,100,100,90,90,100,110,80,80,80,80,80];
  let starterCircleAmount = 15;

  const game = new Game(starterLetters,starterSizes,starterCircleAmount);

  app.stage.interactive = true;
  app.stage.on("click",game.clickControl);
  app.stage.addChild(game);
  app.ticker.add(game.update);
  app.ticker.start();
}

init();
