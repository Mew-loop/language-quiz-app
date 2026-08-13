const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaFlDv6NHyQBZS1B5r8yu_0qwxU74cPNvm4YpVaLenCXleOQIDcQelXCDYVlb9wuVQ/exec';

export interface SheetUser {
  userId: number | string;
  username: string;
  xp: number;
  strikes: number;
}

export interface RawSheetRow {
  translations: Record<number, string>; // 0: Persian, 1: English, 2: Japanese, 3: Chinese, 4: German, 5: Hindi, 6: Spanish, 7: Arabic, 8: Russian
}

/**
 * Safely parse JSON or return null if HTML error/redirect response received
 */
function safeParseJSON(text: string): any {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
  } catch (e) {
    console.warn('Failed to parse JSON response:', e);
  }
  return null;
}

/**
 * Fetch live user info from Google Sheets
 */
export async function fetchSheetUser(userId: number | string): Promise<SheetUser | null> {
  try {
    const url = `${SCRIPT_URL}?action=getUser&userId=${encodeURIComponent(String(userId))}`;
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    const json = safeParseJSON(text);

    if (json && json.status === 'success' && json.data) {
      return {
        userId: json.data.userId || userId,
        username: json.data.username || '',
        xp: typeof json.data.xp === 'number' ? json.data.xp : 0,
        strikes: typeof json.data.strikes === 'number' ? json.data.strikes : 0
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching sheet user:', err);
    return null;
  }
}

/**
 * Update score live in Google Sheets (+10 for correct, -50 for incorrect)
 * Uses text/plain Content-Type to avoid CORS preflight, with GET fallback if POST fails
 */
export async function updateSheetScore(
  userId: number | string,
  newXP: number,
  username?: string,
  strikes?: number
): Promise<SheetUser | null> {
  const safeXP = Math.max(0, newXP);
  const cleanUsername = username || '';
  const cleanStrikes = strikes ?? 0;

  // Try POST with text/plain header to bypass CORS preflight
  try {
    const bodyPayload = {
      action: 'updateScore',
      userId: String(userId),
      xp: safeXP,
      username: cleanUsername,
      strikes: cleanStrikes
    };

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(bodyPayload),
      redirect: 'follow'
    });

    const text = await res.text();
    const json = safeParseJSON(text);

    if (json && json.status === 'success' && json.data) {
      return {
        userId: json.data.userId,
        username: json.data.username || cleanUsername,
        xp: typeof json.data.xp === 'number' ? json.data.xp : safeXP,
        strikes: typeof json.data.strikes === 'number' ? json.data.strikes : 0
      };
    }
  } catch (err) {
    console.warn('POST updateScore failed, attempting GET fallback:', err);
  }

  // Fallback to GET request if POST was blocked
  try {
    const getUrl = `${SCRIPT_URL}?action=updateScore&userId=${encodeURIComponent(String(userId))}&xp=${safeXP}&username=${encodeURIComponent(cleanUsername)}&strikes=${cleanStrikes}`;
    const res = await fetch(getUrl, { redirect: 'follow' });
    const text = await res.text();
    const json = safeParseJSON(text);

    if (json && json.status === 'success' && json.data) {
      return {
        userId: json.data.userId,
        username: json.data.username || cleanUsername,
        xp: typeof json.data.xp === 'number' ? json.data.xp : safeXP,
        strikes: typeof json.data.strikes === 'number' ? json.data.strikes : 0
      };
    }
  } catch (err) {
    console.error('GET updateScore fallback also failed:', err);
  }

  return null;
}

/**
 * Fetch live Leaderboard from Google Sheets Users tab
 */
export async function fetchSheetLeaderboard(): Promise<SheetUser[]> {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getLeaderboard`, {
      redirect: 'follow'
    });
    const text = await res.text();
    const json = safeParseJSON(text);

    if (json && json.status === 'success' && Array.isArray(json.data)) {
      return json.data.map((u: any) => ({
        userId: u.userId,
        username: u.username || `User_${u.userId}`,
        xp: typeof u.xp === 'number' ? u.xp : 0,
        strikes: typeof u.strikes === 'number' ? u.strikes : 0
      })).sort((a: SheetUser, b: SheetUser) => b.xp - a.xp);
    }
    return [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

/**
 * Fetch live words/sentences array for a specific level (1-5) and mode ("word" | "sentence")
 */
export async function fetchSheetWords(
  mode: 'word' | 'sentence',
  level: number = 1
): Promise<RawSheetRow[]> {
  try {
    const safeLevel = Math.min(5, Math.max(1, level));
    const modeParam = mode === 'sentence' ? 'sentence' : 'word';
    const res = await fetch(`${SCRIPT_URL}?action=getWords&mode=${modeParam}&level=${safeLevel}`, {
      redirect: 'follow'
    });
    const text = await res.text();
    const rows = safeParseJSON(text);

    if (Array.isArray(rows)) {
      return rows.map((row: string[]) => {
        const translations: Record<number, string> = {};
        for (let colIdx = 0; colIdx < 9; colIdx++) {
          translations[colIdx] = row[colIdx] ? String(row[colIdx]).trim() : '';
        }
        return { translations };
      });
    }
    return [];
  } catch (err) {
    console.warn(`Notice: Could not fetch sheet words mode=${mode} level=${level}:`, err);
    return [];
  }
}

