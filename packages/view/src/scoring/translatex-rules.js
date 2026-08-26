// SPDX-License-Identifier: MIT
export const evalRules = {
  "words": {
    "average": "average",
    "if": "if",
    "mul": "mul",
    "round": "round",
    "sum": "sum",
  },
  "types": {
    "args": [
      "\\type{cellName}:\\type{cellName}",
      "?,?"
    ],
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "round",
      "sum",
    ]
  },
  "rules": {
    "=\\type{cellName}": [
      "$cell"
    ],
    "=?": [
      {
        "%2": {
          "\\type{fn}(\\type{args})": "$fn",
          "\\type{fn}(?,?)": "$fn",
          "\\type{fn}(?)": "$fn",
          "?+?": "$add",
          "?-?": "$minus",
          "?*?": "$multiply",
          "?/?": "$divide",
          "?%": "$percent",
          "-?": "$minus"
        }
      }
    ],
    "-?": [
      "-%1"
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "\\type{args}": [
      "%1,%2"
    ],
    "\\type{cellName}": [
      "%1%2"
    ],
    "\\type{fn}(\\type{cellRange})": [
      "%1(%2)"
    ],
    "??": [
      "%1%2"
    ],
    "{{var:\\type{cellName}}}": [
      "{{var:%2}}"
    ],
    "?": [
      "%1"
    ]
  }
};

export const cellNameRules = {
  "types": {
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "round",
      "sum",
    ]
  },
  "rules": {
    "\\type{cellName}": [
      "%1%2"
    ],
    "=?": [
      {
        "%2": {
          "\\type{fn}(\\type{cellRange})": "%2",
          "?+?": "%1,%2",
          "?-?": "%1,%2",
          "?*?": "%1,%2",
          "?/?": "%1,%2",
          "\\type{cellName}": "%1%2"
        }
      }
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "??": [
      "%1%2"
    ],
    "?": [
      "%1"
    ]
  },
}

export const formatRules = {
  "rules": {
    "??": [
      "%1%2"
    ],
    "-\\type{number}": [
      {
        "%1": {
          "\\type{number}": "$fmt{isNegative:true}",
        },
      },
    ],
    "\\type{number}": [
      "$fmt{isNegative:false}"
    ],
    "?": [
      "%1"
    ]
  },
}

export const normalizeRules = {
  "types": {
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "round",
      "sum",
    ]
  },
  "rules": {
    "=\\type{cellName}": [
      "$cell"
    ],
    "=?": [
      {
        "%2": {
          "\\type{cellRange}": "%1:%2",
          "\\type{fn}(\\type{cellRange})": "$normalize",
          "?+?": "$normalize {\"acc\": [\"SUM\"]}",
          "?-?": "$normalize {\"acc\": [\"SUB\"]}",
          "?*?": "$normalize {\"acc\": [\"MUL\"]}",
          "?/?": "$normalize {\"acc\": [\"DIV\"]}",
          "?%": "$percent",
          "-?": "$minus"
        }
      }
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "\\type{cellName}": [
      "%1%2"
    ],
    "\\type{fn}(\\type{cellRange})": [
      "%1(%2)"
    ],
    "??": [
      "%1%2"
    ],
    "?": [
      "%1"
    ]
  },
}
