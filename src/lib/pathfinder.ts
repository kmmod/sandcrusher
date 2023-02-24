import { Tile } from "./tile";

export class Node {
  id: number;
  score: number;
  parent: Node | null;
  obstacle: boolean;

  constructor(id: number, obstacle: boolean) {
    this.id = id;
    this.score = 0;
    this.parent = null;
    this.obstacle = obstacle;
  }

  isOpen(): boolean {
    return !this.obstacle;
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
  columns: number;
  pathFound: boolean;
  nodes: Node[];
  path: Node[];
  onPathFoundListeners: any[];

  constructor(columns: number) {
    this.columns = columns;
    this.pathFound = true;
    this.nodes = [];
    this.path = [];
    this.onPathFoundListeners = [];
  }

  findPath(start: Tile, end: Tile): void {
    const startNode = new Node(start.id, start.isTaken());
    const endNode = new Node(end.id, end.isTaken());

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

    this.pathFound = path.length > 0;
    // const returnPath = path.length > 0 ? path : [startNode, endNode];

    this.onPathFound(path);
    this.resetNodes();
  }

  getNeighbors(node: Node): Node[] {
    const neighbours: Node[] = [];

    if (this.horizontalNode(node, -1)) {
      neighbours.push(this.nodes[node.id - 1]);
    }
    if (this.horizontalNode(node, 1)) {
      neighbours.push(this.nodes[node.id + 1]);
    }
    if (this.verticalNode(node, -8)) {
      neighbours.push(this.nodes[node.id - this.columns]);
    }
    if (this.verticalNode(node, 8)) {
      neighbours.push(this.nodes[node.id + this.columns]);
    }

    return neighbours;
  }

  horizontalNode(node: Node, direction: number): boolean {
    return (
      this.nodes[node.id + direction] &&
      this.nodes[node.id + direction].isOpen() &&
      this.isOnSameRow(node, this.nodes[node.id + direction])
    );
  }

  verticalNode(node: Node, direction: number): boolean {
    return (
      this.nodes[node.id + direction] &&
      this.nodes[node.id + direction].isOpen()
    );
  }

  isOnSameRow(node: Node, next: Node): boolean {
    return Math.floor(node.id / 8) === Math.floor(next.id / 8);
  }

  simplifyPath(path: Node[]): Node[] {
    const simplifiedPath = [];
    let lastDirection = "none";

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      const direction = this.getDirection(current, next);

      if (direction !== lastDirection) {
        simplifiedPath.push(current);
        lastDirection = direction;
      }
    }

    simplifiedPath.push(path[path.length - 1]);
    return simplifiedPath;
  }

  getDirection(current: Node, next: Node): string {
    if (next.id === current.id - 1) {
      return "left";
    } else if (next.id === current.id + 1) {
      return "right";
    } else if (next.id === current.id - this.columns) {
      return "up";
    } else if (next.id === current.id + this.columns) {
      return "down";
    }
    return "none";
  }

  addPathFoundListener(observer: any) {
    this.onPathFoundListeners.push(observer);
  }

  onPathFound(path: Node[]) {
    this.onPathFoundListeners.forEach((listener) => {
      listener(path);
    });
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
    this.nodes = tiles.map((tile) => new Node(tile.id, tile.isTaken()));
  }
}
