import { InfoResponse, GameState, MoveResponse, Game, Coord } from "./types";

export function info(): InfoResponse {
  console.log("INFO");
  const response: InfoResponse = {
    apiversion: "1",
    author: "Kevin Nguyen",
    color: "#2a3b57",
    head: "all-seeing",
    tail: "default",
  };
  return response;
}

export function start(gameState: GameState): void {
  console.log(`${gameState.game.id} START`);
}

export function end(gameState: GameState): void {
  console.log(`${gameState.game.id} END\n`);
}

type Direction = "up" | "down" | "left" | "right";
type PossibleMoves = {
  [key in Direction]: boolean;
};
const DIRECTIONS = ["up", "down", "left", "right"];
function allMoves(): PossibleMoves {
  return {
    up: true,
    down: true,
    left: true,
    right: true,
  };
}

/**
 * Checks where `a` will hit `b` for all cardinals.
 */
function preventHit(a: Coord, b: Coord): PossibleMoves {
  const preventHit: PossibleMoves = allMoves();
  if (a.x == b.x) {
    if (a.y + 1 == b.y) {
      preventHit.up = false;
    } else if (a.y - 1 == b.y) {
      preventHit.down = false;
    }
  } else if (a.y == b.y) {
    if (a.x + 1 == b.x) {
      preventHit.right = false;
    } else if (a.x - 1 == b.x) {
      preventHit.left = false;
    }
  }
  return preventHit;
}

// Copy moves from b to a
function squishMoves(a: PossibleMoves, b: PossibleMoves): PossibleMoves {
  a.up = a.up && b.up;
  a.down = a.down && b.down;
  a.left = a.left && b.left;
  a.right = a.right && b.right;
  return a;
}

function preventNeckSnap(
  gameState: GameState,
  possibleMoves: PossibleMoves
): PossibleMoves {
  const [myHead, myNeck] = gameState.you.body;
  return squishMoves(possibleMoves, preventHit(myHead, myNeck));
}
// Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
function preventHitWalls(
  gameState: GameState,
  possibleMoves: PossibleMoves
): PossibleMoves {
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  const head = gameState.you.head;
  if (head.x + 1 >= boardWidth) {
    possibleMoves.right = false;
  }
  if (head.x - 1 < 0) {
    possibleMoves.left = false;
  }
  if (head.y + 1 >= boardHeight) {
    possibleMoves.up = false;
  }
  if (head.y - 1 < 0) {
    possibleMoves.down = false;
  }
  return possibleMoves;
}

// Use information in gameState to prevent your Battlesnake from colliding with itself.
function preventHitBody(
  gameState: GameState,
  possibleMoves: PossibleMoves
): PossibleMoves {
  const [head, ...body] = gameState.you.body;
  body // Ignore parts that are >2 blocks away (Manhattan distance)
    .filter((b) => Math.abs(b.x - head.x) + Math.abs(b.y - head.y) < 2)
    // Map the parts close by to a possible moves object
    .map((part) => preventHit(head, part))
    // Squish the possible moves together.
    .reduce(squishMoves, possibleMoves);
  return possibleMoves;
}
// Use information in gameState to prevent your Battlesnake from colliding with others.
function preventHitEnemy(
  gameState: GameState,
  possibleMoves: PossibleMoves
): PossibleMoves {
  const [head] = gameState.you.body;
  const snakes = gameState.board.snakes;
  snakes.forEach((s) => {
    s.body
      .filter((b) => Math.abs(b.x - head.x) + Math.abs(b.y - head.y) < 2)
      // Map the parts close by to a possible moves object
      .map((part) => preventHit(head, part))
      // Squish the possible moves together.
      .reduce(squishMoves, possibleMoves);
  });
  return possibleMoves;
}

export function move(gameState: GameState): MoveResponse {
  const possibleMoves = allMoves();

  // Step 0: Don't let your Battlesnake move back on it's own neck
  // Step 1 - Don't hit walls.
  // Step 2 - Don't hit yourself.
  // Step 3 - Don't collide with others.
  preventNeckSnap(gameState, possibleMoves);
  preventHitWalls(gameState, possibleMoves);
  preventHitBody(gameState, possibleMoves);
  preventHitEnemy(gameState, possibleMoves);

  // Step 4 - Find food.
  // Use information in gameState to seek out and find food.
  const head = gameState.you.head;
  const dist = (c: Coord) => Math.abs(head.x - c.x) + Math.abs(head.y - c.y);
  const foods = gameState.board.food.sort((a, b) => dist(a) - dist(b));
  const preference: Direction[] = [];
  if (foods.length > 0) {
    const [nearestFood] = foods;
    const offsetX = head.x - nearestFood.x;
    const offsetY = head.y - nearestFood.y;
    if (offsetX < 0) {
      // Head is left of food
      preference.push("right");
    } else if (offsetX > 0) {
      preference.push("left");
    }
    if (offsetY < 0) {
      // Head is below food
      preference.push("up");
    } else if (offsetY > 0) {
      preference.push("down");
    }
  }

  // Finally, choose a move from the available safe moves.
  // Step 5 - Select a move to make based on strategy, rather than random.
  const safeMoves = DIRECTIONS.filter((key) => possibleMoves[key as Direction]);

  let move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
  for (const p of preference) {
    if (possibleMoves[p]) {
      move = p;
      break;
    }
  }
  const response: MoveResponse = {
    move,
  };

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
  return response;
}
