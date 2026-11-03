import type { Level } from '../domain/model.ts';

export const firstLevel: Level = {
  "schemaVersion": 1,
  "contentVersion": "prototype-1",
  "id": "a-moment-longer",
  "title": "A moment longer",
  "cycleBeats": 8,
  "bpm": 120,
  "nodes": [
    {
      "id": "spark",
      "kind": "source",
      "outputs": [
        "out"
      ]
    },
    {
      "id": "fork",
      "kind": "socket",
      "ports": [
        "in",
        "a",
        "b"
      ],
      "orientations": {
        "splitter": [
          {
            "id": "forward",
            "input": "in",
            "outputs": [
              "a",
              "b"
            ]
          }
        ]
      }
    },
    {
      "id": "hold",
      "kind": "socket",
      "ports": [
        "in",
        "out"
      ],
      "orientations": {
        "delay": [
          {
            "id": "forward",
            "input": "in",
            "outputs": [
              "out"
            ]
          },
          {
            "id": "reverse",
            "input": "out",
            "outputs": [
              "in"
            ]
          }
        ],
        "bend": [
          {
            "id": "forward",
            "input": "in",
            "outputs": [
              "out"
            ]
          },
          {
            "id": "reverse",
            "input": "out",
            "outputs": [
              "in"
            ]
          }
        ]
      }
    },
    {
      "id": "flower-a",
      "kind": "flower",
      "inputs": [
        "in"
      ]
    },
    {
      "id": "flower-b",
      "kind": "flower",
      "inputs": [
        "in"
      ]
    }
  ],
  "links": [
    {
      "id": "source-fork",
      "from": {
        "nodeId": "spark",
        "portId": "out"
      },
      "to": {
        "nodeId": "fork",
        "portId": "in"
      },
      "travelBeats": 1
    },
    {
      "id": "fork-hold",
      "from": {
        "nodeId": "fork",
        "portId": "a"
      },
      "to": {
        "nodeId": "hold",
        "portId": "in"
      },
      "travelBeats": 1
    },
    {
      "id": "hold-a",
      "from": {
        "nodeId": "hold",
        "portId": "out"
      },
      "to": {
        "nodeId": "flower-a",
        "portId": "in"
      },
      "travelBeats": 1
    },
    {
      "id": "fork-b",
      "from": {
        "nodeId": "fork",
        "portId": "b"
      },
      "to": {
        "nodeId": "flower-b",
        "portId": "in"
      },
      "travelBeats": 3
    }
  ],
  "pieces": [
    {
      "id": "fork-1",
      "kind": "splitter"
    },
    {
      "id": "delay-1",
      "kind": "delay"
    },
    {
      "id": "bend-1",
      "kind": "bend"
    }
  ],
  "initialPlacements": {
    "fork": {
      "pieceId": "fork-1",
      "orientationId": "forward"
    },
    "hold": {
      "pieceId": "bend-1",
      "orientationId": "forward"
    }
  },
  "solutionPlacements": {
    "fork": {
      "pieceId": "fork-1",
      "orientationId": "forward"
    },
    "hold": {
      "pieceId": "delay-1",
      "orientationId": "forward"
    }
  }
};
