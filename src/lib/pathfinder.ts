import { Tile } from "./tile";

class Node {
  id: number;
  score: number;
  parent: Node | null;

  constructor(id: number) {
    this.id = id;
    this.score = 0;
    this.parent = null;
  }

  visited(): boolean {
    return this.parent !== null;
  }

  visit(parent: Node, score: number): void {
    this.parent = parent;
    this.score = score;
  }
}

// Min-heap, the lowest property value is at the root
class NodePriorityQueue {
  tree: Node[];

  constructor() {
    this.tree = [];
  }

  private bubbleUp(idx: number): void {
    const node: Node = this.tree[idx];

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.tree[parentIdx];

      // Swap elements if node property value is lower than parent
      if (node.score <= parent.score) {
        this.tree[parentIdx] = node;
        this.tree[idx] = parent;
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  private sinkDown(idx: number) {
    const node = this.tree[idx];

    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let leftChild;
      let rightChild;
      let swapIdx = null;

      if (leftChildIdx < this.tree.length) {
        leftChild = this.tree[leftChildIdx];
        if (node.score > leftChild.score) {
          swapIdx = leftChildIdx;
        }
      }

      if (rightChildIdx < this.tree.length) {
        rightChild = this.tree[rightChildIdx];
        if (
          (swapIdx === null && node.score > rightChild.score) ||
          (swapIdx !== null && leftChild.score > rightChild.score)
        ) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx !== null) {
        this.tree[idx] = this.tree[swapIdx];
        this.tree[swapIdx] = node;
        idx = swapIdx;
      } else {
        break;
      }
    }
  }

  extract() {
    const result = this.tree[0];
    const end = this.tree.pop();
    if (this.tree.length > 0) {
      this.tree[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  insert(node: Node) {
    this.tree.push(node);
    this.bubbleUp(this.tree.length - 1);
  }

  update(node: Node) {
    const idx = this.tree.indexOf(node);
    if (idx === 0) {
      return;
    }
    const parentIdx = Math.floor((idx - 1) / 2);
    if (node.score < this.tree[parentIdx].score) {
      this.bubbleUp(idx);
    } else {
      this.sinkDown(idx);
    }
  }

  size() {
    return this.tree.length;
  }
}

export class PathFinder {
  pathFound: boolean;
  nodes: Node[];
  path: Node[];

  constructor() {
    this.pathFound = true;
    this.nodes = [];
    this.path = [];
  }

  findPath(start: Tile, end: Tile): void {
    const startNode = new Node(start.id);
    const endNode = new Node(end.id);
    this.nodes.push(startNode);

    const openSet = new NodePriorityQueue();
    openSet.insert(startNode);

    const path: Node[] = [];

    while (openSet.size() > 0) {
      const current = openSet.extract();

      if (current.id === endNode.id) {
        for (let pathNode = current; pathNode; pathNode = pathNode.parent) {
          if (pathNode) {
            path.push(pathNode);
          }
        }
        path.reverse();
        break;
      }

      const neighbours = this.getNeighbors(current);

      neighbours.forEach((neighbor) => {
        const score = current.score + 1;
        const visited = neighbor.visited() || neighbor === startNode;

        if (!visited || score < neighbor.score) {
          neighbor.visit(current, score);
          if (!visited) {
            openSet.insert(neighbor);
          } else {
            openSet.update(neighbor);
          }
        }
      });
    }
    this.path = path;
    this.pathFound = path.length > 0;
    this.resetNodes();
  }

  getNeighbors(node: Node): Node[] {
    const neighbours = [];
    const x = Math.floor(node.id / 8) * 8;
    // FIXME: PLEASE FIX THIS
    if (node.id - 1 >= x) {
      neighbours.push(this.nodes.find((n) => n.id === node.id - 1));
    }
    if (node.id + 1 <= x + 8) {
      neighbours.push(this.nodes.find((n) => n.id === node.id + 1));
    }
    neighbours.push(this.nodes.find((n) => n.id === node.id - 8));
    neighbours.push(this.nodes.find((n) => n.id === node.id + 8));
    return neighbours.filter((n) => n !== undefined);
  }

  resetNodes(): void {
    this.nodes.forEach((node) => {
      node.parent = null;
      node.score = 0;
    });
  }

  reset(tiles: Tile[]): void {
    this.pathFound = true;
    this.nodes.length = 0;
    this.nodes = tiles.map((tile) => new Node(tile.id));
  }
}
