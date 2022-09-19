import { GameState } from "../bs-types";

// Fetch wrappers
export const json = {
    get: async (url: string): Promise<any> => {
        const response = await fetch(url).then(b => b.json())
        return response;
    },
    post: async (url: string, body: any): Promise<any> => {
        const response = await window.fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        })
        return response;
    }
}
export const API = {
    get: {
        info: () => console.log(1),
    },
    post: {
        move: (gs: GameState) => json.post("/move", gs),
    }
}