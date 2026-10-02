# 🍃 LeafEarn Bot — ফাইনাল ডকুমেন্টেশন

সম্পূর্ণ অটোমেটেড LeafEarn মিনার: মাইন (TG Star গিফট), মিশন, **অ্যাড-ভিউ (ক্র্যাকড)**, **কুইক-টাস্ক (ক্র্যাকড)**, স্পিন, ৫টা গেম (সব স্লট), রিডিম কোড, **পূর্ণ অটোপাইলট**।

## 🔑 ২ অক্টোবর (দিন ৩) — initData কতদিন চলে? (পরীক্ষিত উত্তর) + নতুন টুল

**প্রশ্ন ছিল:** একটা লিংক দিয়ে কি ৪-৫ দিন মাইনিং চালানো যায়?

**পরীক্ষার ফল:** ❌ না। initData **মেয়াদোত্তীর্ণ হয়** —
| লিংক | বয়স | ফল |
|---|---|---|
| ৩০ সেপ্টেম্বরের | **~২৫ ঘণ্টা** | ✅ চলছিল (activity-তে প্রমাণ) |
| ৩০ সেপ্টেম্বরের | **৪৭ ঘণ্টা** | ❌ `UNAUTHENTICATED :: invalid or missing initData` |

মানে TTL **~২৪–৪৮ ঘণ্টা** (Telegram-এর auth_date নিয়ম + সার্ভার-সাইড)। এটা বট থেকে বাড়ানো
সম্ভব নয় — নতুন initData শুধু **আপনার Telegram**-এই তৈরি হয় (অ্যাপ খোলার সময়)। তাই বারবার
লিংক আনতে হয় — কিন্তু এখন মাত্র **এক কমান্ড**:

```bash
node tools/newlink.js "https://leafearn.site/#tgWebAppData=..."   # বসাও + লগইন টেস্ট + TTL দেখাও
node tools/newlink.js --status                                   # এখনকার লিংকের বয়স/স্ট্যাটাস
```

**যা যা যোগ হলো (ঝামেলা কমানোর জন্য):**
1. **INITDATA_POOL_V1** — অ্যাকাউন্টে পুরনো ৪টা জেনারেশন জমা থাকে; বর্তমানটা এক্সপায়ার হলে
   বট **নিজেই** পরেরটা দিয়ে লগইন চেষ্টা করে (সেটাও মৃত হলে তখনই নতুন লিংক লাগে)
2. **অটো অ্যালার্ট** — লিংক মরে গেলে কনসোল + Telegram-এ (TOKEN সেট থাকলে) "🔑 নতুন লিংক দরকার" মেসেজ
3. **Safety Console-এ লিংক-এজ কাউন্টার** — "🔑 লিংক: ২৩ঘ পুরনো — শীঘ্রই নতুন লাগবে"
4. **পুরনো লিংকেও সাইকেল চলবে** যতক্ষণ সার্ভার মানে (২৪ঘ পর্যন্ত প্রমাণিত)

> সবচেয়ে কম পরিশ্রম: দিনে **২ বার** (সকাল/রাত) Telegram-এ Leaf খুলে `node tools/newlink.js "<link>"` —
> ১০ সেকেন্ডের কাজ, তারপর বাকি ২৪ ঘণ্টা অটোপাইলট সব সামলায়।

---

## 🎁 ২ অক্টোবর ২০২৬ — নতুন ফিচার: Telegram Premium Giveaway (added)

