#!/usr/bin/python
# coding=utf-8
import csv
import os.path
import json
import string

PATH = 'pokedex/pokedex/data/csv'
# 9 English
LOCALE = '9'
# 23 X
# 24 Y
# 25 Omega Ruby
# 26 Alpha Sapphire
GAMES = ['23', '24', '25', '26']

def read(filename):
  f = os.path.join(PATH, filename)
  with open(f, 'r') as pokefile:
    return list(csv.DictReader(pokefile))

def values(filename, key='id', value='name'):
  return dict((r[key], r[value])
      for r in read(filename)
      if 'local_language_id' not in r or r['local_language_id'] == LOCALE)

pokemon_names = values('pokemon_species_names.csv', 'pokemon_species_id')
pokemon_egg_names = values('egg_group_prose.csv', 'egg_group_id')
pokemon_item_names = values('item_names.csv', 'item_id')
pokemon_evolution_names = values('evolution_trigger_prose.csv', 'evolution_trigger_id')
pokemon_location_names = values('location_names.csv', 'location_id')
pokemon_method_prose = values('encounter_method_prose.csv', 'encounter_method_id')
pokemon_versions = values('version_names.csv', 'version_id')
pokemon_order = values('pokemon_species.csv', value='order')
pokemon_evolution = values('evolution_chains.csv', value='baby_trigger_item_id')

pokemon_data = read('pokemon_species.csv')
pokemon_eggs = read('pokemon_egg_groups.csv')
pokemon_trigger = read('pokemon_evolution.csv')
pokemon_encounters = read('encounters.csv')
pokemon_encounter_slots = dict((es['id'], es) for es in read('encounter_slots.csv'))
pokemon_species = dict((p['id'], p['species_id']) for p in read('pokemon.csv'))
pokemon_areas = dict((l['id'], l['location_id']) for l in read('location_areas.csv'))

pokemon_dict = {}
pokemon_chains = {}

for p in pokemon_data:
  i = p['id']
  pokemon_dict[p['id']] = {
    'id': i,
    'name': pokemon_names[i],
    'identifier': p['identifier'],
    'precursor': p['evolves_from_species_id'],
  }
  if not p['evolution_chain_id'] in pokemon_chains:
    pokemon_chains[p['evolution_chain_id']] = []
  l = pokemon_chains[p['evolution_chain_id']]
  l.append(i)
  l.sort(key=lambda x:int(pokemon_order[x]))
  pokemon_dict[i]['chain'] = l
  baby = pokemon_evolution[p['evolution_chain_id']]
  if baby:
    pokemon_dict[i]['baby_item'] = pokemon_item_names[baby]

for e in pokemon_eggs:
  p = pokemon_dict[e['species_id']]
  if 'egg' not in p:
    p['egg'] = []
  p['egg'].append(pokemon_egg_names[e['egg_group_id']])

for l in pokemon_trigger:
  p = pokemon_dict[l['evolved_species_id']]
  if l['trigger_item_id']:
    p['item'] = pokemon_item_names[l['trigger_item_id']]
  if l['minimum_level']:
    p['level'] = int(l['minimum_level'])
  if l['held_item_id']:
    p['held'] = pokemon_item_names[l['held_item_id']]
  if l['minimum_happiness']:
    p['happy'] = l['minimum_happiness']
  p['trade'] = l['evolution_trigger_id'] == '2'
  p['check'] = any(l[f] for f in ['gender_id', 'location_id',
    'time_of_day', 'known_move_id', 'known_move_type_id', 'minimum_beauty',
    'minimum_affection', 'relative_physical_stats', 'party_species_id',
    'party_type_id', 'trade_species_id'])
  if l['needs_overworld_rain'] != '0' or l['turn_upside_down'] != '0':
    p['check'] = True

for e in pokemon_encounters:
  if e['version_id'] in GAMES:
    p = pokemon_dict[pokemon_species[e['pokemon_id']]]
    if not 'catch' in p:
      p['catch'] = []
    p['catch'].append({
      'game': pokemon_versions[e['version_id']],
      'method': pokemon_method_prose[pokemon_encounter_slots[
          e['encounter_slot_id']]['encounter_method_id']],
      'location': pokemon_location_names[pokemon_areas[
          e['location_area_id']]],
    })

with open('pages/pokedex.js', 'w') as out:
  out.write('POKEDEX = ' + json.dumps(pokemon_dict))

try:
  from PIL import Image
  import glob
  import math

  PATH = 'pokedex-media/pokemon/icons/'
  w = 40
  h = 30
  l = glob.glob(PATH + '*[0-9].png')
  l.sort(key=lambda x:int(x[len(PATH):x.index('.')]))
  i = 0
  row = 24
  out = Image.new('RGBA', (w * row, h * (len(pokemon_dict) + row - 1) / row))
  style = []
  for f in l:
    im = Image.open(f)
    x = i % row * w
    y = i / row * h
    out.paste(im, (x, y))
    i += 1
    style.append('.' + pokemon_dict[str(i)]['identifier'] +
        '{background-position:' + str(-x) + 'px ' + str(-y) + 'px}')
  out.save('pages/pokedex.png')
  with open('pages/pokedex.css', 'w') as css:
    css.write(''.join(style))
except:
  print('Not generating images, missing (PIL|pillow)')
