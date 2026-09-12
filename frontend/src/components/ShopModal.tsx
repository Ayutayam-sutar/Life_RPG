import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Coins,
  Sword,
  BookOpen,
  Sparkles,
  Crown,
  Flame,
  Cpu,
  Coffee,
  Check,
  ShoppingBag,
  Sparkle,
  Shield,
  Palette,
} from 'lucide-react';
import { ShopItem, UserCharacter } from '../types';
import { api } from '../api/client';
import { playCoinSound, playClickSound } from '../utils/sound';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: UserCharacter;
  onCharacterUpdate: (updated: UserCharacter) => void;
}

type ShopTab = 'all' | 'badge' | 'theme' | 'title' | 'relic';

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  character,
  onCharacterUpdate,
}) => {
  const [catalog, setCatalog] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>('all');

  useEffect(() => {
    if (isOpen) {
      void loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const items = await api.getShopCatalog();
      setCatalog(items);
    } catch (err: unknown) {
      console.error('Failed to load shop catalog:', err);
      setErrorMsg('Could not load the rewards right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isItemOwned = (itemId: string) =>
    Boolean(character.inventory?.some((item) => item.id === itemId));

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'badge') return character.equippedBadgeId === item.id;
    if (item.category === 'theme') return character.activeTheme === item.id;
    if (item.category === 'title') {
      return character.equippedTitle === item.name.replace('Title: ', '');
    }
    return false;
  };

  const handleBuy = async (item: ShopItem) => {
    try {
      setErrorMsg(null);
      setPurchasingId(item.id);
      playClickSound();

      const result = await api.purchaseItem(item.id);

      playCoinSound();
      onCharacterUpdate(result.character);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setErrorMsg(message);
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEquip = async (item: ShopItem) => {
    try {
      setErrorMsg(null);
      setEquippingId(item.id);
      playClickSound();

      const updated = await api.equipItem(item.id);
      onCharacterUpdate(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not equip this reward';
      setErrorMsg(message);
    } finally {
      setEquippingId(null);
    }
  };

  const getItemIcon = (iconName: string) => {
    const common = 'w-5 h-5';
    switch (iconName) {
      case 'Sword':
        return <Sword className={`${common} text-fuchsia-500`} />;
      case 'BookOpen':
        return <BookOpen className={`${common} text-violet-500`} />;
      case 'Sparkles':
        return <Sparkles className={`${common} text-pink-500`} />;
      case 'Crown':
        return <Crown className={`${common} text-cyan-500`} />;
      case 'Flame':
        return <Flame className={`${common} text-fuchsia-500`} />;
      case 'Cpu':
        return <Cpu className={`${common} text-cyan-500`} />;
      case 'Coffee':
        return <Coffee className={`${common} text-violet-500`} />;
      case 'Shield':
        return <Shield className={`${common} text-cyan-500`} />;
      case 'Palette':
        return <Palette className={`${common} text-pink-500`} />;
      default:
        return <Sparkle className={`${common} text-violet-500`} />;
    }
  };

  const getRarityBadge = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'Common':
        return 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800';
      case 'Rare':
        return 'text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40';
      case 'Epic':
        return 'text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40';
      case 'Legendary':
        return 'text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50 dark:bg-fuchsia-950/40';
      default:
        return '';
    }
  };

  const filteredCatalog = useMemo(
    () =>
      catalog.filter((item) =>
        activeTab === 'all' ? true : item.category === activeTab
      ),
    [catalog, activeTab]
  );

  const tabs: { id: ShopTab; label: string }[] = [
    { id: 'all', label: 'All Rewards' },
    { id: 'badge', label: 'Badges' },
    { id: 'theme', label: 'Themes' },
    { id: 'title', label: 'Titles' },
    { id: 'relic', label: 'Relics' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-violet-200/70 dark:border-violet-900/60 bg-white/95 dark:bg-slate-950/95 shadow-2xl shadow-violet-950/20 relative flex flex-col"
        >
          {/* Header */}
          <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-fuchsia-50 via-violet-50 to-cyan-50 dark:from-fuchsia-950/25 dark:via-violet-950/25 dark:to-cyan-950/25">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-slate-950 dark:text-white">
                    Rewards Store
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Spend your hard-earned gold on rewards, titles, themes and relics.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800">
                  <Coins className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                  <span className="text-sm font-extrabold text-violet-700 dark:text-violet-200">
                    {character.gold} G
                  </span>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close rewards store"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-5 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    activeTab === tab.id
                      ? 'border-transparent bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="mx-5 sm:mx-7 mt-4 p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Items */}
          <div className="px-5 sm:px-7 py-5 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCatalog.length > 0 ? (
              <div className="space-y-3">
                {filteredCatalog.map((item) => {
                  const owned = isItemOwned(item.id);
                  const equipped = isItemEquipped(item);
                  const canAfford = character.gold >= item.cost;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`group p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        equipped
                          ? 'border-violet-400 dark:border-violet-700 bg-gradient-to-r from-fuchsia-50 via-violet-50 to-cyan-50 dark:from-fuchsia-950/20 dark:via-violet-950/20 dark:to-cyan-950/20'
                          : owned
                            ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-md hover:shadow-violet-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-100 via-violet-100 to-cyan-100 dark:from-fuchsia-950/50 dark:via-violet-950/50 dark:to-cyan-950/50 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
                          {getItemIcon(item.icon)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {item.name}
                            </h4>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getRarityBadge(item.rarity)}`}
                            >
                              {item.rarity}
                            </span>
                          </div>
                          <p className="text-xs leading-5 text-slate-600 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                          {item.statBoost && (
                            <div className="inline-flex mt-2 px-2 py-1 rounded-lg bg-violet-100/80 dark:bg-violet-950/40 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                              Perk: {item.statBoost}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0">
                        {owned ? (
                          equipped ? (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                              <Check className="w-3.5 h-3.5" />
                              Equipped
                            </div>
                          ) : (
                            <button
                              onClick={() => void handleEquip(item)}
                              disabled={equippingId === item.id}
                              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-extrabold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                            >
                              {equippingId === item.id ? 'Equipping...' : 'Equip'}
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => void handleBuy(item)}
                            disabled={!canAfford || purchasingId === item.id}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                              canAfford
                                ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 text-white hover:scale-[1.02] shadow-md shadow-violet-500/15 cursor-pointer'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            {purchasingId === item.id ? 'Buying...' : `${item.cost} G`}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-violet-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                  No rewards in this category
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Check another category or come back after completing more quests.
                </p>
              </div>
            )}
          </div>

          <div className="px-5 sm:px-7 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Complete quests to earn more gold.</span>
            <button
              onClick={onClose}
              className="font-bold text-violet-600 dark:text-violet-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 transition cursor-pointer"
            >
              Close Store
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
