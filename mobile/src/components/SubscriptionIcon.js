import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

const BG_COLORS = [
  '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444',
  '#f59e0b', '#06b6d4', '#ec4899', '#f97316',
];

function getBg(name) {
  if (!name) return BG_COLORS[0];
  return BG_COLORS[name.charCodeAt(0) % BG_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getDomain(url) {
  try { return url ? new URL(url).hostname : null; } catch { return null; }
}

export default function SubscriptionIcon({ subscription, size = 32 }) {
  const { logoUrl, name, url } = subscription;
  const [srcIndex, setSrcIndex] = useState(0);

  const domain = getDomain(url);
  const sources = [
    logoUrl,
    domain ? `https://logo.clearbit.com/${domain}` : null,
    domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
  ].filter(Boolean);

  useEffect(() => {
    setSrcIndex(0);
  }, [logoUrl, url]);

  const radius = size * 0.2;
  const currentSrc = sources[srcIndex];

  if (currentSrc) {
    return (
      <Image
        source={{ uri: currentSrc }}
        style={{ width: size, height: size, borderRadius: radius }}
        onError={() => setSrcIndex((i) => i + 1)}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: getBg(name),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
