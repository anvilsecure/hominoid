#!/usr/bin/env python3
"""
Simple installation script that tries to automate installing the definitions in
the appropriate Firefox directory.
"""

import os.path
import sys

if __name__ != "__main__":
    sys.exit(1)

NAME = "siguranta"


curdir = os.path.dirname(__file__)

target_bin = os.path.join(curdir, "target/release/%s" % NAME)

if not os.path.exists(target_bin):
    sys.stderr.write("binary %s does not exist\n" % target_bin)
    sys.stderr.write("run the following to build the binary:\n\n")
    sys.stderr.write("cargo build --release\n")
    sys.exit(1)
