'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Plus, Search, X, Heart, Eye, Trash2, Edit3, Copy, ChevronDown, Shield, Sword as SwordIcon, Star } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { CHARACTERS, WEAPONS, ELEMENTS, ROLES, WEAPON_TYPES } from '@/lib/data';
import { CHARACTER_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, PROFESSION_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Character, Element, Role, WeaponType } from '@/types/game';

// Equipment sets data (inline since no separate file)
const EQUIPMENT_SETS = [
  { name: 'Eternal Xiranite', tier: 'T4', bonus: 'Ultimate damage +25%' },
  { name: 'Type 50 Yinglung', tier: 'T4', bonus: 'ATK +18%, Crit Rate +12%' },
  { name: 'Tide Surge', tier: 'T4', bonus: 'Elemental Burst DMG +30%' },
  { name: 'Swordmancer', tier: 'T4', bonus: 'Normal/Charged ATK +20%' },
  { name: 'Hot Work', tier: 'T4', bonus: 'Elemental Skill DMG +25%' },
  { name: 'Æthertech', tier: 'T4', bonus: 'Poise +15%, DEF +20%' },
  { name: 'LYNX', tier: 'T4', bonus: 'Healing effectiveness +25%' },
  { name: 'Catastrophe', tier: 'T3', bonus: 'Elemental RES +25%' },
  { name: 'Mordvolt Insulation', tier: 'T2', bonus: 'INT +15%' },
  { name: 'Mordvolt Resistant', tier: 'T2', bonus: 'Will +15%' },
  { name: 'Armored MSGR', tier: 'T2', bonus: 'STR +15%' },
  { name: 'AIC Heavy', tier: 'T1', bonus: 'HP +10%' },
];

// Types
interface BuildCharacter {
  name: string;
  weapon?: string;
  equipment?: string;
  notes?: string;
  skillLevels?: number[];
}

interface Build {
  id: string;
  name: string;
  type: 'single' | 'team';
  characters: BuildCharacter[];
  tags: string[];
  notes: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  author?: string;
}

type ViewMode = 'browse' | 'create' | 'my-builds';
type BrowseFilter = 'popular' | 'latest' | 'teams' | 'single';
type CreateTab = 'single' | 'team';

const TAGS = ['Meta', 'F2P', 'Speedrun', 'Boss Kill', 'Exploration', 'DPS', 'Support', 'Tank', 'Healer', 'Off-Meta', 'Fun'];
const MAX_TEAM_SIZE = 4;

