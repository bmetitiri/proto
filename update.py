#!/usr/bin/env python
# vim:fileencoding=utf-8
import httplib
import json
import os
import re
import sys
import subprocess
import webbrowser

def github(method, resource):
  """Call a GitHub API method."""
  con = httplib.HTTPSConnection("api.github.com")
  con.request(method, resource, headers={
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "update.py from arkie/proto",
  })
  return json.load(con.getresponse())

def archive(repo, user, this):
  """Archive the specified repo into this one."""
  subprocess.call(["git", "fetch", repo["ssh_url"],
    "%s:%s" % (repo["default_branch"], repo["name"])])
  subprocess.call(["git", "push", "origin", repo["name"]])
  link = "https://github.com/%s/%s/tree/%s" % (user, this, repo["name"])
  try:
    lines = open("README.md").readlines()
  except:
    lines = []
  pre = []
  repos = {}
  post = []
  key = None
  for l in lines:
    if l[:3] == " - ":
      key = l
      repos[key] = []
    elif key and l.strip() != "":
      repos[key].append(l)
    elif len(repos):
      key = None
      post.append(l)
    else:
      pre.append(l)
  mid = []
  for r in sorted(repos):
    mid.append(r)
    mid.extend(repos[r])
  open("README.md", "w").writelines(pre + mid + post)
  webbrowser.open(link, new=2)
  webbrowser.open("%s/settings" % repo["html_url"], new=2)
  return "Archived %s" % repo["name"]

def identify():
  """Get the containing repo."""
  os.chdir(os.path.realpath(os.path.dirname(__file__)))
  try:
    out = subprocess.check_output("git remote -v".split(" "))
  except:
    return None, None
  remote = re.search("github.com:(.*)/(.*).git \(fetch\)", out)
  user = remote.group(1)
  repo = remote.group(2)
  return user, repo

def menu(repos, this):
  """Select a repo to archive."""
  print("Archive which repo?")
  repos_dict = dict((r["name"], r) for r in repos if r["name"] != this)
  choices = sorted(repos_dict.keys())
  length = len(max(choices, key=lambda r: len(r)))
  for i, r in enumerate(choices):
    repo = repos_dict[r]
    print((" %s) %" + str(-length) + u"s ★%s ⑂%s  %s") %
        (i, r, repo["stargazers_count"], repo["forks"], repo["description"]))
  try:
    num = raw_input("? ")
    if num in choices:
      choice = num
    else:
      choice = choices[int(num)]
    return repos_dict[choice]
  except:
    return None

def main():
  """Archive a GitHub repo."""
  user, repo = identify()
  if not user:
    print("%s couldn't determine GitHub based repo." % __file__)
    sys.exit(1)
  repos = github("GET", "/users/%s/repos" % user)
  if len(repos) == 0:
    return "No GitHub repos to archive."
  arc = menu(repos, repo)
  if arc is None:
    return "No repo selected."
  return archive(arc, user, repo)

if __name__ == "__main__":
  print(main())
