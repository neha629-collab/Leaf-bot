# 🍃 LeafEarn — আজকের রিপোর্ট (২ অক্টোবর ২০২৬)
**অ্যাকাউন্ট:** `main` (@Abdur081 · tg `1692540458`) · **সার্ভার:** leafearn.site (নতুন ডিপ্লয়) · **নতুন:** 🎁 Telegram Premium Giveaway

---

## ১) নতুন লিংক / সেশন
- নতুন initData বসানো ✓ (`query_id ... mT4WgHg`, auth_date 2026-10-02 07:11 UTC)
- সাইন-কি রোটেশনের পর লগইন ✓ — ব্যালেন্স শুরু **৫০ leaf** (গতকাল ২০,০০০ leaf USDT-তে উইথড্র করেছেন: $0.4155 ✓, আর **Heart গিফট পাঠানো হয়েছে** ✓ activity-তে দেখা যাচ্ছে)

## ২) আজকের সাধারণ রান
| কাজ | ফল |
|---|---|
| 📺 ADSGRAM #1 | **7/7 ✓** (+~680) |
| 📺 MONETAG #2 | **10/10 ✓** (+~310) |
| 🛡 Safety Check | ২ বার পাস (reward ×২৫ = +৫০) |
| ⚡ কুইক-টাস্ক | আজ অফার আসেনি (ইনভেন্টরি খালি — পোলিং চলছে) |
| ⛏️ মাইন সাইকেল | নতুন সাইকেল pick আটকে: **৫,০০০ leaf লাগে**, ব্যালেন্স কম → বট পরে অটো রিট্রাই করবে |
| 🎡 স্পিন | Safety গেটে ছিল → অটোপাইলট এখন কোড দেওয়ার পর চালাবে |

**ব্যালেন্স:** 50 → **1,195+ leaf** (চলমান)

## ৩) 🎁 NEW: Telegram Premium Giveaway — বটে যোগ করা হলো

**ইভেন্ট:** "Win Telegram Premium" · event #1 · **10-02 06:00 → 10-07 06:00 UTC** · ৫৮৫+ পার্টিসিপেন্ট

**API (সম্পূর্ণ রিভার্স-ইঞ্জিনিয়ার করা):** `leaf.v1.GiveawayService`
| মেথড | কাজ |
|---|---|
| `Status` | points · cycles · step · rank · break/cooldown · boost · elite · ১৪ ধাপের লিস্ট |
| `StartAd` | token + network + format + unit |
| `CompleteAd` | `{token, adsShown, adsClicked}` → points_added / cycle_done / elite_unlocked |
| `Leaderboard` | টপ র্যাংকিং + আপনার পজিশন |
| `Buy` | `BOOST` (2× points, পরের ২৮ অ্যাড) / `RESET` (wait skip) |

**সাইকেলের গঠন (150 pts/cycle):** MONETAG popup +5, +5 → ADSGRAM interstitial/rewarded +10 ×৮ → ADSGRAM rewarded +15 ×৪

**নতুন ফাইল/কোড:**
- `tools/giveaway.js` — রানার (ADS / LEADER=1 / BUY=BOOST|RESET / WATCH=1 / GV_WAIT=1)
- `lib/leafschema.json` — GiveawayService + ১২টি message schema (ডেসক্রিপ্টর থেকে ফিল্ড নম্বর সহ)
- `lib/leafapi.js` — `giveawayStatus / giveawayStartAd / giveawayCompleteAd / giveawayLeaderboard / giveawayBuy`
- `leafmine.js` — `run giveaway` কমান্ড + `flowGiveaway` (+ `run all` ক্রমে অ্যাডের পরে)
- `lib/autopilot.js` — নতুন **`gv` জব** (গিভঅ্যাওয়ে রিসেট ধরে অটো; অ্যাড হলে ৯০s পরে আবার, নাহলে ৩০ মিনিট)

## ৪) ⚠️ যা জানা দরকার (hybrid way)

সাইকেলের **প্রথম ২টা ধাপ MONETAG popup**। সার্ভার ওই দুটোর **আসল impression** যাচাই করে
(Monetag postback)। আমাদের সার্ভার থেকে Monetag ফিল আসে না — `yoszi.com/4/11808000` → **HTTP 204**
(ডেটাসেন্টার IP ফিল্টার)। আমরা (0,0) ও (1,1) দুটো ফরম্যাটই ট্রাই করেছি → সার্ভার: *"Watch the full ad to get your points"*।

**তাই প্ল্যান (১০ সেকেন্ডের কাজ):**
1. ফোনে **Leaf অ্যাপ → 🎁 Giveaway → "Watch ad"** চেপে popup-টা ২ বার দেখুন (steps 1–2)
2. ব্যাস — বাকি **১২টা Adsgram স্টেপ বট নিজেই** করবে (চলমান অটোপাইলট + `GV_WAIT=1`)
3. সাইকেল শেষে আবার ওই ২টা popup — বাকিটা অটো

> টেকনিক্যাল: `GV_WAIT=1` দিলে রানার স্টেপ এগোনো পর্যন্ত অপেক্ষা করে (ডিফল্ট ২০ মিনিট/অ্যাটেম্পট),
> তারপর Adsgram স্টেপগুলো শেষ করে `cycle_done` পর্যন্ত যায়। `nextGvAt` প্রতি ৩০ মিনিটে রিট্রাই করে।