// Sample community builds for demonstration
const SAMPLE_BUILDS: Build[] = [
  {
    id: 'laevatain-hypercarry',
    name: 'Laevatain Hypercarry',
    type: 'single',
    characters: [{
      name: 'Laevatain',
      weapon: 'Umbral Torch',
      equipment: 'Type 50 Yinglung',
      skillLevels: [10, 10, 10, 10],
      notes: 'Main DPS - prioritize Heat DMG and Arts Intensity. Umbral Torch stacks perfectly with her kit.'
    }],
    tags: ['Meta', 'DPS'],
    notes: 'Best-in-slot setup for Laevatain. Umbral Torch provides the highest damage ceiling with Type 50 Yinglung for crit stacking. Focus on building Intellect and Heat DMG. Use combo skills to maintain Yinglung\'s Edge stacks, then unleash ultimate for massive burst.',
    isPublic: true,
    likes: 47,
    views: 312,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'cryo-freeze-team',
    name: 'Cryo Freeze Team',
    type: 'team',
    characters: [
      {
        name: 'Last Rite',
        weapon: 'Exemplar',
        equipment: 'Tide Surge',
        skillLevels: [10, 10, 8, 10],
        notes: 'Main DPS - stack Physical DMG and maximize greatsword combo chains.'
      },
      {
        name: 'Yvonne',
        weapon: 'Navigator',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 10, 10, 8],
        notes: 'Sub-DPS - provides Cryo burst damage and ranged support.'
      },
      {
        name: 'Xaihi',
        weapon: 'Wild Wanderer',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer - keeps team alive with consistent healing and shields.'
      },
      {
        name: 'Snowshine',
        weapon: 'Seeker of Dark Lung',
        equipment: 'Æthertech',
        skillLevels: [8, 8, 8, 10],
        notes: 'Tank - absorbs damage and applies Cryo Infliction for team synergy.'
      },
    ],
    tags: ['Meta', 'Boss Kill'],
    notes: 'Full cryo team that chains freeze reactions. Last Rite as main DPS, Yvonne for sub-DPS burst, Xaihi healing, Snowshine tanking. Rotation: Snowshine applies Cryo Infliction → Yvonne burst → Last Rite combo chains. Keep enemies frozen for maximum damage uptime.',
    isPublic: true,
    likes: 83,
    views: 621,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 5,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'f2p-endministrator',
    name: 'F2P Endministrator',
    type: 'single',
    characters: [{
      name: 'Endministrator',
      weapon: 'Fortmaker',
      equipment: 'Swordmancer',
      skillLevels: [10, 10, 8, 10],
      notes: 'Versatile protagonist build - balanced stats make it work in any content.'
    }],
    tags: ['F2P', 'DPS'],
    notes: 'Budget-friendly build using the free protagonist. Fortmaker is a solid 5-star option that scales well. Swordmancer set provides Physical Status synergy. Great for new players - all materials are farmable. Stack Agility and Physical DMG for best results.',
    isPublic: true,
    likes: 124,
    views: 891,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 10,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'physical-quickswap',
    name: 'Physical Quickswap',
    type: 'team',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Forgeborn Scathe',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Primary swap target - builds combo gauge quickly with sword attacks.'
      },
      {
        name: 'Lifeng',
        weapon: 'Valiant',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 10, 10, 8],
        notes: 'Polearm specialist - high burst after combo gauge is filled.'
      },
      {
        name: 'Chen Qianyu',
        weapon: 'Sundering Steel',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 8, 8],
        notes: 'Counter-focused Guard - exceptional Agility enables precise dodges and counters.'
      },
      {
        name: 'Gilberta',
        weapon: 'Opus: Etch Figure',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer/Support - Nature buffs and sustained team healing.'
      },
    ],
    tags: ['Meta', 'Speedrun'],
    notes: 'Rapid character swapping for continuous combo chains. Each character builds combo gauge for the next. Focus on maintaining combo stacks across all operators. Swap when combo skill is ready to maximize Yinglung\'s Edge stacks. Gilberta provides safety net healing.',
    isPublic: true,
    likes: 56,
    views: 445,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'ember-solo-tank',
    name: 'Ember Solo Tank',
    type: 'single',
    characters: [{
      name: 'Ember',
      weapon: 'Thunderberge',
      equipment: 'Æthertech',
      skillLevels: [8, 8, 10, 10],
      notes: 'Unkillable tank - combo skill provides massive shields and self-healing.'
    }],
    tags: ['Tank', 'Off-Meta'],
    notes: 'Ember can solo-tank most content with Æthertech poise stacking. Thunderberge adds self-healing on hit. Build Strength and HP for maximum survivability. Use combo skill on cooldown for shield uptime. Great for solo challenges and exploration.',
    isPublic: true,
    likes: 31,
    views: 198,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'electric-overload',
    name: 'Electric Overload',
    type: 'team',
    characters: [
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 8, 10],
        notes: 'Primary Electric DPS - fast sword attacks apply Electrification rapidly.'
      },
      {
        name: 'Perlica',
        weapon: 'Detonation Unit',
        equipment: 'Eternal Xiranite',
        skillLevels: [8, 10, 10, 8],
        notes: 'Arts Caster - detonates Electric Infliction for massive AoE damage.'
      },
      {
        name: 'Avywenna',
        weapon: 'Chimeric Justice',
        equipment: 'Type 50 Yinglung',
        skillLevels: [8, 8, 10, 8],
        notes: 'Polearm DPS - extends Electric chains with combo skills.'
      },
      {
        name: 'Antal',
        weapon: 'Hypernova Auto',
        equipment: 'Mordvolt Insulation',
        skillLevels: [6, 8, 10, 6],
        notes: 'Electric Support - buffs team\'s Arts DMG and provides sustained Electric application.'
      },
    ],
    tags: ['Fun', 'DPS'],
    notes: 'All-electric team for maximum elemental reaction chains. Very satisfying to play even if not perfectly meta. Chain Electrification across all enemies for screen-wide damage. Perlica detonates for huge burst. Antal provides consistent buffs. Great for AoE encounters.',
    isPublic: true,
    likes: 42,
    views: 267,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 4,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'nature-corruption-core',
    name: 'Nature Corruption Core',
    type: 'team',
    characters: [
      {
        name: 'Ardelia',
        weapon: 'Chivalric Virtues',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 8],
        notes: 'Main healer - high Will provides massive healing output.'
      },
      {
        name: 'Gilberta',
        weapon: 'Opus: Etch Figure',
        equipment: 'Eternal Xiranite',
        skillLevels: [6, 8, 10, 6],
        notes: 'Sub-healer/Support - Nature buffs and Lifted application.'
      },
      {
        name: 'Fluorite',
        weapon: 'Fluorescent Roc',
        equipment: 'Hot Work',
        skillLevels: [8, 10, 8, 8],
        notes: 'Nature Caster DPS - handcannon ranged attacks with high Agility.'
      },
      {
        name: 'Ember',
        weapon: 'Former Finery',
        equipment: 'Æthertech',
        skillLevels: [8, 8, 10, 10],
        notes: 'Off-role tank - provides frontline protection while healers work.'
      },
    ],
    tags: ['Support', 'Healer', 'Off-Meta'],
    notes: 'Double healer comp focused on Nature element synergy and Corrosion application. Incredibly safe for difficult content. Ardelia and Gilberta provide overlapping heals and buffs. Fluorite adds Nature DPS from backline. Ember tanks. Can outlast nearly any encounter.',
    isPublic: true,
    likes: 29,
    views: 183,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 2,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'heat-combustion-burst',
    name: 'Heat Combustion Burst',
    type: 'team',
    characters: [
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Type 50 Yinglung',
        skillLevels: [10, 10, 10, 10],
        notes: 'Main DPS - ultimate nuke with Heat DMG stacking.'
      },
      {
        name: 'Wulfgard',
        weapon: 'Rational Farewell',
        equipment: 'Hot Work',
        skillLevels: [8, 10, 8, 8],
        notes: 'Heat Caster - applies Combustion and provides ranged DPS.'
      },
      {
        name: 'Akekuri',
        weapon: 'Thermite Cutter',
        equipment: 'Frontiers',
        skillLevels: [8, 8, 10, 8],
        notes: 'Heat Vanguard - fast sword attacks maintain Combustion uptime.'
      },
      {
        name: 'Gilberta',
        weapon: 'Delivery Guaranteed',
        equipment: 'LYNX',
        skillLevels: [6, 8, 10, 6],
        notes: 'Healer - off-element support for survivability.'
      },
    ],
    tags: ['DPS', 'Speedrun'],
    notes: 'Triple Heat DPS focused on Combustion stacking and burst windows. Apply Combustion with Wulfgard → stack with Akekuri → detonate with Laevatain ultimate. Gilberta heals when needed. Extremely high damage but requires careful resource management. Best for short fights.',
    isPublic: true,
    likes: 38,
    views: 241,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 6,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'balanced-rainbow',
    name: 'Balanced Rainbow',
    type: 'team',
    characters: [
      {
        name: 'Endministrator',
        weapon: 'Forgeborn Scathe',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Physical DPS - well-rounded stats fit any situation.'
      },
      {
        name: 'Laevatain',
        weapon: 'Umbral Torch',
        equipment: 'Hot Work',
        skillLevels: [10, 10, 10, 10],
        notes: 'Heat DPS - burst damage dealer.'
      },
      {
        name: 'Last Rite',
        weapon: 'Khravengger',
        equipment: 'Tide Surge',
        skillLevels: [10, 10, 8, 10],
        notes: 'Cryo DPS - greatsword chains with freeze application.'
      },
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'Frontiers',
        skillLevels: [10, 10, 8, 10],
        notes: 'Electric DPS - high Agility enables rapid elemental application.'
      },
    ],
    tags: ['DPS', 'Fun'],
    notes: 'Rainbow team with 4 different elements for maximum elemental coverage. Can adapt to any enemy weakness. No healer means high risk/high reward gameplay. Relies on dodging and killing enemies before they kill you. Great for players who know enemy patterns well.',
    isPublic: true,
    likes: 51,
    views: 329,
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 7,
    author: 'ZeroSanity Staff',
  },
  {
    id: 'vanguard-rush',
    name: 'Vanguard Rush',
    type: 'team',
    characters: [
      {
        name: 'Pogranichnik',
        weapon: 'Never Rest',
        equipment: 'Swordmancer',
        skillLevels: [10, 10, 8, 10],
        notes: 'Physical Vanguard - high Will provides sustain through SP recovery.'
      },
      {
        name: 'Arclight',
        weapon: 'Rapid Ascent',
        equipment: 'MI Security',
        skillLevels: [10, 10, 8, 10],
        notes: 'Electric Vanguard - lightning-fast attacks and high mobility.'
      },
      {
        name: 'Akekuri',
        weapon: 'Aspirant',
        equipment: 'Frontiers',
        skillLevels: [8, 8, 10, 8],
        notes: 'Heat Vanguard - swift burn application and combo chains.'
      },
      {
        name: 'Alesh',
        weapon: 'Finchaser 3.0',
        equipment: 'Tide Surge',
        skillLevels: [10, 8, 8, 10],
        notes: 'Cryo Vanguard - high Strength provides frontline pressure.'
      },
    ],
    tags: ['Speedrun', 'Fun'],
    notes: 'All-Vanguard team focused on aggressive field control and rapid skill rotations. High mobility and constant pressure. Each operator has fast cooldowns - keep swapping to maintain buffs. Requires good mechanical skill. No dedicated healer means you must dodge well.',
    isPublic: true,
    likes: 27,
    views: 156,
    createdAt: Date.now() - 86400000 * 11,
    updatedAt: Date.now() - 86400000 * 9,
    author: 'ZeroSanity Staff',
  },
];

