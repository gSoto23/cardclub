"use client";

import React, { useEffect, useState } from "react";

interface RankingUser {
  user_id: number;
  email: string;
  nickname?: string;
  avatar_url?: string;
  total_points: number;
}

interface Championship {
  id: number;
  name: string;
  is_active: boolean;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChamp, setSelectedChamp] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChampionships();
  }, []);

  const fetchChampionships = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/championships`);
      if (res.ok) {
        const data = await res.json();
        setChampionships(data);
        const active = data.find((c: Championship) => c.is_active);
        if (active) {
          setSelectedChamp(active.id);
          fetchRanking(active.id);
        } else if (data.length > 0) {
          setSelectedChamp(data[0].id);
          fetchRanking(data[0].id);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchRanking = async (champId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ranking?championship_id=${champId}`);
      if (res.ok) {
        setRanking(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChampChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedChamp(id);
    fetchRanking(id);
  };

  const getRanksList = (users: RankingUser[]) => {
    const list: number[] = [];
    let currentRank = 1;
    for (let i = 0; i < users.length; i++) {
      if (i > 0 && users[i].total_points < users[i - 1].total_points) {
        currentRank = i + 1;
      }
      list.push(currentRank);
    }
    return list;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getPositionLabel = (rank: number) => {
    if (rank === 1) return "1er Lugar";
    if (rank === 2) return "2do Lugar";
    if (rank === 3) return "3er Lugar";
    return `#${rank}`;
  };

  const getCardStyle = (rank: number) => {
    if (rank === 1) {
      return {
        card: "relative w-56 bg-gradient-to-b from-yellow-600/30 via-black to-black border-2 border-yellow-500 rounded-2xl p-6 text-center shadow-[0_10px_50px_rgba(255,222,0,0.3)] flex flex-col items-center pt-14 overflow-visible",
        title: "text-white font-black truncate w-full mt-2 text-2xl tracking-wide relative z-10",
        subtitle: "text-yellow-400 font-bold text-sm mb-4 relative z-10",
        pointsBg: "bg-yellow-950/80 w-full rounded-lg py-3 border border-yellow-600 relative z-10",
        pointsText: "text-yellow-400 font-black text-3xl",
        pointsLabel: "text-white/60 text-[10px] uppercase font-bold tracking-widest",
        emojiClass: "text-6xl mb-4 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] z-10"
      };
    }
    if (rank === 2) {
      return {
        card: "relative w-48 bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-500 rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(203,213,225,0.15)] flex flex-col items-center pt-12 overflow-visible",
        title: "text-white font-black truncate w-full mt-2 text-lg tracking-wide",
        subtitle: "text-slate-300 font-bold text-sm mb-4",
        pointsBg: "bg-slate-800/80 w-full rounded-lg py-2 border border-slate-600",
        pointsText: "text-brand-yellow font-black text-2xl",
        pointsLabel: "text-white/40 text-[10px] uppercase font-bold tracking-widest",
        emojiClass: "text-4xl mb-4 text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.6)] z-10"
      };
    }
    // Rank 3 or fallback
    return {
      card: "relative w-48 bg-gradient-to-b from-amber-800/80 to-amber-950 border border-amber-700/50 rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(217,119,6,0.15)] flex flex-col items-center pt-10 overflow-visible",
      title: "text-white font-black truncate w-full mt-2 text-lg tracking-wide",
      subtitle: "text-amber-500 font-bold text-sm mb-4",
      pointsBg: "bg-black/40 w-full rounded-lg py-2 border border-amber-900",
      pointsText: "text-brand-yellow font-black text-2xl",
      pointsLabel: "text-white/40 text-[10px] uppercase font-bold tracking-widest",
      emojiClass: "text-3xl mb-4 text-amber-600 drop-shadow-[0_0_15px_rgba(217,119,6,0.6)] z-10"
    };
  };

  const renderAvatar = (user: RankingUser, size: "sm" | "lg" = "sm", rank?: number) => {
    const isLg = size === "lg";
    
    let borderClass = "border-white/20";
    let glowClass = "shadow-lg";
    if (isLg && rank !== undefined) {
      if (rank === 1) { borderClass = "border-yellow-400"; glowClass = "shadow-[0_0_30px_rgba(250,204,21,0.6)]"; }
      if (rank === 2) { borderClass = "border-slate-300"; glowClass = "shadow-[0_0_20px_rgba(203,213,225,0.4)]"; }
      if (rank === 3) { borderClass = "border-amber-600"; glowClass = "shadow-[0_0_20px_rgba(217,119,6,0.4)]"; }
    }

    const sizeClasses = isLg ? "w-24 h-24 md:w-32 md:h-32 text-3xl md:text-5xl" : "w-10 h-10 text-sm";
    
    if (user.avatar_url) {
      const url = user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`;
      return (
        <img 
          src={url} 
          alt={user.nickname || "Avatar"} 
          className={`${sizeClasses} rounded-full object-cover border-4 ${borderClass} ${glowClass} relative z-20 transition-transform hover:scale-110`} 
        />
      );
    }
    
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center font-black ${glowClass} border-4 ${borderClass} relative z-20 transition-transform hover:scale-110 ${isLg ? 'bg-gradient-to-br from-brand-yellow to-orange-500 text-black' : 'bg-white/10 text-white'}`}>
        {user.nickname ? user.nickname.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  if (loading && championships.length === 0) return <div className="min-h-[70vh] flex items-center justify-center text-white">Cargando leaderboard...</div>;

  const currentChampName = championships.find(c => c.id === selectedChamp)?.name || "Global";
  const ranksList = getRanksList(ranking);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      {/* Cabecera */}
      <div className="mb-12 text-center flex flex-col items-center">
        
        {/* Selector de Campeonato */}
        {championships.length > 0 && (
          <div className="mb-6 relative z-20">
            <select 
              value={selectedChamp} 
              onChange={handleChampChange}
              className="appearance-none bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow font-black uppercase tracking-widest text-xs px-8 py-2 rounded-full cursor-pointer hover:bg-brand-yellow/20 transition-colors text-center focus:outline-none"
            >
              {championships.map(c => (
                <option key={c.id} value={c.id} className="bg-brand-blue text-white">{c.name} {c.is_active ? '(Actual)' : ''}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-2 text-brand-yellow">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          Ranking <span className="text-brand-yellow">Card Club</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Líderes actuales en {currentChampName}.
        </p>
      </div>

      {loading && championships.length > 0 ? (
        <div className="text-center text-white/40 italic py-12">Actualizando puntos...</div>
      ) : ranking.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-white/60 font-medium">Aún no hay puntos registrados en esta temporada.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {/* Top 3 Podium (Cards Style) */}
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-20 md:gap-8 mb-16 px-4 mt-16">
            
            {/* 2nd Place Card (Index 1) */}
            {ranking.length > 1 && (() => {
              const rank = ranksList[1];
              const styles = getCardStyle(rank);
              return (
                <div className="order-2 md:order-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 transform hover:-translate-y-2 transition-transform">
                  <span className={styles.emojiClass}>{getRankEmoji(rank)}</span>
                  <div className={styles.card}>
                    <div className="absolute -top-16 md:-top-20">
                      {renderAvatar(ranking[1], "lg", rank)}
                    </div>
                    <p className={styles.title}>{ranking[1].nickname || ranking[1].email.split('@')[0]}</p>
                    <p className={styles.subtitle}>{getPositionLabel(rank)}</p>
                    <div className={styles.pointsBg}>
                      <p className={styles.pointsText}>{ranking[1].total_points}</p>
                      <p className={styles.pointsLabel}>Puntos</p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* 1st Place Card (Index 0) */}
            {ranking.length > 0 && (() => {
              const rank = ranksList[0];
              const styles = getCardStyle(rank);
              return (
                <div className="order-1 md:order-2 flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-700 z-20 transform hover:-translate-y-2 transition-transform">
                  <span className={styles.emojiClass}>{getRankEmoji(rank)}</span>
                  <div className={styles.card}>
                    {rank === 1 && (
                      <div className="absolute inset-0 rounded-2xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                    )}
                    <div className="absolute -top-16 md:-top-20">
                      {renderAvatar(ranking[0], "lg", rank)}
                    </div>
                    <p className={styles.title}>{ranking[0].nickname || ranking[0].email.split('@')[0]}</p>
                    <p className={styles.subtitle}>{getPositionLabel(rank)}</p>
                    <div className={styles.pointsBg}>
                      <p className={styles.pointsText}>{ranking[0].total_points}</p>
                      <p className={styles.pointsLabel}>Puntos</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3rd Place Card (Index 2) */}
            {ranking.length > 2 && (() => {
              const rank = ranksList[2];
              const styles = getCardStyle(rank);
              return (
                <div className="order-3 md:order-3 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 transform hover:-translate-y-2 transition-transform">
                  <span className={styles.emojiClass}>{getRankEmoji(rank)}</span>
                  <div className={styles.card}>
                    <div className="absolute -top-16 md:-top-20">
                      {renderAvatar(ranking[2], "lg", rank)}
                    </div>
                    <p className={styles.title}>{ranking[2].nickname || ranking[2].email.split('@')[0]}</p>
                    <p className={styles.subtitle}>{getPositionLabel(rank)}</p>
                    <div className={styles.pointsBg}>
                      <p className={styles.pointsText}>{ranking[2].total_points}</p>
                      <p className={styles.pointsLabel}>Puntos</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Leaderboard Table */}
          {ranking.length > 3 && (
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-white/40 w-16 text-center">Pos</th>
                      <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-white/40">Jugador</th>
                      <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-white/40 text-right">Puntos Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ranking.slice(3).map((user, index) => {
                      const actualPos = index + 3; // 0-based slice, +3 for 4th pos
                      return (
                        <tr 
                          key={user.user_id} 
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="font-black text-lg text-white/40">
                              #{ranksList[actualPos]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              {renderAvatar(user, "sm")}
                              <div>
                                <p className="text-white font-bold">{user.nickname || "Jugador"}</p>
                                <p className="text-white/40 text-xs">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-mono text-xl font-black text-brand-yellow">
                              {user.total_points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
