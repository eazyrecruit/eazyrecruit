#!/usr/bin/env python
"""

Contains all the constants and utility functions used through out the project

"""

import pickle

# Constants
LINES_FRONT = 3
LINES_BACK = 3

# Methods
def get_avoid_organizations():
  with open('data/organizations/avoid_organizations','rb') as fp:
    avoid_organizations = pickle.load(fp)
  return avoid_organizations

def get_organizations():
  with open('data/organizations/explicit_organizations','rb') as fp:
    organizations = pickle.load(fp)
  return organizations
