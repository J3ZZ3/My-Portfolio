import { useCallback, useEffect, useState } from "react";
import {
  fetchLeaderboard,
  qualifiesForLeaderboard,
  submitLeaderboardScore,
  type GameId,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

export function useLeaderboard(gameId: GameId) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [cutoffScore, setCutoffScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qualifyScore, setQualifyScore] = useState<number | null>(null);
  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(gameId);
      setEntries(data.entries);
      setCutoffScore(data.cutoffScore);
      return data;
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkQualify = useCallback(
    async (finalScore: number) => {
      const data = await refresh();
      if (qualifiesForLeaderboard(finalScore, data.entries.length, data.cutoffScore)) {
        setQualifyScore(finalScore);
        setShowQualifyModal(true);
        setCongratsMessage(null);
      }
    },
    [refresh],
  );

  const submitName = useCallback(
    async (playerName: string) => {
      if (qualifyScore === null) return;
      setSubmitting(true);
      try {
        const result = await submitLeaderboardScore(gameId, playerName, qualifyScore);
        if (result.accepted) {
          setEntries(result.entries);
          setCongratsMessage(result.message);
          setShowQualifyModal(false);
          setQualifyScore(null);
          await refresh();
        }
        return result;
      } finally {
        setSubmitting(false);
      }
    },
    [gameId, qualifyScore, refresh],
  );

  const skipQualify = useCallback(() => {
    setShowQualifyModal(false);
    setQualifyScore(null);
    setCongratsMessage(null);
  }, []);

  const dismissCongrats = useCallback(() => {
    setCongratsMessage(null);
  }, []);

  return {
    entries,
    cutoffScore,
    loading,
    qualifyScore,
    showQualifyModal,
    congratsMessage,
    submitting,
    refresh,
    checkQualify,
    submitName,
    skipQualify,
    dismissCongrats,
  };
}
