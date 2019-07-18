#!/usr/bin/env python3
"""
Simple script to test the main Rust binary when it's in the browser add-on
mode. In that mode it will read in a URL and a screenshot. This script takes in
a URL as an argument and a PNG file and will then encode it such that the
output can be directly piped to the main binary.

Usage:

$ ./test.py https://example.com screenshot.png | ../target/release/siguranta
...
"""

import base64
import os
import struct
import sys

if __name__ != "__main__":
    sys.exit(1)

if len(sys.argv) != 3:
    print("needs two arguments: url + PNG!")
    print("example: %s https://example.com screenshot.png" % sys.argv[0])
    sys.exit(1)

url, png = sys.argv[1:3]

# open PNG, convert to base64 and add data-url preamble
with open(png, "rb") as fd:
    pngdata = b"data:image/png;base64," + base64.b64encode(fd.read())


# <url_len, url, png_len, png> with length values in native endian format
message = b"".join([struct.pack("@I", len(url)),
                    url.encode("utf-8"),
                    struct.pack("@I", len(pngdata)),
                    pngdata])

# write len message + message to stdout
fp = os.fdopen(sys.stdout.fileno(), "wb")
fp.write(struct.pack("@I", len(message)))
fp.write(message)
fp.flush()
sys.exit(0)
