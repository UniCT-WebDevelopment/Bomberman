# Marco Cavalli - X81000445
# Bomberman

<ol>
  <li><a href="#intro">Introduction</a></li>
  <li>
    <a href="#how-to-start">How to start it</a>
    <ul>
      <li><a href="#npm-start">Start the server with npm</a></li>
      <li><a href="#docker-start">Start the server with docker</a></li>
      <li><a href="#login-start">Login and start a game</a></li>
    </ul>
  </li>
  <li>
    <a href="#about">About this project</a>
    <ul>
      <li><a href="#folders">Folder structure</a></li>
      <li><a href="#modules">Node modules installed</a></li>
      <li><a href="#phaser">Phaser</a></li>
    </ul>
  </li>
  <li><a href="#ref">References</a></li>
</ol>

# <span name="intro">Introduction</span>
<lr>
<span>Assignment for the Web Programming course of the University of Catania. This is a repo about a Bomberman-like multiplayer videogame as a Node.js application. 

Do you believe that nowadays games are overrated? Do you still play with your Super Nintendo because PS5 is just for spoiled children? Then you will surely like this project! You probably should know about Bomberman (if not, shame on you, google it... now). The gameplay is pretty straight-forward: 2 to 4 players fighting each others using bombs. You can get power-ups to become stronger. The last man standing wins (doesn't it sounds so much like battle royales?).

This software allows you to start a web-server application. It will allow you to create private rooms to play with friends, you can even pick an avatar and chat through the main page of the game. The first who enters an empty room will be the host and can setup the game (choosing the number of bombs and such) and then start the game when all the players are ready.

That's awesome, right? But... how to use this?</span>

# <span name="how-to-start">How to start it</span>
<lr>
  
You can choose 2 ways to start/host the web-server:
- npm
- docker

<h3 name="npm-start">Start the server with npm</h3>
<lr>
  
<strong>Requires</strong> npm to be installed on your pc!

Clone this repo on your pc. Open a terminal and go to the root of the repo then type "npm install".

When all the modules are installed, just type "npm start". It will run a web-server in your localhost listening on the port <strong>8080</strong>. You can change this port if you want editing the file <strong>main.js</strong>.

Once you run the server you have 3 ways to connect:
- Open a web browser on the pc running the server and go to "localhost:8080" web-page
- Open a web browser on another pc/mobile and go to "<local-address-ip>:8080" web-page (you can get the local address ip by typing ip addr/ipconfig commands on your terminal)
- Set a port-forwarding rule on your router on the port 8080, and connect through internet at "<public-address-ip>:8080". This would be the solution you would need if you'd like to play with a friend. You can get your public address googling it
  
For the third solution: once you stop using this server i suggest you to destroy the rule.
  
That's all!


<h3 name="docker-start">Start the server with docker</h3>
<lr>
  
<strong>Requires</strong> docker to be installed on your pc! It is easier to get it on Linux/Mac OS, but you can get it on windows with WSL 2.

Open a terminal and type "docker pull mirkesx/bomberman". Then type "docker run -p 8080 mirkesx/bomberman". This will run the webserver.

Now open a new terminal and type "docker ps". This command will show you all the running containers on your system. Find the container running the image "mirkesx/bomberman" and check the port column. You will find something like <#port> -> 8080. The <#port> is the one you need to connect to the game. 

Once you get the port you have 3 ways to connect:
- Open a web browser on the pc running the server and go to "localhost:<#port>" web-page
- Open a web browser on another pc/mobile and go to "<local-address-ip>:<#port>" web-page (you can get the local address ip by typing ip addr/ipconfig commands on your terminal)
- Set a port-forwarding rule on your router on the port <#port>, and connect through internet at "<public-address-ip>:<#port>". This would be the solution you would need if you'd like to play with a friend. You can get your public address googling it

For the third solution: once you stop using this server i suggest you to destroy the rule, especially since docker changes the port every time (basically it will be probably useless once you run again the docker image).

That's all!

# <span name="login-start">Login and start a game</span>
<lr>
  
Once you connect to the index you will see the login prompt. Choose a nickname and the avatar. The avatar is up to you, since it doesn't affect your gameplay but just your appearance in the built-in chat. Once you choose a nickname you will see the prompt to enter a roomName you want to join/create and a list of available rooms you can join by clicking on the "ENTER" button aside them.

Each room can have only 4 players connected and it is not allowed to have 2 players with the same nickname. To play you need at least 2 players connected to the lobby.

The first player who joins a room is the host: this player can change the settings and the map level (TO DO). All players can decide to keep the color they received when they logged on, or to change it by pressing it and clicking on another available color. Once all the players are READY and there at least 2 players, the host can press "START" and it will start the game for every player connected to the lobby.

If the host logs-off, the second player in the list will become the host automatically.

Once in-game you can move your character with the arrow keys and place bombs with SPACE. You can adjust the audio if you want or exit the room. If the host exits the room it will close the game for all the players, but if a normal player quits, he will just log-off from the lobby.

Any player can log-off by pressing F5 or clicking on the exit-icon on the top-left corner.

# <span name="about">About this project</span>
<lr>

This section will be about technical stuff. Let's watch closer this code and see how it runs.

# <span name="folders">Folder structure</span>
<lr>
  
The project folders is divided into 3 parts:
<ul>
  <li>Backend files</li>
  <li>public files</li>
  <li>test files</li>
</ul>

I kept the test files, but they are basically useless since they are meant to be to test phaser and the gameplay outside the frontend web-page. So let's just forget about the test folder (it is basically a simpler version of the public folder).

The only file related to the backend is the <strong>main.js</strong> file.

The public folders contains all the frontend files. The structure is this one:
<ul>
  <li>
    assets
    <ul>
      <li>
        audio
        <ul>
          <li><i>Contains the background-music and the explosion sound</i></li>  
        </ul>
      </li>  
      <li>
        css
        <ul>
          <li><i>Contains the css files</i></li>  
        </ul>
      </li>
      <li>
        img
        <ul>
          <li><i>Contains the images used for the graphic of the website</i></li>  
        </ul>
      </li>
      <li>
        js
        <ul>
          <li><i>Contains all the js files</i></li>  
        </ul>
      </li>
      <li>
        sprites
        <ul>
          <li><i>Contains the sprites for Phaser (players/bombs/flames)</i></li>  
        </ul>
      </li>
      <li>
        tilemaps
        <ul>
          <li><i>Contains the tilemaps for Phaser (map-level as csv)</i></li>  
        </ul>
      </li>
      <li>
        tiles
        <ul>
          <li><i>Contains the tiles for Phaser (map-level as tile set)</i></li>  
        </ul>
      </li>
    </ul>
  </li>  
  <li>index.html</li>
</ul>

The only running file is index.html. When you open it (or connect to the server) you will face the login section. This section is all coded using bootstrap/jQuery. Once you join a room you will see the lobby which is too coded in bootstrap/jQuery. Once you Start the game from the lobby you will see the canvas and this is all coded using Phaser.

The js files inside assets/js are divided to manage each different section such as the login, the chat and the game itself.

I must tell that the code is gonna be refactored to be easier to read. Anyway the following list will explain what you can find in each file in js folder:
<ul>
  <li>index.js contains most of the client side logic (with the calls to socket methods) and most of the general methods (such as events handling and rendering of elements)</li>
  <li>chat.js contains all the methods for the chat (except some event handling, which can be found in index.js)</li>
  <li>game.js contains the phaser instantiation. All the game logic is in this file</li>
  <li>settings.js containts all the methods for the lobby/settings screen (except some event handling, which can be found in index.js)</li>
  <li>animations.js and sprites.js contain both elements for the Phaser instance. They exist only to keep game.js cleaner</li>
</ul>


# <span name="modules">Node Modules installed</span>
<lr>
  
As i said, this game runs on node.js. Why is this? It is obviously because it was needed to have a real-time experience. The game is fast-pacing and needs a backend which would keep all the clients always updated in time to allows players to play without harm.

The modules installed to run this code are the following:
<ul>
  <li>Express</li>
  <li>Socker.io</li>
  <li>jQuery</li>
  <li>Underscore</li>
  <li>Font-Awesome</li>
  <li>Bootstrap</li>
  <li>Phaser</li>
</ul>

# <span name="phaser">Phaser</span>
<lr>
This is the library i used to code the game. I picked Phaser 3.23.0 (the latest realease). I picked this library since is the most (i believe) complete js library to develop web-games. It makes easier to check collisions/overlaps and to run animations when elements are moving. You can use spritesheets for the animations. I personally used some sprites i got from Spiters Resource (link in the references), but you can use your own sprites, even gif files.
  
If yuo want to change some game-logic using phaser, just edit game.js (though keep in mind that some phaser code is too in index.js because they are bound to events emit by the server).

There are two main methods in game.js:
<ul>
  <li>setupGame</li>
  <li>startGame</li>
</ul>

The former is called by the host when he clicks on START. The latter is called whenever the server gets the request to start a game and notify all the players of the room (the host too) that they can start the game.

Phaser games have 3 main methods:
<ul>
  <li>preload, to load assets (images / musics / tilesets ...)</li>
  <li>create, to create the world map and the starting elements</li>
  <li>update, to move elements or do stuff while the game is running</li>
</ul>

I won't enlist all the custom methods i created, but basically the main logic behind them is: if the player who does something is you they are run in local and then your client will emit an event to the server which will notify all the other players, if the player who does something is not you, your client will receive updates listening to the events the server would emit to the clients.

So basically, if you want to change something you must keep in mind that (at least for now) when you do something you must emit an event to notify the other players and you must consider some methods to be called when the server notify other players' actions.

The movement is tile-based. I made it by using Tweens which are Phaser objects. They work a lot alike intervals, so they can create a timeline of events when you start them. There is a mobile-version for movement, but it is purely to let players play with their mobile devices, but it is still a TODO since it is a cheap workaround.

# <span name="ref">References</span>
<lr>
  <ul>
    <li>WSL 2 https://docs.microsoft.com/it-it/windows/wsl/wsl2-index</li>
    <li>Phaser https://phaser.io/</li>
    <li>Spriters Resource https://www.spriters-resource.com/</li>
  </ul>
