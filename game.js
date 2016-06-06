
 var game = new Phaser.Game(960, 640, Phaser.AUTO, '', {preload: preload, create: create, pickItem: pickItem, placeItem: placeItem, clearSelection: clearSelection, refreshStats: refreshStats, reduceProperties, reduceProperties, update: update});


WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Fredericka the Great']
    }

};

var itemTimer;

var yawnTimer;

var loopPlaying;
var yawnTimerOn;

var divStep;
var compareStep = 0;
var addStep = false;


function preload() {
    //this.game.load.image('background', 'assets/images/background1.jpg');  

    this.game.load.image('background', 'assets/images/background.png');   
    this.game.load.image('hoop', 'assets/images/hoop.png');    
    this.game.load.image('hopper', 'assets/images/hopper.png');        
    this.game.load.image('rope', 'assets/images/rope.png');    
    this.game.load.image('lei', 'assets/images/lei.png');   
    //this.load.spritesheet('pet', 'assets/images/pet.png', 97, 83, 5, 1, 1); 

    this.game.load.atlas('mysprite', 'assets/images/spritesheet.png', 'assets/images/sprites.json');

     //  Load the Google WebFont Loader script
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

};


function create(){
  //socket = io.connect('http://localhost');
 //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //screen size will be set automatically
    this.scale.setScreenSize(true);
      
    this.background = this.game.add.sprite(0,0, 'background');
    this.background.inputEnabled = true;
    this.background.events.onInputDown.add(this.placeItem, this);

/*
    this.pet = this.game.add.sprite(100, 400, 'pet',0);
    this.pet.animations.add('funnyfaces', [0, 1, 2, 3, 2, 1, 0], 7, false);
    this.pet.anchor.setTo(0.5);
    */




  this.pet = this.game.add.sprite(450, 300, 'mysprite', 'disgruntled');
  //this.pet.animations.add('disgruntled', Phaser.Animation.generateFrameNames('disgruntled'), 5, true);
  //this.pet.animations.add('tired', Phaser.Animation.generateFrameNames('tired'), 5, true);
  //this.pet.animations.add('happy', Phaser.Animation.generateFrameNames('happy'), 5, true);
  this.pet.animations.add('hula', Phaser.Animation.generateFrameNames('hula', 1, 4), 5, true);
  this.pet.animations.add('hoop', Phaser.Animation.generateFrameNames('hoop', 1, 2), 5, true);
  this.pet.animations.add('skipping', Phaser.Animation.generateFrameNames('skipping', 1, 2), 5, true);
  this.pet.animations.add('hopper', Phaser.Animation.generateFrameNames('hopper', 1, 2), 5, true);
  this.pet.animations.add('sleeping', Phaser.Animation.generateFrameNames('sleeping', 1, 2), 2, true);
  this.pet.animations.add('running-left', Phaser.Animation.generateFrameNames('running-left', 1, 2), 4, true);
  this.pet.animations.add('running-right', Phaser.Animation.generateFrameNames('running-right', 1, 2), 4, true);
  this.pet.animations.add('yawn', Phaser.Animation.generateFrameNames('yawn', 1, 9), 4, false);
  this.pet.anchor.setTo(0.5);


    //custom properties of the pet
    this.pet.customParams = {health: 40, money: 100};

    //draggable pet
    this.pet.inputEnabled = true;
   // this.pet.input.enableDrag();


    itemTimer = game.time.create(false);
    itemTimer.loop(5000, stopAnimation, this);

    yawnTimer = game.time.create(true);
    yawnTimer.loop(10000, yawn, this);

    loopPlaying = false;
    yawnTimerOn = false;

    
    //buttons
    this.hoop = this.game.add.sprite(175, 560, 'hoop');
    this.hoop.anchor.setTo(0.5);
    this.hoop.customParams = {health: 20, money: -20};
    this.hoop.inputEnabled = true;
    this.hoop.events.onInputDown.add(this.pickItem, this);

    this.hopper = this.game.add.sprite(375, 560, 'hopper');
    this.hopper.anchor.setTo(0.5);
    this.hopper.customParams = {health: 10, money: -10};
    this.hopper.inputEnabled = true;
    this.hopper.events.onInputDown.add(this.pickItem, this);

    this.rope = this.game.add.sprite(575, 560, 'rope');
    this.rope.anchor.setTo(0.5);
    this.rope.customParams = {health: 30, money: -30};
    this.rope.inputEnabled = true;
    this.rope.events.onInputDown.add(this.pickItem, this);

    this.lei = this.game.add.sprite(775, 560, 'lei');
    this.lei.anchor.setTo(0.5);
    this.lei.customParams = {health: 30, money: -60};
    this.lei.inputEnabled = true;
    this.lei.events.onInputDown.add(this.pickItem, this);


    this.buttons = [this.hoop, this.hopper, this.rope, this.lei];

    //nothing selected
    this.selectedItem = null;

    //stats
    var numberStyle = { font: "50px Fredericka the Great", fill: "#fff"};
    var style = { font: "30px Fredericka the Great", fill: "#fff"};
  
   // this.game.add.text(140, 20, "Money:", style);

    this.healthText = this.game.add.text(80, 20, "", style);
    this.healthText.alpha = 0.0;
    this.moneyText = this.game.add.text(470, 40, "", numberStyle);
    this.refreshStats();

    //decrease health and fun every 10 seconds
    this.statsDecreaser = this.game.time.events.loop(Phaser.Timer.SECOND, this.reduceProperties, this);
    this.statsDecreaser.timer.start();

        if (this.pet.customParams.health >= 80) {
      this.pet.frameName = "happy";
       yawnTimer.stop();
      };


    if ((this.pet.customParams.health < 80) && (this.pet.customParams.health >=40)) {
      this.pet.frameName = "disgruntled";  
       yawnTimer.stop();  
    };

      if ((this.pet.customParams.health < 40) && (this.pet.customParams.health > 0)){
      this.pet.frameName = "tired";
    };

       if ((this.pet.customParams.health == 0)){
      this.pet.animations.play('sleeping');
    };
    
    this.uiBlocked = false;

      this.game.add.text(430, 10, "Moxy Points", style);



};

