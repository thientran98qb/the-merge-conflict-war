# PRD: The Merge Conflict War

> **Cuộc chiến Merge Code** — Real-time survival game cho dev team building

---

## 1. Tổng quan (Overview)

### 1.1. Tên sản phẩm
**The Merge Conflict War**

### 1.2. Tầm nhìn (Vision)
Biến việc ôn luyện kiến thức code thành một cuộc đua sinh tồn real-time. Mỗi người chơi là một "Branch" cạnh tranh để merge vào `main` (Production) nhanh nhất bằng cách giải các ticket code — đồng thời có thể phá hoại đối thủ bằng cơ chế "Merge Conflict".

### 1.3. Bối cảnh sử dụng
- **Team building nội bộ công ty** (event offline)
- Mỗi người chơi dùng **laptop cá nhân**
- Không cần màn hình lớn riêng — mọi người xem trên laptop

### 1.4. Mục tiêu
| Mục tiêu | Đo lường |
|-----------|----------|
| Tạo trải nghiệm vui, kích thích | Mọi người muốn chơi lại |
| Rèn kỹ năng đọc/sửa code nhanh | Ticket dựa trên code thực tế (PHP + Frontend) |
| Đánh giá năng lực dev tự nhiên | Bảng xếp hạng cuối game phản ánh tốc độ + chính xác |
| "Flex" trình độ coding khi build | UI mượt, real-time, hiệu ứng ấn tượng |

---

## 2. Đối tượng người dùng (Target Users)

### 2.1. Primary User: Developer (Người chơi)
- Dev nội bộ công ty (PHP + Frontend)
- 5–10 người / session
- Quen thuộc với code, IDE, terminal

### 2.2. Secondary User: Người tổ chức (Organizer)
- Lead/Manager tạo phiên chơi
- Chỉ cần mở link, chọn chủ đề, bấm Start
- Không cần quyền admin phức tạp

---

## 3. Phạm vi MVP (Scope)

### 3.1. Trong phạm vi (In Scope)
- [x] Game lobby: nhập nickname, vào phòng chơi
- [x] Waiting room: thấy ai đã join, countdown start
- [x] Core gameplay: ticket → trả lời → tăng progress
- [x] Streak system: 3 đúng liên tiếp → nhận Conflict
- [x] Conflict mechanic: chọn mục tiêu, ném, giải puzzle
- [x] Real-time progress bar cho tất cả người chơi
- [x] Timer countdown (10–15 phút)
- [x] Win condition: 100% trước hoặc cao nhất khi hết giờ
- [x] Bảng xếp hạng cuối game
- [x] Terminal-style UI + hiệu ứng Framer Motion
- [x] AI-generated tickets (PHP + Frontend)

### 3.2. Ngoài phạm vi MVP (Out of Scope / Non-Goals)
- ❌ Đăng nhập / tạo tài khoản (chơi ngay bằng nickname)
- ❌ Lưu lịch sử game cũ
- ❌ Hỗ trợ mobile
- ❌ Admin panel phức tạp
- ❌ Chế độ chơi team
- ❌ Export kết quả ra file
- ❌ Nhiều game room chạy song song

---

## 4. Luồng người dùng (User Flows)

### 4.1. Luồng chính: Tham gia & Chơi

```
[Mở link] → [Nhập nickname] → [Vào waiting room]
    → [Game bắt đầu (auto hoặc khi đủ người)]
    → [Nhận ticket] → [Trả lời]
        → Đúng: +% progress, check streak
        → Sai: 0%, reset streak
    → [Streak = 3] → [Nhận Conflict] → [Chọn mục tiêu] → [Ném]
    → [Bị ném Conflict] → [Giải conflict puzzle] → [Tiếp tục]
    → [100% hoặc hết giờ] → [Bảng xếp hạng] → [Kết thúc]
```

### 4.2. Luồng phụ: Tạo phòng chơi

```
[Mở link] → [Bấm "Create Room"]
    → [Chọn chủ đề ticket: PHP / Frontend / Mix]
    → [Chọn thời gian: 10 / 15 phút]
    → [AI sinh ticket (loading)]
    → [Nhận Room Code] → [Chia sẻ cho team]
    → [Đợi mọi người join] → [Bấm Start hoặc auto-start]
```

---

## 5. Cơ chế game chi tiết (Game Mechanics)

### 5.1. Progress System

| Yếu tố | Giá trị |
|---------|---------|
| Ticket dễ (trắc nghiệm) | +5% |
| Ticket trung bình (fill-in-blank) | +8% |
| Ticket khó (drag-drop / multi-step) | +12% |
| Trả lời sai | +0%, reset streak |
| Bonus streak (3 đúng liên tiếp) | +3% bonus ngoài điểm ticket |

**Tổng cần**: 100% để thắng tuyệt đối.

### 5.2. Ticket System

**Hình thức ticket (đa dạng theo độ khó):**

