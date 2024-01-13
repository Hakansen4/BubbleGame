import gsap, { Power0 } from "gsap";
import { Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import Matter, { Bodies, Composite, Engine, Render, Runner, Vector } from "matter-js";
import * as PIXI from 'pixi.js';



class Circle
{
  constructor(id,scale,letter){
    this.id = id;
    this.isChoosed = false;
    this.orangeColor = "#e79250";
    this.whiteColor = "#ffffff";
    this.trashPosition = 1000;

    //letter works
    this.letter = letter;
    this.myText = new PIXI.Text(this.letter,{
      fill: [
        this.orangeColor,
    ],
      fontWeight: 900,
      fontSize: 35,
      fontFamily: "Sniglet Regular"
    });
    this.myText.anchor.set(0.5,0.5);
    
    //sprite works
    this.sprite = new Sprite();
    this.sprite.width = scale;
    this.sprite.height = scale;
    this.sprite.anchor.set(0.5,0.5);
    this.sprite.x = GAME_WIDTH/2;
    this.sprite.y = 100;
    
    //body works
    this.body = Bodies.circle(this.sprite.x,this.sprite.y,scale/2+1);
    
    //animation works
    this.animationSprite = new Sprite();
    this.animationSprite.anchor.set(0.5,0.5);
    this.animationSprite.width = 0;
    this.animationSprite.height = 0;
    this.pickAnimationSpeed = 20;
    this.destroyAnimationSpeed = 2;
    this.destroyAnimScale = scale + 30;
    this.animationScale = scale + 10;
    this.starterAnimationScale = scale;

    this.animatePick = false;
    this.destroyAnimation = false;
    this.destroyAnimEnded = false;
    this.animateBigger = false;
    this.animateLower = false;
    
    //sprite load
    this.spriteDefault = Sprite.from("circle_0");
    this.spriteChooosed = Sprite.from("circle_1");
  }
  draw(e) {
    this.sprite.texture = this.spriteDefault.texture;
    e.addChild(this.sprite,this.myText,this.animationSprite);
    e.composite.add(e.engine.world,this.body);
  }
  update(){
    //movement
    if(!this.destroyAnimation){
      this.sprite.position = this.body.position;
      this.myText.position = this.body.position;
      this.animationSprite.position = this.body.position;
    }
    //destroy animation
    if(this.destroyAnimation){
      if(this.animationSprite.width < this.destroyAnimScale){
        this.animationSprite.width += this.destroyAnimationSpeed;
        this.animationSprite.height += this.destroyAnimationSpeed;
        this.animationSprite.alpha -= 0.1;
      }else{
        this.destroyAnimEnded = true;
        this.animationSprite.position.x = this.trashPosition;
      }
    }
    //pick animation
    else if(this.animatePick){
      if(this.animationSprite.width < this.animationScale  &&  this.animateBigger){
        this.animationSprite.width += this.pickAnimationSpeed;
        this.animationSprite.height += this.pickAnimationSpeed;
      }else{
        this.animateBigger = false;
        if(this.animationSprite.width > this.starterAnimationScale - 10 && this.animateLower){
          this.animationSprite.width -= this.pickAnimationSpeed / 2;
          this.animationSprite.height -= this.pickAnimationSpeed / 2;
        }else{
          this.animateLower = false;
          if(this.animationSprite.width < this.starterAnimationScale){
            this.animationSprite.width += this.pickAnimationSpeed / 2;
            this.animationSprite.height += this.pickAnimationSpeed / 2;
          }else{
            this.animatePick = false;
            this.animationSprite.width = 0;
            this.animationSprite.height = 0;
            if(this.isChoosed){
              this.sprite.texture = this.spriteChooosed.texture;
              this.myText.style.fill = this.whiteColor;
            }
            else{
              this.sprite.texture = this.spriteDefault.texture;
              this.myText.style.fill = this.orangeColor;
          }
          }
        }
      }
    }
  }
  animatePickAnimation(){
    this.animatePick = true;
    this.animateBigger = true;
    this.animateLower = true;
    if(this.isChoosed)
      this.animationSprite.texture = this.spriteChooosed.texture;
    else
      this.animationSprite.texture = this.spriteDefault.texture;
  }
  relase(){
    this.isChoosed = false;
    this.animatePickAnimation();
    
  }
  pick(){
    this.isChoosed = true;
    this.animatePickAnimation();
  }
  checkDestroy(){
    if(!this.isChoosed)
      return false;
    this.hardDestroy();
    return true;
  }
  hardDestroy(){
    this.destroyAnimation = true;
    this.animationSprite.texture = this.spriteChooosed.texture;
    this.animationSprite.width = this.sprite.width;
    this.animationSprite.height = this.sprite.height;
    this.body.position.x = this.trashPosition;
    this.myText.position.x = this.trashPosition;
    this.sprite.position.x = this.trashPosition;
  }
}
class Pane
{
  constructor(){
    this.words = ["WORD","SON","EAT","TEA","GO","LAW"]
    this.trashPosition = 1000;

    //letter works
    this.letters = [];
    this.letterId = [];
    this.letterCount = 0;
    this.letterWidth = 40;
    
    //button works
    this.button = new Sprite();
    this.button.width = 40;
    this.button.height = 40;
    this.button.anchor.set(0,0);
    this.button.y = 570;
    this.isTick = false;
    
    //sprite works
    this.sprite = new Sprite();
    this.sprite.anchor.set(0,0);
    this.sprite.width = 400;
    this.sprite.height = 80;
    this.sprite.x = 40;
    this.sprite.y = 550;
    
    //sprite load
    this.tick = Sprite.from("tick");
    this.cross = Sprite.from("cross");
    this.orangeSprite = Sprite.from("orangePane");
    this.greyPane = Sprite.from("greyPane");
    this.greenPane = Sprite.from("greenPane");
  }
  draw(e)
  {
    this.sprite.texture = this.orangeSprite.texture;
    this.button.position.x = this.trashPosition;
    e.addChild(this.sprite,this.button);
  }
  pickLetter(id,letter,e){
    this.letterId[this.letterCount] = id;
    this.letters[this.letterCount] = new PIXI.Text(letter,{
      fill: 0xffffff,
      fontWeight: 900,
      fontSize: 50,
      fontFamily: "Sniglet Regular"
    });
    this.letters[this.letterCount].anchor.set(0.5,0.5);
    this.letters[this.letterCount].position.x = this.sprite.position.x + (this.letterCount+1) * this.letterWidth;
    this.letters[this.letterCount].position.y = this.sprite.position.y + this.sprite.height/2;
    e.addChild(this.letters[this.letterCount]);
    this.letterCount++;
  }
  relaseLetter(id){
    let founded = false;
    for(let index = 0;index < this.letterCount;index++){
      if(!founded){
        if(this.letterId[index] === id){
          founded = true;
          this.letterId.splice(index,1);
        }
      }
      else{
        this.letters[index - 1].text = this.letters[index].text;
      }
    }
    this.letters[this.letterCount - 1].position.x = this.trashPosition;
    this.letters.splice(this.letterCount-1,1);
    this.letterCount--;
  }
  update(game){
    if(this.letterCount != 0){
      let word = "";
      this.button.position.x = 380;
      for(let index = 0;index < this.letterCount;index++){
        word += this.letters[index].text;
      }
      if(this.words.includes(word)){
        this.sprite.texture = this.greenPane.texture;
        this.button.texture = this.tick.texture;
        this.isTick = true;
      }else{
        this.sprite.texture = this.greyPane.texture;
        this.button.texture = this.cross.texture;
        this.isTick = false;
      }


    }else{
      this.sprite.texture = this.orangeSprite.texture;
      this.button.position.x = this.trashPosition;
    }
  }
  clear(){
    this.letters.forEach(element => {
      element.position.x = this.trashPosition;
    });
    this.letters = [];
    this.letterId = [];
    this.letterCount = 0;
  }
  
}
class Tutorial{
  constructor(){
    this.isTutorialStarted = false;
    this.isTutorialFinished = false;
    this.trashPosition = 1000;

    //pane works
    this.pane = Sprite.from("greyPane");
    this.pane.anchor.set(0.5,0.5);
    this.pane.alpha = 0.7;
    this.pane.width = 400;
    this.pane.height = 60;
    this.paneStartX = 40 + this.pane.width/2;
    this.paneStartY = 100 + this.pane.height/2;
    this.pane.position.x = this.paneStartX;
    this.pane.position.y = this.paneStartY;
    
    this.paneAnimChanger = false;
    this.isSecondAnimCome = false;
    this.paneComeAnim = false;
    this.paneGoAnim = false;
    this.paneAnimSpeed = 30;
    
    //text works
    this.sentence_1 = "TAP LETTERS TO MAKE WORDS";
    this.sentence_2 = "LETTERS DON'T HAVE TO BE TOUCHING";
    this.sentence_3 = "TAP THE GREEN BOX TO CONFIRM";
    
    this.infoText = new PIXI.Text(this.sentence_1,{
      fill:[0xFFFFFF],
      fontWeight: 900,
      fontFamily: "Sniglet Regular",
      fontSize: 23
    });
    this.infoText.anchor.set(0.5,0.5);
    this.infoText.position = this.pane.position;

    this.tapText = new PIXI.Text("TAP",{
      fill: 0xa1a1a1,
      fontWeight: 900,
      fontSize: 35,
      fontFamily: "Sniglet Regular"
    })
    this.tapTextAnimSpeed = 0.1;
    this.tapTextPosition;
    this.tapText.anchor.set(0.5,0.5);
    //hand works
    this.hand = Sprite.from("hand");
    this.handAnimSpeed = 0.01;
    this.handStarterScale = 0.5;
    this.handLowered = false;
    this.hand.scale.x = this.handStarterScale;
    this.hand.scale.y = this.handStarterScale;
  }
  update(){
    if(!this.isTutorialStarted  ||  this.isTutorialFinished)
      return;
    //tap animation
    if(this.tapText.alpha > 0.2){
      this.tapText.position.y -= this.tapTextAnimSpeed * 40;
      this.tapText.alpha -= this.tapTextAnimSpeed / 5;
    }else{
      this.tapText.position = this.tapTextPosition;
      this.tapText.alpha = 1;
    }
    //hand animation
    if(this.hand.scale.x > this.handStarterScale * 0.8  &&  !this.handLowered){
      this.hand.scale.x -= this.handAnimSpeed;
      this.hand.scale.y -= this.handAnimSpeed;
    }else if(this.hand.scale.x < this.handStarterScale){
      this.handLowered = true;
      this.hand.scale.x += this.handAnimSpeed;
      this.hand.scale.y += this.handAnimSpeed;
    }else{
      this.handLowered = false;
    }
    //pane animation
    if(this.paneComeAnim){
      if(this.pane.position.x >= this.paneStartX){
        this.pane.position.x -= this.paneAnimSpeed;
        this.infoText.position.x = this.pane.position.x;
      }else{
        this.paneComeAnim = false;
        this.pane.position.x = this.paneStartX;
        this.infoText.position.x = this.pane.position.x;
      }
    }else if(this.paneGoAnim){
      if(this.pane.position.x >= -this.pane.width - 10){
        this.pane.position.x -= this.paneAnimSpeed;
        this.infoText.position.x = this.pane.position.x;
      }else{
        this.paneGoAnim = false;
        this.pane.position.x = GAME_WIDTH + this.pane.width + 10;
        this.infoText.position.x = this.pane.position.x;
      }
    }
  }
  firstStage(firstWordPosition,game){
    this.isTutorialStarted = true;
    this.hand.position = firstWordPosition;
    this.tapTextPosition = firstWordPosition;
    this.tapText.position = this.tapTextPosition;
    game.addChild(this.pane,this.infoText,this.hand,this.tapText);
  }
  changeTutorialStage(newWordPosition){ 
    this.hand.position = newWordPosition;
    this.tapTextPosition = newWordPosition;
    this.tapText.position = this.tapTextPosition;
    if(!this.paneAnimChanger){
      this.paneGoAnim = true;
      this.paneComeAnim = false;
      this.paneAnimChanger = !this.paneAnimChanger;
    }
    else{
      this.paneGoAnim = false;
      this.paneComeAnim = true;
      this.paneAnimChanger = !this.paneAnimChanger;
      if(!this.isSecondAnimCome){
        this.isSecondAnimCome = true;
        this.infoText.text = this.sentence_2;
      }else{
        this.infoText.text = this.sentence_3;
      }
    }
  }
  finishTutorial(){
    this.hand.position.x = this.trashPosition;
    this.tapText.position.x = this.trashPosition;
    this.infoText.position.x = this.trashPosition;
    this.pane.position.x = this.trashPosition;
    this.isTutorialFinished = true;
  }
}


export default class Game extends Container {
  constructor(starterLetters,starterSizes,starterCircleAmount) {
    super();
    this.allScales = [80,90,100,110];
    this.allLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

    this.isGameFinished = false;
    this.score = 0;
    
    this.Pane = new Pane();
    this.tutorial = new Tutorial();
    this.mousePos;
    
    //circle works
    this.Circles = [];
    this.destroyedCircles = [];
    this.destroyedCircleCount = 0;
    this.isStarterCirclesCreated = false;
    this.circleGonnaCreate = starterCircleAmount;
    this.circleCount = 0;
    this.createDelay = 200;
    this.circleCreateTime;

    //starter cirlces
    this.starterSizes = starterSizes;
    this.starterLetters = starterLetters;
    this.starterCircleAmount = starterCircleAmount;
    
    //borders
    this.lowerBorder = Bodies.rectangle(GAME_WIDTH / 2, 575,GAME_WIDTH,50,{isStatic: true});
    this.leftBorder = Bodies.rectangle(-25,GAME_WIDTH/2,50,GAME_HEIGHT,{isStatic: true});
    this.rightBorder = Bodies.rectangle(GAME_WIDTH + 25,GAME_WIDTH/2,50,GAME_HEIGHT,{isStatic: true});
    
    //physic works
    this.runner = Runner.create();
    this.composite = Composite;
    this.engine = Engine.create();
    this.engine.gravity.y = 1;
    
    //function works
    this.init();
    this.update = this.update.bind(this);
    this.clickControl = this.clickControl.bind(this);
  }
  init() {
    this.drawBackground();
    this.Pane.draw(this);
    this.composite.add(this.engine.world,[this.lowerBorder,this.leftBorder,this.rightBorder]);
    Runner.run(this.runner,this.engine);
  }
  update() {
    this.checkGameFinihed();
    this.createStarterCircles(this.starterLetters,this.starterSizes,this.starterCircleAmount);
    this.tutorial.update();
    this.Pane.update(this);
    this.Circles.forEach(element => {
      element.update();
    });
    for(let index = 0;index < this.destroyedCircleCount;index++){
      this.destroyedCircles[index].update();
      if(this.destroyedCircles[index].destroyAnimEnded){
        this.destroyedCircles.splice(index,1);
        this.destroyedCircleCount--;
        index--;
      }
    }
    this.createCircle();
  }
  createStarterCircles(starterLetters,starterSizes,starterCircleAmount)
  {
    if(this.isStarterCirclesCreated || this.circleCreateTime >= (Date.now() - this.createDelay))
      return;
      
      this.circleCreateTime = Date.now();
      let circle = new Circle(this.circleCount,starterSizes[this.circleCount],starterLetters[this.circleCount]);
      circle.draw(this);
      circle.body.force.y = 0.2;
      this.Circles[this.circleCount] = circle;
      this.circleCount++;
    
    if(starterCircleAmount == this.circleCount){
      this.isStarterCirclesCreated = true;
      setTimeout(this.tutorial.firstStage.bind(this.tutorial), 3000, this.Circles[0].sprite.position, this);
    }
  }
  createCircle()
  {
    if(this.circleCreateTime >= (Date.now() - this.createDelay) || this.isGameFinished ||  
    this.circleCount >= this.circleGonnaCreate || !this.isStarterCirclesCreated)
      return;

    this.circleCreateTime = Date.now();
    let randomScale = Math.floor(Math.random() * this.allScales.length);
    let randomLetter = Math.floor(Math.random() * this.allLetters.length);
    let circle = new Circle(this.circleCount,this.allScales[randomScale],this.allLetters[randomLetter]);
    circle.draw(this);
    circle.body.force.y = 0.1;
    this.Circles[this.circleCount] = circle;
    this.circleCount++;
  }
  drawBackground()
  {
    let backgroundImage = Sprite.from("background");
    backgroundImage.scale.set(2);
    this.addChild(backgroundImage);
  }
  clickControl(e)
  {
    this.mousePos = e.data.global;
    //Check Circle Pick
    for(let index = 0; index < this.circleCount; index++)
    {
      if(this.circlePointCollision(this.mousePos,
        this.Circles[index].sprite.position,
        this.Circles[index].sprite.width/2)){
          if(this.Circles[index].isChoosed){
            this.Circles[index].relase();
            this.Pane.relaseLetter(this.Circles[index].id);
          }else{
            if(this.Circles[index].id == 0){
              this.tutorial.changeTutorialStage(this.Circles[1].sprite.position);
              this.Circles[index].pick();
              this.Pane.pickLetter(this.Circles[index].id,this.Circles[index].letter,this);
            }
            else if(this.Circles[index].id == 1 &&  this.Circles[index-1].isChoosed){
              this.tutorial.changeTutorialStage(this.Circles[2].sprite.position);
              this.Circles[index].pick();
              this.Pane.pickLetter(this.Circles[index].id,this.Circles[index].letter,this);
            }else if(this.Circles[index].id == 2  &&  this.Circles[index-1].isChoosed){
              this.tutorial.changeTutorialStage(this.Circles[3].sprite.position);
              this.Circles[index].pick();
              this.Pane.pickLetter(this.Circles[index].id,this.Circles[index].letter,this);
            }else if(this.Circles[index].id == 3 &&  this.Circles[index-1].isChoosed){
              let btnPosition = this.Pane.button.position;
              btnPosition.x += this.Pane.button.width/2;
              btnPosition.y += this.Pane.button.height/2;
              this.tutorial.changeTutorialStage(btnPosition);
              btnPosition.x -= this.Pane.button.width/2;
              btnPosition.y -= this.Pane.button.height/2;
              this.Circles[index].pick();
              this.Pane.pickLetter(this.Circles[index].id,this.Circles[index].letter,this);
            }
            if(this.tutorial.isTutorialFinished){
              this.Circles[index].pick();
              this.Pane.pickLetter(this.Circles[index].id,this.Circles[index].letter,this);
            }
          }
        }
    }
    //Check Button Click
    if(this.rectangelePointCollision(this.mousePos,this.Pane.button)){
      if(!this.Pane.isTick){
        this.Pane.clear();
        this.Circles.forEach(element => {
          if(element.isChoosed)
            element.relase();
        });
      }else{
        this.Pane.clear();
        this.score++;
        for(let index = 0; index < this.circleCount;index++){
            if(this.Circles[index].checkDestroy()){
              this.destroyedCircles[this.destroyedCircleCount] = this.Circles[index];
              this.Circles.splice(index,1);
              this.circleCount--;
              index--;
              this.destroyedCircleCount++;
              if(!this.tutorial.isTutorialFinished){
                this.tutorial.finishTutorial();
              }
            }
        }
      }
    }
  }
  circlePointCollision(point,circle,radius)
  {
    let distX = point.x - circle.x;
    let distY = point.y - circle.y;
    let distance = Math.sqrt((distX*distX) + (distY*distY));
    if(distance <= radius){
      return true;
    }
    return false;
  }
  rectangelePointCollision(point,rectangle){
    if(point.x >= rectangle.position.x  &&  point.x <= rectangle.position.x + rectangle.width &&
       point.y >= rectangle.position.y  &&  point.y <= rectangle.position.y + rectangle.height){
        return true;
       }
       return false;
  }
  async checkGameFinihed(){
    if(this.score >= 4){
      this.isGameFinished = true;
      for(let index = 0;index < this.circleCount;index++){
        this.Circles[index].hardDestroy();
        this.destroyedCircles[this.destroyedCircleCount] = this.Circles[index];
        this.Circles.splice(index,1);
        this.circleCount--;
        index--;
        this.destroyedCircleCount++;
        await this.sleep(200);
      }
    }
  }
  sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
  }
}