function pickItem(sprite, event){
  if(!this.uiBlocked && this.pet.customParams.money > 0) {
      //clear other buttons
      this.clearSelection();

      //alpha to indicate selection
      sprite.alpha = 0.4;

      //save selection so we can place an item
      this.selectedItem = sprite;
    };
};

function placeItem(sprite, event){
    if(this.selectedItem && !this.uiBlocked && this.pet.customParams.money > 0) {
      //position of the user input
      var x = event.position.x;
      var y = event.position.y;

      //create element in this place
      var newItem = this.game.add.sprite(x, y, this.selectedItem.key);
      newItem.anchor.setTo(0.5);
      newItem.customParams = this.selectedItem.customParams;


      //the pet will move to grab the item
      this.uiBlocked = true;
      var petMovement = game.add.tween(this.pet);
      petMovement.to({x: x, y: y}, 700);
      if (this.pet.x <= x){
        loopPlaying = true;
        this.pet.animations.play('running-right');
      } else {
        loopPlaying = true;
          this.pet.animations.play('running-left');
      };
      petMovement.onComplete.add(function(){
        this.uiBlocked = false;

        //destroy item
        newItem.destroy();

        //animate pet

        //create timer



        if (this.selectedItem.key == 'lei'){
          loopPlaying = true;
          this.pet.animations.play('hula');
          itemTimer.start();
        };

          if (this.selectedItem.key == 'hoop'){
          loopPlaying = true;
          this.pet.animations.play('hoop');
          itemTimer.start();
        };

          if (this.selectedItem.key == 'rope'){
          loopPlaying = true;
          this.pet.animations.play('skipping');
          itemTimer.start();
        };

          if (this.selectedItem.key == 'hopper'){
          loopPlaying = true;
          this.pet.animations.play('hopper');
          itemTimer.start();
        };
        

        //update pet stats
        var stat;
        for(stat in newItem.customParams) {
          //make sure the property belongs to the object and not the prototype
          if(newItem.customParams.hasOwnProperty(stat)) {
            this.pet.customParams[stat] += newItem.customParams[stat];
          }
        }
        
        //show updated stats
        this.refreshStats();

        //clear selection
        this.clearSelection();
      }, this);
      petMovement.start();      
    };

};

function clearSelection(){
   //set alpha to 1
    this.buttons.forEach(function(element){element.alpha = 1});

    //clear selection
    this.selectedItem = null;

};

function refreshStats(){
     if (this.pet.customParams.money < 0){
      this.pet.customParams.money = 0;
    }

     if (this.pet.customParams.health < 0){
      this.pet.customParams.health = 0;
    }
    this.healthText.text = this.pet.customParams.health;
    this.moneyText.text = this.pet.customParams.money;

};

function reduceProperties(){
  if(loopPlaying == false) {

      this.pet.customParams.health = Math.max(0, this.pet.customParams.health - 1);

       if ((this.pet.customParams.health < 80) && (this.pet.customParams.health >=40)) {
      this.pet.frameName = "disgruntled";  
       yawnTimer.stop();  

    };

    if ((this.pet.customParams.health < 40) && (this.pet.customParams.health > 0)){
      this.pet.frameName = "tired";
      
      if( yawnTimerOn == false){
        yawnTimer.start();
        yawnTimerOn = true;
      };
      
    };

       if (this.pet.customParams.health <= 0){
      this.pet.animations.play('sleeping');
       yawnTimer.stop();
    };
   // this.pet.customParams.money = Math.max(0, this.pet.customParams.money - 30);
    this.refreshStats();
  };

};

function stopAnimation(){
  this.pet.animations.stop(null, true);
  loopPlaying = false;

    if (this.pet.customParams.health >= 80) {
      this.pet.frameName = "happy";
      };

       if ((this.pet.customParams.health < 80) && (this.pet.customParams.health >=40)) {
      this.pet.frameName = "disgruntled";    
    };

      if ((this.pet.customParams.health < 40) && (this.pet.customParams.health > 0)){
      this.pet.frameName = "tired";
    };

       if (this.pet.customParams.health <= 0){
      this.pet.animations.play('sleeping');
    };
};

function yawn(){
  loopPlaying = true;
    this.pet.animations.play('yawn');
    yawnTimerOn = false;
    console.log("yawn fired");
    loopPlaying = false;
};


function update(){
  divStep = parseInt(document.getElementById('steps').innerHTML);

  if (divStep > compareStep){
    addStep = true;
   
    compareStep = divStep;
    console.log('step detected');
  };

  if(addStep == true){
    this.pet.customParams.money++;
    this.refreshStats();
    addStep = false;

  };
     // if(this.pet.customParams.health <= 0) {
     // this.pet.customParams.health = 0;
     // this.pet.animations.play('sleeping');
     // this.uiBlocked = true;

   // console.log(divStep);
   };
      //this.game.time.events.add(2000, this.gameOver, this);  


  



  // game.state.add('Boot', Pet.Boot);
  // game.state.add('Preloader', Pet.Preloader);
  // game.state.add('MainMenu', Pet.MainMenu);
   //game.state.add('Game', Pet.Game);
  // game.state.start('Boot');

   console.log("game started");