1. **Trắc nghiệm (Easy)**: Đoạn code bị lỗi, chọn 1 trong 4 đáp án đúng
2. **Fill-in-the-blank (Medium)**: Đoạn code thiếu, gõ đúng phần còn thiếu
3. **Drag-and-drop (Hard)**: Sắp xếp các dòng code theo đúng thứ tự

**Chủ đề:**
- **PHP**: Lỗi syntax, logic Laravel, Eloquent queries, array functions
- **Frontend**: CSS bugs, JavaScript gotchas, React/Vue patterns, HTML semantics

**AI Generation:**
- Ticket được pre-generate khi tạo room (không gọi AI real-time)
- Hỗ trợ nhiều AI provider (OpenAI, Anthropic, Gemini) qua abstraction layer
- Mỗi session sinh ~30–40 tickets (đủ cho 10–15 phút gameplay)

### 5.3. Streak & Conflict System

```
Trả lời đúng 1 → Streak: 🔥
Trả lời đúng 2 → Streak: 🔥🔥
Trả lời đúng 3 → Streak: 🔥🔥🔥 → 💣 CONFLICT UNLOCKED!
Trả lời sai    → Streak reset về 0
```

**Khi có Conflict:**
- Nút "🔥 Throw Conflict" xuất hiện trên màn hình
- Người chơi chọn mục tiêu từ danh sách (thấy tên + % hiện tại)
- Chiến thuật: thường ném vào người đang dẫn đầu

**Khi bị nhận Conflict:**
- Màn hình hiển thị **MERGE CONFLICT!** (đỏ rực, hiệu ứng rung lắc + vỡ kính)
- Phải giải 1 trong 2 loại challenge:
  - **Hard puzzle**: Câu hỏi code khó hơn bình thường
  - **"Vô tri" task**: Gõ lại một dòng comment dài chính xác (ví dụ: `// TODO: Fix this legacy spaghetti code that nobody understands anymore`)
- Không thể làm ticket chính cho đến khi giải xong Conflict
- **Không giới hạn thời gian** giải Conflict (nhưng càng chậm càng bất lợi)

### 5.4. Win Condition

- **Thắng tuyệt đối**: Người đầu tiên đạt 100% progress
- **Thắng theo thời gian**: Hết giờ → người có % cao nhất thắng
- **Hòa**: Nếu cùng %, ai có ít câu sai hơn thắng

---

## 6. Yêu cầu kỹ thuật (Technical Requirements)

### 6.1. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion (animations) |
| **Real-time** | Supabase Realtime (Postgres Changes + Broadcast) |
| **Database** | Supabase PostgreSQL |
| **AI Tickets** | Abstraction layer: OpenAI / Anthropic / Gemini |
| **Hosting** | Vercel (frontend) + Supabase (backend) |
| **Font** | JetBrains Mono / Fira Code (monospace, terminal feel) |

### 6.2. Database Schema (Simplified)

```
game_rooms
├── id (uuid, PK)
├── room_code (varchar, unique, 6 chars)
├── status (enum: waiting, playing, finished)
├── topic (enum: php, frontend, mix)
├── duration_minutes (int: 10 or 15)
├── tickets (jsonb) -- pre-generated ticket array
├── created_at (timestamp)
└── started_at (timestamp, nullable)

players
├── id (uuid, PK)
├── room_id (FK → game_rooms)
├── nickname (varchar)
├── progress (float, 0–100)
├── streak (int, 0–3+)
├── conflicts_held (int, default 0)
├── is_conflicted (boolean, default false)
├── total_correct (int)
├── total_wrong (int)
├── current_ticket_index (int)
└── joined_at (timestamp)

conflict_events
├── id (uuid, PK)
├── room_id (FK → game_rooms)
├── from_player_id (FK → players)
├── to_player_id (FK → players)
├── conflict_type (enum: hard_puzzle, silly_task)
├── resolved (boolean)
└── created_at (timestamp)
```

### 6.3. Real-time Architecture

```
Supabase Realtime Channels:
├── room:{room_code}:players    -- Player progress updates
├── room:{room_code}:conflicts  -- Conflict events (throw/resolve)
├── room:{room_code}:game       -- Game state (start/end/timer)
└── room:{room_code}:ticker     -- Live activity feed
```

### 6.4. Non-Functional Requirements

| Yếu tố | Yêu cầu |
|---------|---------|
| **Latency** | Real-time updates < 500ms |
| **Concurrent** | 5–10 players / session |
| **Uptime** | Best-effort (team building, không mission-critical) |
| **Data** | Ephemeral — không cần lưu sau khi game kết thúc |
| **Security** | Rate limit cơ bản, không cần auth |
| **AI Cost** | Pre-generate tickets, không gọi real-time |
| **Browser** | Chrome/Edge/Firefox (desktop only) |

---

## 7. Thiết kế UI/UX (UI/UX Design)

### 7.1. Design Direction

**Theme: Terminal / Hacker Aesthetic**
- Nền đen (`#0a0a0a`) + chữ xanh lá (`#00ff41`, `#39ff14`)
- Font monospace (JetBrains Mono)
- Cursor nhấp nháy, typing effect
- Scan lines overlay nhẹ (CRT effect)
- Glow effect trên text và border

