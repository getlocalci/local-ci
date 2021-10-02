const fs = require('fs');

fs.rmSync('/tmp/local-ci', { recursive: true, force: true });
