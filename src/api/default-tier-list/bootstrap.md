# Default Tier List Bootstrap Instructions

## Initial Data Setup

After creating the content type, you need to populate it with the default tier list data through the Strapi admin panel.

1. Access Strapi Admin Panel
2. Navigate to Content Manager > Single Types > Default Tier List
3. Enter the following JSON data for each tier field:

### tierSS
```json
[
  { "slug": "laevatain", "name": "Laevatain", "tier": "SS", "element": "Heat", "role": "Assault" },
  { "slug": "yvonne", "name": "Yvonne", "tier": "SS", "element": "Cryo", "role": "Assault" }
]
```

### tierS
```json
[
  { "slug": "ardelia", "name": "Ardelia", "tier": "S", "element": "Nature", "role": "Supporter" },
  { "slug": "gilberta", "name": "Gilberta", "tier": "S", "element": "Nature", "role": "Supporter" },
  { "slug": "pogranichnik", "name": "Pogranichnik", "tier": "S", "element": "Physical", "role": "Vanguard" },
  { "slug": "last-rite", "name": "Last Rite", "tier": "S", "element": "Cryo", "role": "Assault" },
  { "slug": "antal", "name": "Antal", "tier": "S", "element": "Electric", "role": "Supporter" },
  { "slug": "avywenna", "name": "Avywenna", "tier": "S", "element": "Electric", "role": "Assault" },
  { "slug": "xaihi", "name": "Xaihi", "tier": "S", "element": "Cryo", "role": "Supporter" }
]
```

### tierA
```json
[
  { "slug": "endministrator", "name": "Endministrator", "tier": "A", "element": "Physical", "role": "Guard" },
  { "slug": "perlica", "name": "Perlica", "tier": "A", "element": "Electric", "role": "Caster" },
  { "slug": "akekuri", "name": "Akekuri", "tier": "A", "element": "Heat", "role": "Vanguard" },
  { "slug": "chen-qianyu", "name": "Chen Qianyu", "tier": "A", "element": "Physical", "role": "Guard" },
  { "slug": "lifeng", "name": "Lifeng", "tier": "A", "element": "Physical", "role": "Guard" }
]
```

### tierB
```json
[
  { "slug": "ember", "name": "Ember", "tier": "B", "element": "Heat", "role": "Defender" },
  { "slug": "arclight", "name": "Arclight", "tier": "B", "element": "Electric", "role": "Vanguard" },
  { "slug": "da-pan", "name": "Da Pan", "tier": "B", "element": "Physical", "role": "Assault" },
  { "slug": "snowshine", "name": "Snowshine", "tier": "B", "element": "Cryo", "role": "Defender" },
  { "slug": "wulfgard", "name": "Wulfgard", "tier": "B", "element": "Heat", "role": "Caster" },
  { "slug": "alesh", "name": "Alesh", "tier": "B", "element": "Cryo", "role": "Vanguard" },
  { "slug": "estella", "name": "Estella", "tier": "B", "element": "Cryo", "role": "Guard" }
]
```

### tierC
```json
[
  { "slug": "fluorite", "name": "Fluorite", "tier": "C", "element": "Nature", "role": "Caster" },
  { "slug": "catcher", "name": "Catcher", "tier": "C", "element": "Physical", "role": "Defender" }
]
```

### tierD
```json
[]
```

### lastUpdated
Set to the current date/time.

### description
```
Default rankings based on community consensus from Mobalytics, Prydwen, Game8, and community discussion.
```

4. Save and Publish the content
5. Make sure the content type is set to "Public" in Settings > Users & Permissions > Roles > Public > Default Tier List (enable find action)