Leaf নতুন **"Win Telegram Premium"** giveaway চালু করেছে (`leafearn.site/giveaway`, event #1: 10-02 → 10-07)।
বটে পুরো সাপোর্ট যোগ করা হলো (এখন অটোপাইলটের `gv` জব):

**সার্ভার ফ্লো:** `leaf.v1.GiveawayService` — `Status → StartAd → অ্যাড শো → CompleteAd`
→ `points_added` / `cycle_done` / `elite_unlocked` —— যত বেশি অ্যাড, তত বেশি **points/chance**।

**এক সাইকেল = ১৪টা অ্যাড = ১৫০ পয়েন্ট**
| ধাপ | নেটওয়ার্ক | পয়েন্ট |
|---|---|---|
| 1–2 | MONETAG / popup | +5, +5 |
| 3–10 | ADSGRAM / interstitial + rewarded | +10 ×৮ |
| 11–14 | ADSGRAM / rewarded | +15 ×৪ |

**বট কী করে:**
```bash
node tools/giveaway.js                 # স্ট্যাটাস + অ্যাড (ডিফল্ট ৩০)
ADS=60 node tools/giveaway.js          # ৬০টা পর্যন্ত
LEADER=1 node tools/giveaway.js        # লিডারবোর্ড (র্যাংক/পয়েন্ট, আপনি লোকালিতে)
BUY=BOOST node tools/giveaway.js       # ⚡ booster: পরের ২৮ অ্যাডে 2× points (১২,৫০০ leaf)
BUY=RESET node tools/giveaway.js       # wait skip (৫,০০০ leaf)
WATCH=1 node tools/giveaway.js         # শুধু স্ট্যাটাস
node leafmine.js run giveaway          # একবার অ্যাড-ব্যাচ
node leafmine.js autopilot             # 🤖 সব + giveaway অটো
```

**⚠️ ১টা সৎ সীমাবদ্ধতা (hybrid mode):** সাইকেলের প্রথম **২টা ধাপ MONETAG popup** — সার্ভার সেগুলোর
*আসল impression* (Monetag-এর postback) ভেরিফাই করে; আমাদের ডেটাসেন্টার/সার্ভারে Monetag ফিল দেয় না
(`yoszi.com/4/11808000` → 204), তাই ওই ২টা ধাপে **ফোন লাগে**। এর পরের **১২টা Adsgram ধাপ বট নিজেই** করে।
তাই: ফোনে Leaf → 🎁 Giveaway → Watch ad চেপে popup-টা ২-৩ সেকেন্ড দেখলেই বাকি সব অটো
(`GV_WAIT=1` রানার অপেক্ষা করে স্টেপ এগোলেই বাকিটা নিজে করে; অটোপাইলট প্রতি ~৩০ মিনিটে রিট্রাই করে)।

**নোট:** নতুন ডিপ্লয়ে গিফট-সাইকেল শুরু করতে **৫,০০০ leaf লাগে** (BEAR/HEART costLeaf=5000)।
ব্যালেন্স ৫,০০০-এর নিচে থাকলে `pick fail: not enough leaf` আসবে — বট নিজেই পরে চেষ্টা করবে (টাকা জমলে পাস)।

---

## 🆕 ২৯ সেপ্টেম্বর (দিন ২) — নতুন ডিপ্লয়ের ফিক্স + OTP টুলিং

| কী বদলেছে | বিস্তারিত | ফিক্স |
|---|---|---|
| **গিফট-টেবিল** | নতুন ডিপ্লয়ে **BEAR/HEART = ২৬ ট্যাপ (312 pts)**, GIFT = ২৭ (324), ROCKET = ৩৫; costLeaf BEAR/HEART 5,000 · GIFT 7,000 · ROCKET 15,000 | **GIFT_TABLE_V3** — `GIFTS` টেবিল আপডেট। পুরনো ২৫-ট্যাপ ধরে ক্লেইম করলে আসত `not fully mined yet` |
| **tone.wasm রোটেট** | `/fx/tone-ff085e1e.wasm` → `/fx/tone-27dbd522.wasm` | অটো-রিফ্রেশ — আপনার কিছু করার নেই |
| **বারবার OTP** | সার্ভারের Quick Safety Check | **🖥 Safety Console + SAFETY_WAIT + Telegram নোটিফাই** → পুরো ব্যাখ্যা `OTP-GUIDE.md` |

### 🧰 নতুন টুলস
```bash
node tools/safety-console.js        # 🛡 ওয়েব কনসোল: কোড টাইপ → বট সাথে সাথে resume (৫s অটো-রিফ্রেশ)
node tools/safety.js                # স্ট্যাটাস / কোড না থাকলে নতুন কোড চেয়ে পাঠায়
node tools/safety.js 4821           # কোড ভেরিফাই
KEEP=1 ROUNDS=200 node tools/quick.js   # শুধু কুইক-টাস্ক (অফার র‍্যান্ডম আসে, নিজে পোল করে তুলে নেয়)
node tools/tasks.js                 # সব মিশনের স্ট্যাটাস
node tools/prog.js                  # ব্যালেন্স + মাইন + গেম-স্লট + পেন্ডিং — এক নজরে
```

**রেকমেন্ডেড ডেইলি রুটিন (৩০ সেকেন্ড সেটআপ, তারপর সারাদিন অটো):**
```bash
node tools/safety.js                       # কোড লাগবে কি না দেখে নিন
SAFETY_WAIT=1 node leafmine.js autopilot   # 🤖 সারাদিনের সব কাজ
node tools/safety-console.js               # একটা ট্যাবে খোলা রাখুন (কোড চাইলে সাথে সাথে দিন)
```

👉 আজকের বিস্তারিত ফলাফল: **RUN-REPORT-2026-09-29.md** · OTP কেন বাইপাস সম্ভব নয় + কী করলে ঝামেলা শেষ: **OTP-GUIDE.md**

---

## 🆕 ২৯ সেপ্টেম্বর ২০২৬ — আজকের ৪টা ফিক্স (আগে কেন অটো চলছিল না)

| সমস্যা | কারণ | ফিক্স |
|---|---|---|
| লগইন ✓ হলেও mine/pick/claim/sync কিছুই হতো না | `api.init`-এ **`start_param` ছাড়া** কল করলে সার্ভার `FAILED_PRECONDITION: Something went wrong — please reopen Leaf` দেয় → `ensureAuth()` false → সব ফ্লো নীরবে স্কিপ | **AUTH_FIX_V2**: `acc.start_param → acc.tgId → initData-র user id` — যেটা পায় সেটা দিয়ে লগইন; ফেল করলে সাইন-কি (`tone.wasm`) রিফ্রেশ করে রিট্রাই। `setinit` লিংকের `startapp=` অটো ধরে |
| মাঝপথে সব আটকে যেত | Leaf প্রতি কয়েক মিনিটে **Quick Safety Check** (৪-ডিজিট কোড @LeafEarnBot-এ) চায় | **SAFETY_WAIT_V2**: `SAFETY_WAIT=1` দিলে বট কোড চেয়ে পাঠায় → আপনার verify করা পর্যন্ত অপেক্ষা → **ঐ একই কলে অটো-রিট্রাই** (`SAFETY_WAIT_MIN`, ডিফল্ট ৩০) |
| "Click & Earn" (LINK) টাস্কে `Something went wrong` | সার্ভার পার্টনার-পেজে **আসল ভিজিট** (টাচ-পিক্সেল + JS-রিডাইরেক্ট চেইন `/partitial/...`) ভেরিফাই করে, শুধু লিংক-ফেচ মানে না | **LINK_V2**: পেজ → রিডাইরেক্ট → ল্যান্ডিং পেজ + পিক্সেল সব হিট → ≥১২s ওয়েট → complete |
| `run all`-এ অ্যাড/মিশন গেমের পেছনে আটকে থাকত | গেম ৩০ স্লটে ঘণ্টাখানেক নেয় | **ORDER_FIX_V2**: মিশন → স্পিন → অ্যাড/কুইক → পেন্ডিং ক্লেম → **মাইন → গেম সবার শেষে** |

**⛏️ মাইন ("star er ta") কেন ধীর মনে হয়:** প্রতি ট্যাপে সার্ভারের **৪০ মিনিট কুলডাউন** — HEART = ২৫ ট্যাপ ≈ ১৬ ঘণ্টা/গিফট। ট্যাপ শেষ হয়ে ৩০০ পয়েন্ট হলে বট নিজেই `Claim` করবে এবং `chainAfterClaim`-এ নতুন গিফট `Pick` করে নতুন সাইকেল শুরু করবে। এজন্য লম্বা সময় চালু রাখতে হয়:

```bash
SAFETY_WAIT=1 node leafmine.js autopilot      # 🤖 এটাই সব নিজে সামলায়
```

👉 বিস্তারিত আজকের রান-লগ, ফলাফল ও বাকি কাজের তালিকা: **RUN-REPORT-2026-09-29.md**

---

## চালানো

```bash
cd ~/leafearn-bot
node leafmine.js autopilot      # 🤖 সব অটো, প্রতিটা কাজ সার্ভারের আসল রিসেট-টাইমে (loop = একই জিনিস)
node leafmine.js run all        # সব কিছু একবার (মিশন+স্পিন+গেম+অ্যাড+কুইক+ক্লেম+মাইন)
node leafmine.js run adwatch    # অ্যাড-ভিউ (#1 ADSGRAM, #7 MONETAG) + কুইক-টাস্ক + পেন্ডিং গেম-ক্লেম + ADEXIUM চেষ্টা
node leafmine.js run games      # ৫ গেমের সব বাকি স্লট (প্রতি গেমে ৬টা / রোলিং ২৪ঘ)
node leafmine.js run mine       # স্টার-মাইন ট্যাপ + গিফট ক্লেম
node leafmine.js run spin       # লাকি হুইল
node leafmine.js run task       # মিশন (BIO / জয়েন / X)
node leafmine.js redeem CODE    # 🎟 চ্যানেলের প্রোমো কোড (অ্যাড-গেট অটো)
node leafmine.js loop-lite      # পুরনো লুপ (শুধু মাইন+স্পিন)
```

নতুন initData: টেলিগ্রাম থেকে লিংক কপি করে `tmp_url.txt`-এ পেস্ট করো → `node tmp_newinit.js`।

## 🤖 অটোপাইলটের শিডিউল (সব সার্ভারের API থেকে নেওয়া)
| কাজ | কখন চলে | সোর্স |
|---|---|---|
| মাইন-ট্যাপ | প্রতি ~৪০ মিনিটে (HEART: ২৫ ট্যাপ = গিফট) | `MineStatus.next_mine_at_ms` |
| স্পিন | দিনে ১ বার | `SpinStatus.next_spin_ms` |
| অ্যাড-ভিউ #1/#7 | **প্রতি ১২ ঘণ্টায় রিসেট** (দিনে ২ বার ≈ +1,100 × 2) | `Task.next_reset_at_ms` |
| কুইক-টাস্ক | অফার এলেই (ঘণ্টায় চেক) | `QuickStatus.next_at_ms` |
| গেম | স্লট খালি হলেই | `GameStatus.next_slot_at_ms` |
| মিশন | প্রতি ৬ ঘণ্টায় (BIO/জয়েনের পর অটো ক্লেম) | — |

## 🔓 অ্যাড-ভেরিফিকেশন ক্র্যাক
1. **সাইনড `/adv`**: `raw` = HMAC-SHA256(ঘণ্টা-রোটেটেড কী, `searchParams`); `data_check_string` = base64url(সাজানো `k=v`, `\n`-জয়েন)
2. অর্ডার: **`startAdView` → বিকন (render→show→7s→click→reward→return) → `completeAdView`**
3. `completeAdView{token, ads_shown:1, ads_clicked:1, ads_offered:1, ad_id:<show record>}`
4. **"ট্যাপ" কেন লাগে:** ফ্রন্টএন্ড `/event?type=Click` গুনে `adsClicked` পাঠায়; সার্ভার `clicked < shown` হলে **কম ক্রেডিট** দেয় (`nudgeEarnMore`: `credited < base`)। বট প্রতিবার click-বিকন দেয়, আর লগে `FULL ✓` / `PARTIAL ✗` দেখায়।

## 🔗 কুইক-টাস্ক (frontend-হুবহু)
`offer → open(open_url) = ট্যাপ → wait_sec → [reward_url] → claim{type, refId}`
- **ADSGRAM_LINK** ✅ `refId` = open_url শর্ট-লিংকের স্লাগ
- **WEBSITE** ✅ `refId` = অফারের `ref_id`
- **COMMENT** ❌ গ্রুপে আসল মেসেজ লাগে (ইউজার-অ্যাকশন)
- **ADEXIUM** ⚠️ নিচে দেখো
- `QuickStatus.available` = আজকের বাকি **কোটা**, অফার না। আসল অফার আসে Adsgram-এর ইনভেন্টরি থেকে, মাঝে মাঝে।

## 🎮 গেম
| গেম | রিওয়ার্ড/গেম | নোট |
|---|---|---|
| Tic-Tac-Toe | 500 | — |
| **Word Search** | **500 (HARD)** | ✅ **ফিক্স (২৬ সেপ্টে):** আগে `mode:"normal"` পাঠাত → reward 0। ফ্রন্টএন্ড `EASY/MEDIUM/HARD` পাঠায় (120/260/500)। এখন HARD (`WS_MODE` env দিয়ে বদলানো যায়) |
| Snake | ~120-140 | শুধু `normal` মোড |
| Leaf Shooter | ~105-207 | — |
| Block Breaker | 550 | ~৯ মিনিট/গেম |

## 🆕 ২৬ সেপ্টে: নতুন ডিপ্লয় ("ads fix") যাচাই
- `tone.wasm` রিভ বদলেছে (`tone-d797d36e`) → পুরনো ক্যাশে "Please close and reopen Leaf to update" আসে → `config/tone.wasm` মুছলেই বট নতুনটা নামায়
- বদলানো চাঙ্ক: Adsgram ট্র্যাকার (`3uf4p4jqwdu2c.js`), Membership চেক, টাস্কে `tries_used/tries_required`, Redeem-কোড অ্যাড-গেট, নতুন **TOWER** অ্যাড-প্রোভাইডার (uslads TowerAds, পোস্টব্যাক-ভিত্তিক; টাস্ক লিস্টে এখনও নেই)
- **ADEXIUM উইজেট একই আছে** (v1.81, md5 মিলেছে)

| অ্যাড পাথ | ফল |
|---|---|
| #1 ADSGRAM (5 ভিউ) | ✅ 5/5 |
| #7 MONETAG (10 ভিউ) | ✅ 10/10 |
| কুইক ADSGRAM_LINK | ✅ (১৭টা claim, প্রতিটা +100) |
| গেম-ক্লেম অ্যাড | ✅ 17/17 |
| **#6 ADEXIUM / কুইক ADEXIUM** | ❌ নিচে দেখো |

### ADEXIUM-এর অবস্থা
- বিড-বডি এখন উইজেটের **হুবহু ১৮ ফিল্ড** (`from:"window"`, `platform`, `serialized`, `language`…)
- **ডেটাসেন্টার IP (Google Cloud)-তে বিড সবসময় `[]`।** WARP (Cloudflare IPv6) দিয়ে মাঝে মাঝে ফিল আসে (~৩%, প্রতি ইউজারে ক্যাপ)
- ফিল পেয়ে impression + tap দিলে আর "Tap the ad" আসে না, কিন্তু Leaf-এর ভেরিফিকেশন **"Something went wrong"** দেয়। কারণ: Leaf শুধু IPv4 (159.195.38.225), আর ফিল আসে শুধু IPv6-এ, তাই IP কখনো মেলে না
- বট প্রতি ৪৫ মিনিটে চেষ্টা করে। ঐচ্ছিক: `ADX_PROXY=http://127.0.0.1:25345` (WARP: `~/warp/wireproxy -c ~/warp/wp.conf`)। **আসল ফোনে (মোবাইল IP) ADEXIUM ঠিকমতো চলে।**

### সীমাবদ্ধতা (ইউজার-অ্যাকশন লাগে)
- **#2 BIO (+200):** টেলিগ্রাম → Settings → Edit profile → Bio-তে পেস্ট করো:
  `🍀 Best Earning Bot :- t.me/LeafEarnBot/app?startapp=1692540458`
  তারপর বট নিজে ক্লেম করবে
- **#11 Boinkers (+80):** "join the channel first": Boinkers অ্যাপ খুলে ওদের চ্যানেলে জয়েন করো
- **COMMENT কুইক:** গ্রুপে মেসেজ (তুমি ফোন থেকে করেছ ✓)

## ⚠️ সতর্কতা
- **একই IP থেকে রেফারার+রেফারি দুই অ্যাকাউন্ট = ব্যান** (fahim: `Self Referral detected : Ip Matches`)। fahim ডিসেবলড
- Withdraw বট করে না (OTP+ফোন লাগে)। লেজার: `node tmp_ledger.js`
- `start_param` (রেফার আইডি) না থাকলে `api.init` ফেল করে

## আর্কাইটেকচার
- `leafmine.js`: CLI + সব ফ্লো (`flowAdcrack` = অ্যাড+কুইক+ক্লেম, `flowGames` = স্লট-লুপ)
- `lib/autopilot.js`: 🤖 রিসেট-টাইম শিডিউলার
- `lib/leafapi.js`: tone.wasm সাইনিং + gRPC-web (সব সার্ভিস, `redeemStartAdGate` সহ)
- `lib/adsgram.js`: **ক্র্যাকড** Adsgram শো (`doAdShow`, `completeOneView`, `creditNote`) + ADEXIUM (`adexiumBid/adexiumTap/adexiumView`)
- `lib/redeem.js`: রিডিম কোড (validate → startAdGate → শো → claim)
- `lib/gamecore.js`: ৫ গেমের বট-প্লেয়ার (WS = HARD)
- `config/accounts/*.json`: অ্যাকাউন্ট (initData, start_param)
