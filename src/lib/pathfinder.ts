import { Tile } from "./tile";

export class PathFinder {
  pathFound: boolean;

  constructor() {
    this.pathFound = true;
  }

  findPath(start: Tile, end: Tile): Tile[] {
    // console.log(start, end);
    // const path: Tile[] = [];
    // const visited: Tile[] = [];
    // const queue: Tile[] = [];
    //
    // queue.push(start);
    //
    // while (queue.length > 0) {
    //   const current = queue.shift();
    //   if (!current) continue;
    //   if (current === end) break;
    //   if (visited.includes(current)) continue;
    //
    //   visited.push(current);
    //
    //   const neighbors = this.getNeighbors(current);
    //   neighbors.forEach((neighbor) => {
    //     if (!visited.includes(neighbor)) {
    //       queue.push(neighbor);
    //     }
    //   });
    // }
    //
    // let current = end;
    // while (current !== start) {
    //   path.unshift(current);
    //   current = current.parent;
    // }
    //
    // return path;
    //
    return [];
  }

  reset(): void {
    this.pathFound = true;
  }
}
