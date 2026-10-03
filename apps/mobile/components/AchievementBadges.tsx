import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Trophy,
  Camera,
  Layers,
  Eye,
  Microscope,
  Calendar,
  Flame,
  Crown,
  ClipboardCheck,
  Heart,
  Star,
  Droplets,
  TrendingUp,
  Sparkles,
  Shield,
  UserCheck,
  Barcode,
  Users,
  Lock,
  Zap,
} from "lucide-react-native";
import type { AchievementProgress, UserAchievement, AchievementCategory } from "@skinsense/types";

interface AchievementBadgesProps {
  progress: AchievementProgress | null;
  onMarkSeen?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Camera, Layers, Eye, Microscope, Calendar, Flame, Crown,
  ClipboardCheck, Heart, Star, Droplets, TrendingUp, Sparkles,
  Shield, UserCheck, Barcode, Users,
};

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  scanning: "#60A5FA",
  routine: "#F97316",
  lifestyle: "#34D399",
  improvement: "#FBBF24",
  social: "#818CF8",
  milestones: "#F472B6",
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  scanning: "Scanning",
  routine: "Routine",
  lifestyle: "Lifestyle",
  improvement: "Improvement",
  social: "Social",
  milestones: "Milestones",
};

function AchievementBadge({ achievement }: { achievement: UserAchievement }) {
  const Icon = ICON_MAP[achievement.icon] || Star;
  const color = CATEGORY_COLORS[achievement.category] || "#9CA3AF";
  const isUnlocked = achievement.progress >= 1;
  const progressPct = Math.round(achievement.progress * 100);

  return (
    <View style={[
      styles.badge,
      isUnlocked && styles.badgeUnlocked,
      achievement.isNew && styles.badgeNew,
    ]}>
      {/* Glow effect for newly unlocked */}
      {achievement.isNew && (
        <View style={[styles.glowRing, { borderColor: color }]} />
      )}

      <View style={[
        styles.badgeIconWrap,
        { backgroundColor: isUnlocked ? `${color}20` : "#1F293740" },
      ]}>
        <Icon
          size={22}
          color={isUnlocked ? color : "#4B5563"}
        />
      </View>

      <Text style={[
        styles.badgeName,
        !isUnlocked && styles.badgeNameLocked,
      ]} numberOfLines={1}>
        {achievement.name}
      </Text>

      {!isUnlocked ? (
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressText}>{progressPct}%</Text>
        </View>
      ) : (
        <Text style={[styles.badgeDate, { color }]}>
          {achievement.isNew ? "✨ NEW!" : "Unlocked"}
        </Text>
      )}
    </View>
  );
}

function XPBar({ totalXp, level, xpToNextLevel }: { totalXp: number; level: number; xpToNextLevel: number }) {
  const xpInLevel = 250 - xpToNextLevel;
  const pct = Math.round((xpInLevel / 250) * 100);

  return (
    <View style={styles.xpBar}>
      <View style={styles.xpHeader}>
        <View style={styles.levelBadge}>
          <Zap size={14} color="#FBBF24" />
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
        <Text style={styles.xpText}>{totalXp} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.xpSub}>{xpToNextLevel} XP to Level {level + 1}</Text>
    </View>
  );
}

export function AchievementBadges({ progress, onMarkSeen }: AchievementBadgesProps) {
  if (!progress) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Trophy size={20} color="#FBBF24" />
          <Text style={styles.title}>Achievements</Text>
        </View>
        <Text style={styles.emptyText}>
          Start scanning and logging to earn badges
        </Text>
      </View>
    );
  }

  // Group achievements by category
  const categories = [...new Set(progress.achievements.map((a) => a.category))] as AchievementCategory[];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.trophyWrap}>
            <Trophy size={18} color="#FBBF24" />
          </View>
          <View>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>
              {progress.unlockedCount} / {progress.totalCount} unlocked
            </Text>
          </View>
        </View>

        {progress.recentUnlocks.length > 0 && onMarkSeen && (
          <TouchableOpacity onPress={onMarkSeen} style={styles.markSeenBtn}>
            <Text style={styles.markSeenText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* XP Bar */}
      <XPBar
        totalXp={progress.totalXp}
        level={progress.level}
        xpToNextLevel={progress.xpToNextLevel}
      />

      {/* New Unlocks */}
      {progress.recentUnlocks.length > 0 && (
        <View style={styles.newSection}>
          <Text style={styles.newSectionTitle}>🎉 Newly Unlocked</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgeRow}>
              {progress.recentUnlocks.map((a) => (
                <AchievementBadge key={a.achievementId} achievement={a} />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* All Categories */}
      {categories.map((cat) => {
        const catAchievements = progress.achievements.filter((a) => a.category === cat);
        const unlockedCount = catAchievements.filter((a) => a.progress >= 1).length;

        return (
          <View key={cat} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
              <Text style={styles.categoryName}>{CATEGORY_LABELS[cat]}</Text>
              <Text style={styles.categoryCount}>
                {unlockedCount}/{catAchievements.length}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgeRow}>
                {catAchievements.map((a) => (
                  <AchievementBadge key={a.achievementId} achievement={a} />
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trophyWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  markSeenBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  markSeenText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  xpBar: {
    gap: 6,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FBBF24",
  },
  xpText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  xpTrack: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#FBBF24",
    borderRadius: 3,
  },
  xpSub: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "right",
  },
  newSection: {
    gap: 10,
  },
  newSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  categorySection: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D1D5DB",
    flex: 1,
  },
  categoryCount: {
    fontSize: 11,
    color: "#6B7280",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 12,
  },
  badge: {
    width: 100,
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#374151",
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },
  badgeUnlocked: {
    borderColor: "#4B5563",
  },
  badgeNew: {
    borderColor: "#FBBF24",
  },
  glowRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.4,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F9FAFB",
    textAlign: "center",
  },
  badgeNameLocked: {
    color: "#6B7280",
  },
  progressBarWrap: {
    width: "100%",
    gap: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
  badgeDate: {
    fontSize: 10,
    fontWeight: "600",
  },
});
