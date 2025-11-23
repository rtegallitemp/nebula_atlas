
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const NebulaAtlasABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "emblemId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "EmblemRedeemed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "resultHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "resultCID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "scorePublic",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "OutcomeLogged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "poolCID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "QuestionPoolSet",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "emblemClaimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "scoreExt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes32",
          "name": "resultHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "resultCID",
          "type": "string"
        },
        {
          "internalType": "uint32",
          "name": "scorePublic",
          "type": "uint32"
        }
      ],
      "name": "logGameOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "outcomeId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextOutcomeId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playerStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "numGames",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPublicScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxSinglePublicScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastPlayedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "readEncryptedOutcome",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "readEncryptedTotal",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "readMyEncryptedTotal",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "readPlayerMilestones",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "numGames",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPublicScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxSinglePublicScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastPlayedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "emblemId",
          "type": "uint256"
        }
      ],
      "name": "redeemEmblem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "poolCID",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "setQuestionPoolMeta",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;
