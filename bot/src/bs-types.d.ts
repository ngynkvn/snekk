// See https://docs.battlesnake.com/references/api for all details and examples.

export type InfoResponse = {
    apiversion: string;
    author?: string;
    color?: string;
    head?: string;
    tail?: string;
    version?: string;
}

export type MoveResponse = {
    move: string;
    shout?: string;
}

export type RoyaleSettings = {
    shrinkEveryNTurns: number;
}

export type SquadSettings = {
    allowBodyCollisions: boolean;
    sharedElimination: boolean;
    sharedHealth: boolean;
    sharedLength: boolean;
}

export type RulesetSettings = {
    foodSpawnChance: number;
    minimumFood: number;
    hazardDamagePerTurn: number;
    royale: RoyaleSettings;
    squad: SquadSettings;
}

export type Ruleset = {
    name: string;
    version: string;
    settings: RulesetSettings;
}

export type Game = {
    id: string;
    ruleset: Ruleset;
    timeout: number;
    source: string;
}

export type Coord = {
    x: number;
    y: number;
}

export type Battlesnake = {
    id: string;
    name: string;
    health: number;
    body: Coord[];
    latency: string;
    head: Coord;
    length: number;

    // Used in non-standard game modes
    shout: string;
    squad: string;
}

export type Board = {
    height: number;
    width: number;
    food: Coord[];
    snakes: Battlesnake[];

    // Used in non-standard game modes
    hazards: Coord[];
}

export type GameState = {
    game: Game;
    turn: number;
    board: Board;
    you: Battlesnake;
}
