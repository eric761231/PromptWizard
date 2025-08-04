# PromptWizard - 專業AI提示詞優化大師

一個專業的AI提示詞優化工具，使用 Gemini 1.5 Flash API 提供智能優化服務，專門針對代碼開發、繪畫創作和UI介面設計三個領域。

## 🌟 主要功能

### 三大專業領域
- **代碼開發** - 程式設計、調試、重構和代碼優化
- **繪畫創作** - AI繪圖、藝術創作、風格設計
- **UI設計** - UI/UX設計、介面佈局、使用者體驗

### 核心特性
- ✨ **AI智能優化** - 使用 Gemini 1.5 Flash 提供專業級優化
- 🎯 **多目標支援** - 支援 Gemini、ChatGPT、Claude 等AI模型
- 📊 **複雜度等級** - 基礎、中級、高級、專家四個層次
- 🎨 **風格多樣** - 專業、創意、詳細、簡潔等表達風格
- 🌐 **多語言支援** - 繁中、簡中、英語、混合語言
- 📝 **歷史記錄** - 時間軸式歷史記錄，支援重新載入
- 📋 **便利操作** - 複製、儲存、分享等一鍵功能
- 📱 **響應式設計** - 支援各種裝置和螢幕尺寸
- ⚡ **完整性驗證** - 自動檢查優化結果完整性

## 🚀 快速開始

### 本地運行
1. 下載或克隆專案到本地
```bash
git clone https://github.com/eric761231/PromptWizard.git
cd PromptWizard
```

2. 使用任何HTTP服務器運行（避免CORS問題）
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve .

# 使用PHP
php -S localhost:8000
```

3. 在瀏覽器中打開 `http://localhost:8000`

### 直接使用
也可以直接在瀏覽器中打開 `index.html` 文件，但某些功能可能受到限制。

## 📖 使用說明

### 基本流程
1. **選擇領域** - 點擊頂部導航選擇代碼、繪畫或UI設計
2. **輸入提示詞** - 在左側輸入框中填寫原始提示詞
3. **調整設定** - 選擇複雜度、風格和語言偏好
4. **優化提示詞** - 點擊優化按鈕開始處理
5. **獲取結果** - 查看優化後的提示詞和改進建議

### 範本使用
- 瀏覽下方的範本庫
- 點擊任何範本卡片自動載入到輸入框
- 根據需要修改範本內容
- 進行優化處理

### 歷史管理
- 所有優化記錄自動保存到本地
- 點擊歷史項目可重新載入
- 支援不同領域的歷史記錄

## � 專案結構

```
PromptWizard/
├── .vscode/
│   └── tasks.json              # VS Code 任務配置
├── index.html                  # 主應用程式頁面
├── script.js                   # 核心應用程式邏輯
├── styles.css                  # 樣式表
├── gemini_init.js             # Gemini API 初始化腳本
├── gemini_api_config.json     # API 配置檔案
├── package.json               # 專案配置和啟動腳本
└── README.md                  # 專案說明文件
```

### 核心檔案說明
- **index.html** - 主要使用者介面，包含所有UI組件
- **script.js** - PromptWizard 類別和所有應用程式邏輯
- **styles.css** - 完整的CSS樣式，包含響應式設計
- **gemini_api_config.json** - Gemini API 配置和參數設定
- **gemini_init.js** - API 初始化和本地存儲管理

## �🛠️ 技術架構

### 前端技術
- **HTML5** - 語義化結構和無障礙設計
- **CSS3** - 現代樣式、漸變、動畫效果
- **Vanilla JavaScript** - 原生JS，無外部依賴
- **Font Awesome** - 圖標庫

### AI整合
- **Gemini 1.5 Flash API** - Google 最新AI模型
- **智能提示詞工程** - 專業領域專精優化
- **多目標支援** - 支援不同AI模型的優化策略

### 設計特點
- **現代化UI** - 漸變背景、毛玻璃效果
- **響應式佈局** - Grid和Flexbox佈局
- **無障礙設計** - 支援鍵盤導航和螢幕閱讀器
- **性能優化** - 本地存儲、懶加載

## 🎨 優化規則

### 代碼開發領域
- 增加具體性和詳細程度
- 要求提供程式碼範例
- 強調最佳實踐和業界標準
- 包含錯誤處理和測試

### 繪畫創作領域
- 指定藝術風格和技法
- 強調品質和解析度要求
- 注重光線和色彩描述
- 包含構圖和氛圍要素

### UI設計領域
- 重視使用者體驗
- 強調響應式設計
- 考慮可訪問性標準
- 注重互動和動效

## 🔧 自定義配置

### Gemini API 配置

#### 配置文件結構 (`gemini_api_config.json`)

```json
{
  "api_key": "您的API金鑰",
  "model": "gemini-pro",
  "generation_config": {
    "temperature": 0.7,        // 創意度 (0.0-1.0)
    "top_k": 40,              // 候選詞數量限制
    "top_p": 0.95,            // 累積概率閾值
    "max_output_tokens": 2048  // 最大輸出長度
  }
}
```

#### 參數說明

| 參數 | 範圍 | 說明 | 建議值 |
|------|------|------|--------|
| `temperature` | 0.0-1.0 | 創意度，越高越有創意但可能偏離主題 | 代碼:0.3, 創意:0.8, UI:0.5 |
| `top_k` | 1-100 | 每步考慮的候選詞數量 | 20-60 |
| `top_p` | 0.0-1.0 | 累積概率閾值，控制詞彙多樣性 | 0.8-0.95 |
| `max_output_tokens` | 100-4096 | 最大輸出長度 | 1024-2048 |

#### 針對不同領域的推薦設置

**代碼開發**: `temperature: 0.3, top_k: 30, top_p: 0.9`  
**繪畫創作**: `temperature: 0.8, top_k: 50, top_p: 0.95`  
**UI設計**: `temperature: 0.5, top_k: 40, top_p: 0.92`

#### 配置管理
- **自動載入**: 系統啟動時自動讀取配置文件
- **手動調整**: 點擊設置按鈕 ⚙️ > 進階配置
- **匯出/匯入**: 支援配置備份和團隊共享

### 添加新範本
在 `script.js` 的 `initializeTemplates()` 方法中添加新範本：

```javascript
{
    id: 'your-template-id',
    title: '範本標題',
    description: '範本描述',
    template: '範本內容',
    tags: ['標籤1', '標籤2']
}
```

### 自定義優化規則
在 `getOptimizationRules()` 方法中為各領域添加新規則：

```javascript
{
    condition: (text) => /* 觸發條件 */,
    transform: (text) => /* 轉換邏輯 */,
    tip: '改進建議'
}
```

## 📱 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 貢獻指南

歡迎提交Issues和Pull Requests！

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟Pull Request

## 📄 許可證

此專案使用MIT許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 🙏 致謝

- Font Awesome - 提供優質圖標
- 各位貢獻者和使用者的反饋

---

**PromptWizard** - 讓AI提示詞優化變得簡單專業！
