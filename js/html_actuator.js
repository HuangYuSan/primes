function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

function tau(n) {
	var anzahl = 1;
	var zahl = n;
	for(var i = 1; i < zahl; i++) {
		if(zahl%i == 0) {
			anzahl++;
		}
	}
	return anzahl;
}

function isPrime(n) {
 if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
 var m=Math.sqrt(n);
 for (var i=2;i<=m;i++) if (n%i==0) return false;
 return true;
}

function textColor(value) {
	if (value == 1) {
		return "white";
	}
	return "white";
}

function glow(value) {
	var transparency1 = 0.4 * (1-1/value);
	var transparency2 = 0.23 * (1-1/value);
	return "0 0 30px 10px rgba(243, 215, 116, " + transparency1 + "), inset 0 0 0 1px rgba(255, 255, 255, " + transparency2 + ")";
}

function niceRGB(value) {
	if(isPrime(value)) {
		return ("#f65e3b");
	}
	if (value === 1) {
		return ("#BA3D3D");
	}
	/*
    var r = value ;//+ 0.2*value*value*value;
	var g = 150-value;
	var b = 150+ 0.1*(((value*value*value)%256)-150);
	*/
	var tauValue = tau(value);
	var r = (1-5*1/tauValue)*231 + 5*1/tauValue*242;
	var g = (1-5*1/tauValue)*242 + 5*1/tauValue*173;
	var b = (1-5*1/tauValue)*12 + 5*1/tauValue*12;
    return (
        "rgb(" + Math.floor(r)%256 + ", "
        + Math.floor(g)%256 + ", "
        + Math.floor(b)%256 + ")"
    );
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-"+tile.value, positionClass];

  if (tile.value >= 1000) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }
  
  var offset = Math.random();


  this.setColor(inner, niceRGB(tile.value));
  this.setTextColor(inner, textColor(tile.value));
  this.setGlow(inner, glow(tile.value));
	
  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.setColor = function (element, color) {
  element.style.background = color;
};

HTMLActuator.prototype.setTextColor = function (element, color) {
  element.style.color = color;
};

HTMLActuator.prototype.setGlow = function (element, glow) {
	element.style.boxShadow = glow;
}

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
