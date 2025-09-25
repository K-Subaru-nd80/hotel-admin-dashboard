# Hotel Admin Dashboard MVP

ホテル管理者用のダッシュボードMVP - 予約からデバイス制御まで一貫した管理を提供するWebアプリケーション

## 🌟 特徴

- **リアルタイム監視**: ホテル内の全部屋のデバイス状態をリアルタイムで監視
- **温度制御**: エアコンの設定温度を遠隔から変更
- **アラート管理**: デバイス異常や温度異常を即座に検知・通知
- **予約連携**: 宿泊者の希望に基づいた事前設定
- **レスポンシブデザイン**: デスクトップ・モバイル対応

## 🛠 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript
- **スタイリング**: Tailwind CSS
- **グラフ**: Recharts
- **アイコン**: Heroicons
- **テスト**: Jest + React Testing Library
- **開発**: Storybook

## 🚀 開始方法

### 1. インストール

```bash
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します

### 3. Storybook（コンポーネント開発）

```bash
npm run storybook
```

Storybookが http://localhost:6006 で起動します

### 4. テスト実行

```bash
npm test
```

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # ダッシュボードページ
│   ├── hotels/           # ホテル一覧・部屋管理
│   ├── alerts/           # アラート管理
│   ├── settings/         # 設定
│   └── api/              # APIルート
├── components/           # 再利用可能コンポーネント
│   ├── KpiCard.tsx      # KPI表示カード
│   ├── HotelSelector.tsx # ホテル選択
│   ├── RoomCard.tsx     # 部屋状態カード
│   ├── RoomDetailModal.tsx # 部屋詳細モーダル
│   └── TelemetryChart.tsx  # テレメトリグラフ
├── types/               # TypeScript型定義
├── mocks/              # モックデータ
└── stories/            # Storybookストーリー
```

## 🎯 主要機能

### 1. ダッシュボード (`/dashboard`)
- KPI表示（総部屋数、オンライン数、未ACKコマンド、本日到着数）
- リアルタイムアラート
- 今日の到着予定一覧

### 2. ホテル管理 (`/hotels`)
- ホテル・部屋一覧表示
- 部屋状態フィルタリング
- 検索機能（部屋番号、予約ID、宿泊者名）

### 3. 部屋詳細（モーダル）
- 予約情報表示
- デバイス情報（モデル、ステータス、信号強度）
- 温度推移グラフ（過去24時間）
- 手動温度設定
- コマンド履歴

### 4. アラート管理 (`/alerts`)
- アラート一覧（重要度別フィルタ）
- 解決・エスカレーション操作
- リアルタイム新規アラート

### 5. 設定 (`/settings`)
- 通知設定（メール・Slack）
- 閾値設定（応答時間、温度差、信号強度）

## 🔄 リアルタイム機能

- **テレメトリ更新**: 2-3秒間隔でデバイス状態を更新
- **コマンドACK**: 送信→pending→acked の状態遷移をシミュレート
- **新規アラート**: 条件に応じて自動生成・通知

## 🧪 テスト

RoomCardコンポーネントの包括的テストを実装：

- 部屋情報表示
- デバイスステータス表示
- 予約情報表示
- インタラクション（クリック、キーボード）
- エラー状態表示

テスト実行:
```bash
npm test
```

## 📚 Storybook

主要コンポーネントのStorybookストーリーを用意：

- Default（標準状態）
- VacantRoom（空室）
- OfflineDevice（オフライン）
- ErrorDevice（エラー）
- TemperatureDifference（温度差警告）
- WeakSignal（信号弱）

## 🔧 Raspberry Pi API 統合

このアプリケーションは Raspberry Pi 上で動作するリモートコントローラー API と統合可能です。

### API 仕様

Raspberry Pi 側で以下のエンドポイントを提供する必要があります：

| エンドポイント | メソッド | 説明 | レスポンス例 |
|---|---|---|---|
| `/` | GET | 動作確認 | `{"status": "200", "body": "This is test."}` |
| `/control/power` | GET | 電源状態取得 | `{"status": "200", "body": true}` |
| `/control/temperature/up` | GET | 温度+1 | `{"status": "200", "body": 25}` |
| `/control/temperature/down` | GET | 温度-1 | `{"status": "200", "body": 23}` |
| `/info/room` | GET | ルーム情報 | `{"status": "200", "room": "303", "usr": "田中様", "temperature": 24, "power": true}` |
| `/info/settings` | GET | デバイス情報 | `{"status": "200", "id": "00001", "Hard_name": "raspberrypi 3B", "room": "303"}` |

### 環境変数設定

`.env.local` ファイルを作成して Raspberry Pi の IP アドレスを設定：

```env
# Raspberry Pi API の URL
NEXT_PUBLIC_PI_API_URL=http://192.168.1.100:8000
```

### 動作モード

- **実機モード**: `NEXT_PUBLIC_PI_API_URL` が設定されている場合、実際の Raspberry Pi API を呼び出し
- **モックモード**: 環境変数が未設定の場合、従来のモックデータを使用

### 統合された機能

✅ **温度制御**: +1/-1 ボタンで直接 Pi API を呼び出し  
✅ **部屋情報取得**: Pi から実際のデバイス情報を取得  
✅ **エラーハンドリング**: Pi API が応答しない場合はモックデータにフォールバック  
✅ **タイムアウト**: 10秒でタイムアウト、長時間待機を防止  

## 🌐 API仕様

### GET `/api/hotels`
ホテル一覧取得

### GET `/api/hotels/:hotelId/rooms`
指定ホテルの部屋一覧取得

### POST `/api/rooms/:roomId/commands`
部屋のデバイスにコマンド送信

### GET `/api/alerts`
アラート一覧取得

## 🔧 設定

### TypeScript設定
- パスマッピング（`@/*` -> `./src/*`）
- 厳格型チェック有効

### Tailwind設定
- 標準カラーパレット使用
- レスポンシブ対応
- ダークモード対応準備済み

## 🚀 本番デプロイ

```bash
npm run build
npm start
```

## 📝 今後の拡張予定

- [ ] WebSocket実装（リアルタイム通信）
- [ ] 認証・認可システム
- [ ] 多言語対応（i18n）
- [ ] ダークモード
- [ ] データエクスポート機能
- [ ] モバイルアプリ

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## 🏆 受け入れ基準 - 達成状況

✅ **Next.js + TypeScript + Tailwind** - 完全実装
✅ **5つの主要ページ** - dashboard, hotels, alerts, settings, room detail (modal)
✅ **再利用可能コンポーネント** - KpiCard, HotelSelector, RoomCard, RoomDetailModal, TelemetryChart
✅ **モックデータ & API** - 完全なモック実装
✅ **コマンド送信シミュレーション** - pending → acked 状態遷移
✅ **リアルタイム更新** - setInterval による擬似リアルタイム
✅ **レスポンシブデザイン** - デスクトップ優先、モバイル対応
✅ **アクセシビリティ** - ARIA labels, keyboard navigation, focus management
✅ **テスト** - Jest + React Testing Library による包括的テスト
✅ **Storybook** - コンポーネント開発・文書化環境
