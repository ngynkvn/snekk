#!/bin/bash
set -euxo pipefail

nohup redis-server --loadmodule /modules/rejson.so &
npm run dev