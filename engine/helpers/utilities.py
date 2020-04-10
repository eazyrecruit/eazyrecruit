#!/usr/bin/env python
"""

Contains all the constants and utility functions used through out the project

"""

import pickle
import config
from base64 import b64decode
from Crypto.Cipher import AES
config = config.get_config()
import sys

# Constants
LINES_FRONT = 3
LINES_BACK = 3

# Methods


def get_avoid_organizations():
  with open('data/organizations/avoid_organizations', 'rb') as fp:
    avoid_organizations = pickle.load(fp)
  return avoid_organizations


def get_organizations():
  with open('data/organizations/explicit_organizations', 'rb') as fp:
    organizations = pickle.load(fp)
  return organizations


def make_printable(s):
    """Replace non-printable characters in a string."""

    # the translate method on str removes characters
    # that map to None from the string
    # build a table mapping all non-printable characters to None
    NOPRINT_TRANS_TABLE = {
        i: None for i in range(0, sys.maxunicode + 1) if not chr(i).isprintable()
    }

    return s.translate(NOPRINT_TRANS_TABLE)

def decrypt_node_encoded_data(encrypted_string):
  iv = config['node_decryption_iv']
  key = config['node_decryption_key']
  encoded = b64decode(encrypted_string)
  dec = AES.new(key=key.encode("utf8"), mode=AES.MODE_CBC, IV=iv.encode("utf8"))
  value = dec.decrypt(encoded)
  value=value.decode("utf-8")
  return make_printable(value)