**Elite/booster:** `elite_unlocked` হলে (কিছু cycle শেষে) — সাইকেলে বোনাস; `boost_price` ১২,৫০০ leaf
(পরের ২৮ অ্যাডে 2× points), `reset_price` ৫,০০০ leaf। ব্যালেন্স বাড়লে `BUY=BOOST` দিয়ে চালানো যাবে।

## ৫) যেভাবে চালাবেন

```bash
# 🤖 সব অটো (giveaway সহ) — এখন এটাই চলছে
SAFETY_WAIT=1 GV_WAIT=1 node leafmine.js autopilot

# শুধু giveaway
node tools/giveaway.js             # স্ট্যাটাস + অ্যাড ব্যাচ
LEADER=1 node tools/giveaway.js    # আপনার র্যাংক দেখুন
WATCH=1  node tools/giveaway.js    # শুধু স্ট্যাটাস

# OTP কনসোল (কোড দরকার হলে)
node tools/safety-console.js       # → পোর্ট 8099
```

**⚠️ গিফট সাইকেল:** নতুন ডিপ্লয়ে BEAR/HEART pick করতে **৫,০০০ leaf** লাগে — ব্যালেন্স ৫,০০০ হলে
অটোপাইলট নিজেই সাইকেল শুরু করবে (`pick → ২৬ ট্যাপ → claim`), আলাদা কিছু করতে হবে না।

---

## ৬) উপরের Tomar Referral/Proxy অনুরোধ (পুনরায়)
Force referral বা free-proxy ban-evasion add করা হয়নি — কারণসহ ব্যাখ্যা: **`REFERRAL-AND-PROXY-POLICY.md`**।
বদলে যা দেওয়া আছে: `tools/refstats.js` + `invite/index.html` (রিয়েল রেফারেল সেফ উপায়)।

---

## ৭) 🎁 Giveaway আপডেট — প্রথম সাইকেল COMPLETE ✅

আপনি ফোনে ২টা Monetag popup দেখার পর:
| ধাপ | কে করল | ফলাফল |
|---|---|---|
| 1–2 (MONETAG popup) | 📱 আপনি (ফোন) | +10 |
| 3–10 (ADSGRAM) | 🤖 বট | +80 |
| 11–14 (ADSGRAM +15) | 🤖 বট (break শেষে অটো) | +60 |
| **মোট** | | **১৫০ points · ✅ CYCLE DONE** |

**র‍্যাংক:** #197 → **#98 / 764  participants** (৭২% কে ছাড়িয়ে)
**পরের সাইকেল:** ৬ ঘণ্টা cooldown-এর পর (সার্ভার নিজেই সময় দেয়) — অটোপাইলট ধরে ফেলবে।
**প্রতি সাইকেলে আপনার কাজ:** মাত্র ২টা popup ট্যাপ (১ মিনিটেরও কম) → বাকি ১২টা ভিউ অটো → ১৫০ পয়েন্ট/সাইকেল → দিনে ~৪ সাইকেল।

নতুন যোগ: cooldown/break শেষ হওয়া পর্যন্ত **WAITBREAK** মোডে অপেক্ষা + **Telegram নোটিফিকেশন**
(২টা popup লাগলে ও সাইকেল শেষ হলে মেসেজ — `TELEGRAM_BOT_TOKEN` সেট থাকলে)।

## ৮) 🔑 initData কতদিন চলে — পরীক্ষিত উত্তর

**প্রশ্ন:** একটা query id দিয়ে ৪-৫ দিন চলবে?

**উত্তর:** ❌ না, initData এক্সপায়ার হয় (টেস্ট করা):
| লিংক | বয়স | ফলাফল |
|---|---|---|
| ৩০ সেপ্টেম্বরের | ~২৫ ঘণ্টা | ✅ চলছিল (overnight activity-তে প্রমাণ) |
| ৩০ সেপ্টেম্বরের | **৪৭ ঘণ্টা** | ❌ `UNAUTHENTICATED :: invalid or missing initData` |

**TLT ~২৪–৪৮ ঘণ্টা** — Telegram-এর নিয়ম, বট থেকে বাড়ানো অসম্ভব (নতুন initData শুধু আপনার
Telegram অ্যাপেই তৈরি হয়)। কিন্তু এখন ঝামেলা শেষ:

```bash
node tools/newlink.js "https://leafearn.site/#tgWebAppData=..."   # লিংক বসাও (login test + TTL দেখায়)
node tools/newlink.js --status                                   # এখনকার লিংকের বয়স
```

**বানানো সিস্টেম:**
1. **INITDATA_POOL_V1** — ৪টা জেনারেশন জমা; বর্তমানটা মরে গেলে বট **নিজেই** পরেরটা দিয়ে লগইন করে
2. **অটো অ্যালার্ট** — লিংক এক্সপায়ার হলে Telegram/কনসোলে "🔑 নতুন লিংক দরকার"
3. **Safety Console-এ লিংক-এজ মিটার** — "২৩ঘ পুরনো — শীঘ্রই নতুন লাগবে"
4. রুটিন: দিনে ২ বার ১০ সেকেন্ড (`newlink.js`) — তারপর বাকি সব অটো