export default function BuildsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [myBuilds, setMyBuilds] = useState<Build[]>([]);

  // Create form state
  const [createTab, setCreateTab] = useState<CreateTab>('single');
  const [buildName, setBuildName] = useState('');
  const [buildNotes, setBuildNotes] = useState('');
  const [buildTags, setBuildTags] = useState<string[]>([]);
  const [buildCharacters, setBuildCharacters] = useState<BuildCharacter[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);

  // Character picker modal
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [charPickerSlot, setCharPickerSlot] = useState(0);
  const [charSearch, setCharSearch] = useState('');
  const [charFilterElement, setCharFilterElement] = useState<Element | ''>('');
  const [charFilterRole, setCharFilterRole] = useState<Role | ''>('');
  const [charFilterRarity, setCharFilterRarity] = useState<number | ''>('');

  // Weapon picker modal
  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const [weaponPickerSlot, setWeaponPickerSlot] = useState(0);
  const [weaponSearch, setWeaponSearch] = useState('');
  const [weaponFilterType, setWeaponFilterType] = useState<WeaponType | ''>('');

  // Equipment picker modal
  const [showEquipPicker, setShowEquipPicker] = useState(false);
  const [equipPickerSlot, setEquipPickerSlot] = useState(0);

  // Load saved builds
  useEffect(() => {
    const saved = localStorage.getItem('endfield-my-builds');
    if (saved) {
      try { setMyBuilds(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveBuilds = useCallback((builds: Build[]) => {
    setMyBuilds(builds);
    localStorage.setItem('endfield-my-builds', JSON.stringify(builds));
  }, []);

  // All builds = sample + my public builds
  const allBuilds = useMemo(() => {
    const pub = myBuilds.filter(b => b.isPublic);
    return [...SAMPLE_BUILDS, ...pub];
  }, [myBuilds]);

  // Filtered browse builds
  const filteredBuilds = useMemo(() => {
    let builds = allBuilds;
    if (browseFilter === 'teams') builds = builds.filter(b => b.type === 'team');
    if (browseFilter === 'single') builds = builds.filter(b => b.type === 'single');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      builds = builds.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.characters.some(c => c.name.toLowerCase().includes(q)) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (browseFilter === 'popular') builds = [...builds].sort((a, b) => b.likes - a.likes);
    if (browseFilter === 'latest') builds = [...builds].sort((a, b) => b.createdAt - a.createdAt);
    return builds;
  }, [allBuilds, browseFilter, searchQuery]);

  // Character picker filtered list
  const filteredChars = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (charSearch && !c.Name.toLowerCase().includes(charSearch.toLowerCase())) return false;
      if (charFilterElement && c.Element !== charFilterElement) return false;
      if (charFilterRole && c.Role !== charFilterRole) return false;
      if (charFilterRarity && c.Rarity !== charFilterRarity) return false;
      // Don't show already-selected characters (except the current slot)
      const alreadySelected = buildCharacters.filter((_, i) => i !== charPickerSlot).map(bc => bc.name);
      if (alreadySelected.includes(c.Name)) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [charSearch, charFilterElement, charFilterRole, charFilterRarity, buildCharacters, charPickerSlot]);

  // Weapon picker filtered list
  const filteredWeapons = useMemo(() => {
    const selectedChar = buildCharacters[weaponPickerSlot];
    const charData = selectedChar ? CHARACTERS.find(c => c.Name === selectedChar.name) : null;
    return WEAPONS.filter(w => {
      if (weaponSearch && !w.Name.toLowerCase().includes(weaponSearch.toLowerCase())) return false;
      if (weaponFilterType && w.WeaponType !== weaponFilterType) return false;
      // If we know the character's weapon type, filter to matching
      if (charData && w.WeaponType !== charData.WeaponType) return false;
      return true;
    }).sort((a, b) => b.Rarity - a.Rarity || a.Name.localeCompare(b.Name));
  }, [weaponSearch, weaponFilterType, buildCharacters, weaponPickerSlot]);

  const maxSlots = createTab === 'team' ? MAX_TEAM_SIZE : 1;

  const openCharPicker = (slot: number) => {
    setCharPickerSlot(slot);
    setCharSearch('');
    setCharFilterElement('');
    setCharFilterRole('');
    setCharFilterRarity('');
    setShowCharPicker(true);
  };

  const selectCharacter = (charName: string) => {
    const newChars = [...buildCharacters];
    const charData = CHARACTERS.find(c => c.Name === charName);
    if (charPickerSlot < newChars.length) {
      // If weapon type changed, clear weapon
      const oldChar = CHARACTERS.find(c => c.Name === newChars[charPickerSlot].name);
      if (oldChar && charData && oldChar.WeaponType !== charData.WeaponType) {
        newChars[charPickerSlot] = { name: charName, equipment: newChars[charPickerSlot].equipment };
      } else {
        newChars[charPickerSlot] = { ...newChars[charPickerSlot], name: charName };
      }
    } else {
      newChars.push({ name: charName });
    }
    setBuildCharacters(newChars);
    setShowCharPicker(false);
  };

  const openWeaponPicker = (slot: number) => {
    setWeaponPickerSlot(slot);
    setWeaponSearch('');
    setWeaponFilterType('');
    setShowWeaponPicker(true);
  };

  const selectWeapon = (weaponName: string) => {
    const newChars = [...buildCharacters];
    if (newChars[weaponPickerSlot]) {
      newChars[weaponPickerSlot] = { ...newChars[weaponPickerSlot], weapon: weaponName };
      setBuildCharacters(newChars);
    }
    setShowWeaponPicker(false);
  };

  const openEquipPicker = (slot: number) => {
    setEquipPickerSlot(slot);
    setShowEquipPicker(true);
  };

  const selectEquipment = (setName: string) => {
    const newChars = [...buildCharacters];
    if (newChars[equipPickerSlot]) {
      newChars[equipPickerSlot] = { ...newChars[equipPickerSlot], equipment: setName };
      setBuildCharacters(newChars);
    }
    setShowEquipPicker(false);
  };

  const removeCharacter = (slot: number) => {
    setBuildCharacters(buildCharacters.filter((_, i) => i !== slot));
  };

  const toggleTag = (tag: string) => {
    setBuildTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const resetForm = () => {
    setBuildName('');
    setBuildNotes('');
    setBuildTags([]);
    setBuildCharacters([]);
    setIsPublic(true);
    setEditingBuildId(null);
  };

  const saveBuild = () => {
    if (!buildName.trim() || buildCharacters.length === 0) return;
    const now = Date.now();
    if (editingBuildId) {
      const updated = myBuilds.map(b => b.id === editingBuildId ? {
        ...b, name: buildName, type: createTab, characters: buildCharacters,
        tags: buildTags, notes: buildNotes, isPublic, updatedAt: now,
      } : b);
      saveBuilds(updated);
    } else {
      const newBuild: Build = {
        id: `build-${now}`, name: buildName, type: createTab,
        characters: buildCharacters, tags: buildTags, notes: buildNotes,
        isPublic, likes: 0, views: 0, createdAt: now, updatedAt: now,
      };
      saveBuilds([...myBuilds, newBuild]);
    }
    resetForm();
    setViewMode('my-builds');
  };

  const editBuild = (build: Build) => {
    setEditingBuildId(build.id);
    setBuildName(build.name);
    setCreateTab(build.type);
    setBuildCharacters(build.characters);
    setBuildTags(build.tags);
    setBuildNotes(build.notes);
    setIsPublic(build.isPublic);
    setViewMode('create');
  };

  const deleteBuild = (id: string) => {
    if (confirm('Delete this build?')) {
      saveBuilds(myBuilds.filter(b => b.id !== id));
    }
  };

  const duplicateBuild = (build: Build) => {
    const dup: Build = {
      ...build, id: `build-${Date.now()}`, name: `${build.name} (Copy)`,
      likes: 0, views: 0, createdAt: Date.now(), updatedAt: Date.now(),
    };
    saveBuilds([...myBuilds, dup]);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCharElement = (name: string) => CHARACTERS.find(c => c.Name === name)?.Element;
  const getCharRarity = (name: string) => CHARACTERS.find(c => c.Name === name)?.Rarity || 4;
  const getCharRole = (name: string) => CHARACTERS.find(c => c.Name === name)?.Role;

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-6xl mx-auto">
        <RIOSHeader title="Community Builds" category="COMMUNITY" code="RIOS-BLD-001" icon={<Users size={28} />}
          subtitle="Create, share, and browse operator builds and team compositions" />

        {/* View mode buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setViewMode('create'); setCreateTab('single'); resetForm(); }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2 clip-corner-tl transition-colors">
            <Plus size={14} /> Create Single Build
          </button>
          <button onClick={() => { setViewMode('create'); setCreateTab('team'); resetForm(); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 clip-corner-tl transition-colors">
            <Users size={14} /> Create Team Build
          </button>
          <button onClick={() => setViewMode('my-builds')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 clip-corner-tl transition-colors border ${
              viewMode === 'my-builds' ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}>
            <Star size={14} /> My Builds ({myBuilds.length})
          </button>
          <button onClick={() => setViewMode('browse')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 clip-corner-tl transition-colors border ${
              viewMode === 'browse' ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}>
            <Search size={14} /> Browse All
          </button>
        </div>

        {/* ===== BROWSE VIEW ===== */}
        {viewMode === 'browse' && (
          <div>
            {/* Filter tabs + search */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(['popular', 'latest', 'teams', 'single'] as BrowseFilter[]).map(f => (
                <button key={f} onClick={() => setBrowseFilter(f)}
                  className={`px-3 py-1.5 text-sm font-bold clip-corner-tl transition-colors ${
                    browseFilter === f ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white'
                  }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search builds, operators, tags..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
                </div>
              </div>
            </div>

            {/* Build cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBuilds.map(build => (
                <BuildCard key={build.id} build={build} onDuplicate={() => duplicateBuild(build)}
                  getCharElement={getCharElement} getCharRarity={getCharRarity} getCharRole={getCharRole} formatDate={formatDate} />
              ))}
            </div>
            {filteredBuilds.length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-tertiary)]">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p>No builds found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== MY BUILDS VIEW ===== */}
        {viewMode === 'my-builds' && (
          <div>
            {myBuilds.length === 0 ? (
              <div className="text-center py-16">
                <Star size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-30" />
                <p className="text-[var(--color-text-tertiary)] mb-4">You haven&apos;t created any builds yet.</p>
                <button onClick={() => { setViewMode('create'); resetForm(); }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold clip-corner-tl">
                  Create Your First Build
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myBuilds.map(build => (
                  <div key={build.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                    {/* Character portraits row */}
                    <div className="flex bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                      {build.characters.map((bc, i) => {
                        const icon = CHARACTER_ICONS[bc.name];
                        const rarity = getCharRarity(bc.name);
                        return (
                          <div key={i} className="w-16 h-16 relative flex-shrink-0"
                            style={{ borderBottom: `3px solid ${RARITY_COLORS[rarity] || '#666'}` }}>
                            {icon ? (
                              <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="64px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-tertiary)]">{bc.name}</div>
                            )}
                          </div>
                        );
                      })}
                      <div className="flex-1" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-white font-bold text-sm">{build.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 font-bold ${build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                              {build.type === 'team' ? 'TEAM' : 'SINGLE'}
                            </span>
                            {build.isPublic && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">PUBLIC</span>}
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">{formatDate(build.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => editBuild(build)} className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => duplicateBuild(build)} className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-blue-400">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => deleteBuild(build.id)} className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {build.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {build.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CREATE/EDIT VIEW ===== */}
        {viewMode === 'create' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingBuildId ? 'Edit Build' : 'Create New Build'}
            </h2>

            {/* Single / Team tabs */}
            <div className="flex gap-1 mb-6">
              <button onClick={() => { setCreateTab('single'); setBuildCharacters(buildCharacters.slice(0, 1)); }}
                className={`px-4 py-2 text-sm font-bold clip-corner-tl ${createTab === 'single' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}>
                Single Character
              </button>
              <button onClick={() => setCreateTab('team')}
                className={`px-4 py-2 text-sm font-bold clip-corner-tl ${createTab === 'team' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}>
                Team ({MAX_TEAM_SIZE} max)
              </button>
            </div>

            {/* Build name */}
            <div className="mb-4">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase">Build Name</label>
              <input type="text" value={buildName} onChange={e => setBuildName(e.target.value)} maxLength={60}
                placeholder="e.g., Laevatain Hypercarry, Cryo Freeze Team"
                className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
            </div>

            {/* Character slots */}
            <div className="mb-4">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-2 uppercase">
                Characters ({buildCharacters.length}/{maxSlots})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Existing characters */}
                {buildCharacters.map((bc, i) => {
                  const charData = CHARACTERS.find(c => c.Name === bc.name);
                  const icon = CHARACTER_ICONS[bc.name];
                  const weaponIcon = bc.weapon ? WEAPON_ICONS[bc.weapon] : null;
                  const equipIcon = bc.equipment ? EQUIPMENT_ICONS[bc.equipment] : null;
                  const elem = charData?.Element;
                  const rarity = charData?.Rarity || 4;

                  return (
                    <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden"
                      style={{ borderLeft: `4px solid ${elem ? ELEMENT_COLORS[elem] : '#666'}` }}>
                      {/* Character header */}
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--color-surface)]" onClick={() => openCharPicker(i)}>
                        <div className="w-14 h-14 relative flex-shrink-0 bg-black/30"
                          style={{ borderBottom: `3px solid ${RARITY_COLORS[rarity] || '#666'}` }}>
                          {icon ? (
                            <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">?</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{bc.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                            {charData && (
                              <>
                                <span style={{ color: ELEMENT_COLORS[charData.Element] }}>{charData.Element}</span>
                                <span>{charData.Role}</span>
                                <span>{charData.WeaponType}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeCharacter(i); }}
                          className="p-1 text-[var(--color-text-tertiary)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Weapon + Equipment row */}
                      <div className="flex border-t border-[var(--color-border)]">
                        <button onClick={() => openWeaponPicker(i)}
                          className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-surface)] border-r border-[var(--color-border)] text-left">
                          {weaponIcon ? (
                            <Image src={weaponIcon} alt={bc.weapon || ''} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                          ) : (
                            <SwordIcon size={14} className="text-[var(--color-text-tertiary)]" />
                          )}
                          <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">{bc.weapon || 'Select Weapon'}</span>
                        </button>
                        <button onClick={() => openEquipPicker(i)}
                          className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-surface)] text-left">
                          {equipIcon ? (
                            <Image src={equipIcon} alt={bc.equipment || ''} width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                          ) : (
                            <Shield size={14} className="text-[var(--color-text-tertiary)]" />
                          )}
                          <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">{bc.equipment || 'Select Equipment'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add character button */}
                {buildCharacters.length < maxSlots && (
                  <button onClick={() => openCharPicker(buildCharacters.length)}
                    className="h-[106px] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] flex flex-col items-center justify-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors">
                    <Plus size={24} />
                    <span className="text-xs">Add Operator</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-2 uppercase">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 text-xs font-bold transition-colors ${
                      buildTags.includes(tag) ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-white'
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs text-[var(--color-text-tertiary)] mb-1 uppercase">Notes / Description</label>
              <textarea value={buildNotes} onChange={e => setBuildNotes(e.target.value)} rows={3} maxLength={500}
                placeholder="Describe your build strategy, rotation tips, etc."
                className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none resize-none" />
            </div>

            {/* Public toggle */}
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => setIsPublic(!isPublic)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isPublic ? 'translate-x-5.5' : 'translate-x-0.5'}`}
                  style={{ transform: `translateX(${isPublic ? '22px' : '2px'})` }} />
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">Make Public</span>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <button onClick={saveBuild}
                disabled={!buildName.trim() || buildCharacters.length === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white font-bold text-sm clip-corner-tl transition-colors">
                {editingBuildId ? 'Save Changes' : 'Create Build'}
              </button>
              <button onClick={() => { resetForm(); setViewMode('browse'); }}
                className="px-6 py-2 bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white text-sm clip-corner-tl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CHARACTER PICKER MODAL ===== */}
      {showCharPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowCharPicker(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="text-white font-bold">Select Operator</h3>
              <button onClick={() => setShowCharPicker(false)} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
            </div>

            {/* Search + Filters */}
            <div className="p-4 border-b border-[var(--color-border)] space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input type="text" value={charSearch} onChange={e => setCharSearch(e.target.value)}
                  placeholder="Search operators..."
                  className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={charFilterRarity} onChange={e => setCharFilterRarity(e.target.value ? Number(e.target.value) : '')}
                  className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                  <option value="">All Rarities</option>
                  <option value="6">6-Star</option>
                  <option value="5">5-Star</option>
                  <option value="4">4-Star</option>
                </select>
                <select value={charFilterElement} onChange={e => setCharFilterElement(e.target.value as Element | '')}
                  className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                  <option value="">All Elements</option>
                  {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                </select>
                <select value={charFilterRole} onChange={e => setCharFilterRole(e.target.value as Role | '')}
                  className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white outline-none">
                  <option value="">All Roles</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Character grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredChars.map(char => {
                  const icon = CHARACTER_ICONS[char.Name];
                  const profIcon = PROFESSION_ICONS[char.Role];
                  return (
                    <button key={char.Name} onClick={() => selectCharacter(char.Name)}
                      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors group">
                      <div className="aspect-square relative">
                        {icon ? (
                          <Image src={icon} alt={char.Name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized sizes="120px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{char.Name}</div>
                        )}
                        {/* Role icon */}
                        {profIcon && (
                          <div className="absolute top-1 left-1 w-5 h-5 bg-black/60">
                            <Image src={profIcon} alt={char.Role} fill className="object-contain p-0.5" unoptimized sizes="20px" />
                          </div>
                        )}
                        {/* Element dot */}
                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[char.Element] }} />
                      </div>
                      <div className="px-1 py-1" style={{ borderTop: `2px solid ${RARITY_COLORS[char.Rarity] || '#666'}` }}>
                        <p className="text-[10px] text-white text-center truncate">{char.Name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {filteredChars.length === 0 && (
                <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">No operators match your filters.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== WEAPON PICKER MODAL ===== */}
      {showWeaponPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowWeaponPicker(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="text-white font-bold">Select Weapon</h3>
              <button onClick={() => setShowWeaponPicker(false)} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-4 border-b border-[var(--color-border)] space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input type="text" value={weaponSearch} onChange={e => setWeaponSearch(e.target.value)}
                  placeholder="Search weapons..."
                  className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] outline-none" />
              </div>
              {!buildCharacters[weaponPickerSlot] || !CHARACTERS.find(c => c.Name === buildCharacters[weaponPickerSlot]?.name) ? (
                <div className="flex flex-wrap gap-1">
                  {WEAPON_TYPES.map(wt => (
                    <button key={wt} onClick={() => setWeaponFilterType(weaponFilterType === wt ? '' : wt)}
                      className={`px-2 py-1 text-xs ${weaponFilterType === wt ? 'bg-[var(--color-accent)] text-black font-bold' : 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]'}`}>
                      {wt}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  Showing {CHARACTERS.find(c => c.Name === buildCharacters[weaponPickerSlot]?.name)?.WeaponType} weapons (matches operator)
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredWeapons.map(wpn => {
                  const icon = WEAPON_ICONS[wpn.Name];
                  return (
                    <button key={wpn.Name} onClick={() => selectWeapon(wpn.Name)}
                      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors group">
                      <div className="aspect-square relative bg-black/20">
                        {icon ? (
                          <Image src={icon} alt={wpn.Name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" unoptimized sizes="120px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">{wpn.Name}</div>
                        )}
                      </div>
                      <div className="px-1 py-1" style={{ borderTop: `2px solid ${RARITY_COLORS[wpn.Rarity] || '#666'}` }}>
                        <p className="text-[10px] text-white text-center truncate">{wpn.Name}</p>
                        <p className="text-[8px] text-center text-[var(--color-text-tertiary)]">{wpn.WeaponType}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {filteredWeapons.length === 0 && (
                <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">No weapons match your filters.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== EQUIPMENT PICKER MODAL ===== */}
      {showEquipPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowEquipPicker(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-lg max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="text-white font-bold">Select Equipment Set</h3>
              <button onClick={() => setShowEquipPicker(false)} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {EQUIPMENT_SETS.map(eq => {
                const icon = EQUIPMENT_ICONS[eq.name];
                return (
                  <button key={eq.name} onClick={() => selectEquipment(eq.name)}
                    className="w-full flex items-center gap-3 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left">
                    <div className="w-10 h-10 relative flex-shrink-0">
                      {icon ? (
                        <Image src={icon} alt={eq.name} fill className="object-contain" unoptimized sizes="40px" />
                      ) : (
                        <Shield size={20} className="text-[var(--color-text-tertiary)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-bold truncate">{eq.name}</p>
                        <span className="text-[9px] px-1 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">{eq.tier}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{eq.bonus}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Build card component for browse/community view
function BuildCard({ build, onDuplicate, getCharElement, getCharRarity, getCharRole, formatDate }: {
  build: Build;
  onDuplicate: () => void;
  getCharElement: (n: string) => Element | undefined;
  getCharRarity: (n: string) => number;
  getCharRole: (n: string) => string | undefined;
  formatDate: (ts: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Link
      href={`/builds/${build.id}`}
      className={`block bg-[var(--color-surface)] border clip-corner-tl overflow-hidden transition-all ${
        expanded ? 'border-[var(--color-accent)]/60 ring-1 ring-[var(--color-accent)]/20' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
      }`}
    >
      {/* Character portraits row */}
      <div className="flex bg-[var(--color-surface-2)]">
        {build.characters.map((bc, i) => {
          const icon = CHARACTER_ICONS[bc.name];
          const rarity = getCharRarity(bc.name);
          const elem = getCharElement(bc.name);
          return (
            <div key={i} className="relative" style={{ width: `${100 / Math.max(build.characters.length, 1)}%`, maxWidth: '25%' }}>
              <div className="aspect-square relative">
                {icon ? (
                  <Image src={icon} alt={bc.name} fill className="object-cover" unoptimized sizes="150px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface)]">{bc.name}</div>
                )}
                {elem && <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[elem] }} />}
              </div>
              <div className="h-0.5" style={{ backgroundColor: RARITY_COLORS[rarity] || '#666' }} />
            </div>
          );
        })}
        {build.characters.length < 4 && build.type === 'team' && (
          <div className="flex-1 bg-[var(--color-surface)] opacity-30" />
        )}
      </div>

      {/* Build info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm truncate">{build.name}</h3>
              <span className="text-xs text-[var(--color-accent)] hover:underline flex-shrink-0">View Details →</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 font-bold ${build.type === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {build.type === 'team' ? 'TEAM' : 'SINGLE'}
              </span>
              {build.tags.map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)] shrink-0">
            <span className="flex items-center gap-1"><Heart size={10} className="text-red-400" /> {build.likes}</span>
            <span className="flex items-center gap-1"><Eye size={10} /> {build.views}</span>
          </div>
        </div>

        {/* Character gear summary */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[var(--color-text-tertiary)]">
          {build.characters.map((bc, i) => {
            const elem = getCharElement(bc.name);
            return (
              <span key={i} className="flex items-center gap-1">
                {elem && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[elem] }} />}
                <span className="text-white">{bc.name}</span>
                {bc.weapon && <span> + {bc.weapon}</span>}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