**Accent Colors:**
- Xanh lá (primary): `#00ff41` — progress, success
- Đỏ (danger): `#ff0040` — conflict, error, warning
- Vàng (streak): `#ffd700` — streak fire, bonus
- Xanh dương (info): `#00d4ff` — neutral info, links
- Tím (special): `#a855f7` — rare events

### 7.2. Các màn hình chính

#### Screen 1: Landing / Create Room
- Logo "The Merge Conflict War" với glitch effect
- 2 options: "Create Room" hoặc "Join Room"
- Input room code (join) hoặc topic selector (create)
- Typing animation cho tagline

#### Screen 2: Waiting Room (Lobby)
- Room code lớn ở trên (copy-able)
- Danh sách players đã join (avatar terminal-style: `>_`)
- "Waiting for players..." blinking text
- Start button (hoặc auto-start khi đủ 3+ người)
- Countdown animation khi bắt đầu

#### Screen 3: Main Game (Core Gameplay)
- **Top bar**: Timer countdown + Room info
- **Left panel**: Leaderboard mini — tất cả progress bars
- **Center**: Ticket hiện tại (code block + câu hỏi + input/options)
- **Right panel**: Activity feed (ai vừa trả lời đúng, ai bị conflict)
- **Bottom**: Streak indicator + Conflict button (khi available)

#### Screen 4: Conflict Overlay
- Full-screen overlay đỏ: **MERGE CONFLICT!**
- Hiệu ứng: rung lắc (shake) + vỡ kính (shatter) + glitch
- Hiển thị ai đã ném conflict
- Challenge content (hard puzzle hoặc typing task)
- Khi giải xong: hiệu ứng "RESOLVED" màu xanh

#### Screen 5: Target Selection Modal
- Khi nhấn "Throw Conflict"
- Danh sách người chơi: avatar + nickname + % progress
- Highlight người đang dẫn đầu
- Bấm chọn → animation ném conflict (projectile effect)

#### Screen 6: Game Over / Results
- "MERGED SUCCESSFULLY" cho người thắng
- Bảng xếp hạng final: rank, nickname, %, correct/wrong, conflicts thrown/received
- Confetti animation cho top 3
- "Play Again" button

---

## 8. Assumptions (Giả định)

1. Supabase Realtime free tier đủ cho 5–10 concurrent connections
2. AI tickets pre-generated trong 5–15 giây (acceptable loading time)
3. Mỗi session sinh ~30–40 tickets là đủ cho 10–15 phút
4. Người chơi có kết nối internet ổn định (cùng mạng công ty)
5. Không cần persistent data — game session là ephemeral
6. Mỗi lần chỉ chạy 1 game room

---

## 9. Decision Log

| # | Quyết định | Lý do |
|---|------------|-------|
| 1 | Không cần auth | MVP cho team building, giảm friction tối đa |
| 2 | AI pre-generate tickets | Tránh chi phí real-time API calls, latency ổn định |
| 3 | Supabase thay vì Socket.io | Cùng ecosystem với DB, deploy đơn giản trên Vercel |
| 4 | Terminal UI theme | Phù hợp audience (devs), tạo vibe "hacker", dễ implement |
| 5 | Conflict tự chọn mục tiêu | Tăng chiến thuật, tương tác xã hội, drama thú vị |
| 6 | Mixed answer format | Đa dạng trải nghiệm, phân loại độ khó tự nhiên |
| 7 | Session 10–15 phút | Đủ hấp dẫn, không quá dài gây mệt, phù hợp team building |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI sinh ticket chất lượng kém | Gameplay nhàm chán | Validate ticket structure, có fallback preset tickets |
| Supabase Realtime bị lag | Trải nghiệm giật | Optimistic UI updates, retry logic |
| Conflict spam (ném liên tục 1 người) | Unfair, frustrating | Cooldown: không thể bị conflict 2 lần liên tiếp trong 30s |
| Mất kết nối giữa game | Mất progress | Auto-reconnect, state khôi phục từ DB |
| Quá ít ticket cho session dài | Game bị lặp | Sinh dư ticket (40+), shuffle thứ tự mỗi player |

---

## 11. Milestones

| Phase | Nội dung | Thời gian ước tính |
|-------|----------|-------------------|
| **Phase 1** | Setup project, DB schema, basic UI shell | 2–3 ngày |
| **Phase 2** | Lobby + Waiting Room + Room creation | 2–3 ngày |
| **Phase 3** | Core gameplay (tickets, progress, timer) | 3–4 ngày |
| **Phase 4** | Real-time sync (Supabase Realtime) | 2–3 ngày |
| **Phase 5** | Streak + Conflict system | 2–3 ngày |
| **Phase 6** | AI ticket generation | 2–3 ngày |
| **Phase 7** | Polish: animations, effects, game over | 2–3 ngày |
| **Phase 8** | Testing + Bug fixes + Deploy | 2–3 ngày |
| **Total** | | **~18–25 ngày** |

---

*Document version: 1.0*
*Created: 2026-02-12*
*Status: Draft — Pending design validation*
