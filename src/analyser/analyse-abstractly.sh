#!/bin/sh


function analyse() {
  echo "Running analysis for dn/sd=$1/$2..."
  node dist/analyser/analyse-rules.js $1 $2 > "analysis/analysis-$1_$2.log"
  echo "...done"
  echo ""
}

analyse 1 1
analyse 2 2
analyse 2 1
analyse 3 3
analyse 3 2
analyse 3 1
analyse 4 4

echo "[all done]"

