// PromptWizard JavaScript
class PromptWizard {
    constructor() {
        this.currentCategory = 'code';
        this.templates = this.initializeTemplates();
        this.history = this.loadHistory();
        this.geminiApiKey = this.loadApiKey();
        this.geminiConfig = this.loadGeminiConfig();
        
        // 確保配置存在
        if (!this.geminiConfig) {
            console.error('❌ 無法載入 Gemini 配置，建立預設配置');
            this.geminiConfig = this.createDefaultConfig();
        }
        
        console.log('🔧 初始化完成，當前配置:', {
            hasApiKey: !!this.geminiApiKey,
            config: this.geminiConfig
        });
        
        this.initializeEventListeners();
        this.updateCategoryInfo();
        this.renderTemplates();
        this.renderHistory();
        this.initializeApiKeyModal();
    }

    initializeEventListeners() {
        // Navigation buttons (both original and compact)
        document.querySelectorAll('.nav-btn, .nav-btn-compact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.closest('.nav-btn, .nav-btn-compact').dataset.category);
            });
        });

        // Optimize button (both original and compact)
        const optimizeBtn = document.getElementById('optimize-btn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizePrompt();
            });
        }

        // Action buttons
        document.getElementById('copy-btn')?.addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.savePrompt();
        });

        document.getElementById('share-btn')?.addEventListener('click', () => {
            this.sharePrompt();
        });

        // Enhanced custom select interactions (both original and compact)
        this.initializeCustomSelects();

        // History toggle for compact layout
        const historyToggle = document.getElementById('history-toggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                this.toggleHistory();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showApiKeyModal();
            });
        }

        // Template pills for compact layout
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-pill')) {
                const templatePill = e.target.closest('.template-pill');
                const templateId = templatePill.dataset.templateId;
                this.loadTemplate(templateId);
            }
        });

        // Template cards click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-card')) {
                const templateCard = e.target.closest('.template-card');
                const templateId = templateCard.dataset.templateId;
                this.loadTemplate(templateId);
            }
        });

        // History items click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.history-item')) {
                const historyItem = e.target.closest('.history-item');
                const historyIndex = parseInt(historyItem.dataset.index);
                this.loadHistoryItem(historyIndex);
            }
        });
    }

    initializeCustomSelects() {
        // Add enhanced interactions for custom selects (both original and compact)
        document.querySelectorAll('.custom-select, .custom-select-mini').forEach(selectWrapper => {
            const select = selectWrapper.querySelector('select');
            const focusRing = selectWrapper.querySelector('.select-focus-ring');
            const arrow = selectWrapper.querySelector('.select-arrow, .select-arrow-mini');

            if (!select) return;

            // Focus events
            select.addEventListener('focus', () => {
                selectWrapper.classList.add('focused');
                this.addSelectFocusEffect(selectWrapper);
            });

            select.addEventListener('blur', () => {
                selectWrapper.classList.remove('focused');
                this.removeSelectFocusEffect(selectWrapper);
            });

            // Change events with animation
            select.addEventListener('change', () => {
                this.addSelectChangeEffect(selectWrapper);
            });

            // Hover effects
            selectWrapper.addEventListener('mouseenter', () => {
                if (!select.disabled) {
                    this.addSelectHoverEffect(selectWrapper);
                }
            });

            selectWrapper.addEventListener('mouseleave', () => {
                this.removeSelectHoverEffect(selectWrapper);
            });

            // Keyboard navigation enhancement
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.addSelectInteractionEffect(selectWrapper);
                }
            });
        });
    }

    addSelectFocusEffect(selectWrapper) {
        const focusRing = selectWrapper.querySelector('.select-focus-ring');
        if (focusRing) {
            focusRing.style.opacity = '1';
            focusRing.style.transform = 'scale(1)';
        }
        
        // Add a subtle glow effect
        selectWrapper.style.filter = 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))';
    }

    removeSelectFocusEffect(selectWrapper) {
        const focusRing = selectWrapper.querySelector('.select-focus-ring');
        if (focusRing) {
            focusRing.style.opacity = '0';
            focusRing.style.transform = 'scale(0.95)';
        }
        
        selectWrapper.style.filter = 'none';
    }

    addSelectChangeEffect(selectWrapper) {
        // Add a brief success pulse effect
        selectWrapper.style.animation = 'selectChange 0.3s ease';
        
        setTimeout(() => {
            selectWrapper.style.animation = '';
        }, 300);

        // Add CSS for change animation
        if (!document.querySelector('#select-animations')) {
            const style = document.createElement('style');
            style.id = 'select-animations';
            style.textContent = `
                @keyframes selectChange {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                
                @keyframes selectHover {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.01); }
                }
                
                @keyframes selectInteraction {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.98); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addSelectHoverEffect(selectWrapper) {
        selectWrapper.style.animation = 'selectHover 0.2s ease forwards';
    }

    removeSelectHoverEffect(selectWrapper) {
        selectWrapper.style.animation = '';
    }

    addSelectInteractionEffect(selectWrapper) {
        selectWrapper.style.animation = 'selectInteraction 0.15s ease';
        
        setTimeout(() => {
            selectWrapper.style.animation = '';
        }, 150);
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active nav button with accessibility support (both layouts)
        document.querySelectorAll('.nav-btn, .nav-btn-compact').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeBtns = document.querySelectorAll(`[data-category="${category}"]`);
        activeBtns.forEach(btn => {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        });
        
        // Update category info (only for full layout)
        const categoryDesc = document.getElementById('category-description');
        if (categoryDesc) {
            this.updateCategoryInfo();
        }
        
        // Re-render templates for current category
        this.renderTemplates();
        
        // Clear current input
        const promptInput = document.getElementById('original-prompt');
        if (promptInput) {
            promptInput.value = '';
        }
        this.clearOutput();
        
        // Announce category change to screen readers
        this.announceToScreenReader(`已切換到${this.getCategoryName(category)}領域`);
    }

    updateCategoryInfo() {
        const descriptions = {
            code: {
                title: '代碼開發專業領域',
                description: '運用深入的軟體工程專業知識，針對程式設計、系統架構、代碼優化、調試分析等核心技術領域，提供高水準的提示詞優化服務。適用於多種程式語言、開發框架及軟體工程最佳實踐。'
            },
            art: {
                title: '繪畫創作藝術領域', 
                description: '基於專業藝術理論與視覺設計原理，針對AI繪圖、數位藝術創作、風格設計、色彩搭配等創意表達領域，提供高品質的提示詞專業優化。涵蓋多種藝術風格與創作技法。'
            },
            ui: {
                title: 'UI介面設計專業領域',
                description: '遵循人機互動設計原理與使用者體驗研究成果，專門針對UI/UX設計、介面佈局、互動設計、資訊架構等專業設計領域，提供符合業界標準的提示詞優化服務。'
            }
        };

        const info = descriptions[this.currentCategory];
        const categoryDescElement = document.getElementById('category-description');
        if (categoryDescElement) {
            categoryDescElement.innerHTML = `
                <strong>${info.title}</strong><br>
                ${info.description}
            `;
        }
        
        // Update page title or other UI elements if needed
        document.title = `PromptWizard - ${info.title}`;
    }

    optimizePrompt() {
        const originalPrompt = document.getElementById('original-prompt').value.trim();
        
        if (!originalPrompt) {
            this.showNotification('請輸入需要優化的提示詞內容', 'error');
            document.getElementById('original-prompt').focus();
            return;
        }

        const complexity = document.getElementById('complexity').value;
        const targetAI = document.getElementById('target-ai').value;
        const style = document.getElementById('style').value;
        const language = document.getElementById('language').value;

        // Show loading state with accessibility support
        const optimizeBtn = document.getElementById('optimize-btn');
        const originalText = optimizeBtn.innerHTML;
        optimizeBtn.innerHTML = '<div class="loading" role="status" aria-label="處理中"></div> 專業分析處理中...';
        optimizeBtn.disabled = true;
        optimizeBtn.setAttribute('aria-disabled', 'true');

        // Announce optimization start to screen readers
        this.announceToScreenReader('開始進行專業提示詞優化分析');

        // Check for API key
        if (!this.geminiApiKey) {
            this.showApiKeyModal();
            optimizeBtn.innerHTML = originalText;
            optimizeBtn.disabled = false;
            optimizeBtn.removeAttribute('aria-disabled');
            return;
        }

        // Use Gemini Pro API for optimization
        this.optimizeWithGemini(originalPrompt, complexity, targetAI, style, language)
            .then(optimizedResult => {
                // Validate that optimization includes all main points
                const validationResult = this.validateOptimization(originalPrompt, optimizedResult.optimized);
                
                if (!validationResult.isComplete) {
                    // Add warning about potentially incomplete optimization
                    optimizedResult.tips.unshift(`⚠️ 建議檢查：${validationResult.warning}`);
                }
                
                this.displayResult(optimizedResult);
                
                // Save to history
                this.saveToHistory(originalPrompt, optimizedResult.optimized, complexity, targetAI, style, language);
                
                // Reset button
                optimizeBtn.innerHTML = originalText;
                optimizeBtn.disabled = false;
                optimizeBtn.removeAttribute('aria-disabled');
                
                // Announce completion
                this.announceToScreenReader('提示詞優化完成');
                
                this.showNotification('專業優化完成！', 'success');
            })
            .catch(error => {
                console.error('Gemini API error:', error);
                
                // Reset button
                optimizeBtn.innerHTML = originalText;
                optimizeBtn.disabled = false;
                optimizeBtn.removeAttribute('aria-disabled');
                
                // Show error notification
                this.showNotification('API 調用失敗，請檢查網路連線或 API 金鑰設置', 'error');
                this.announceToScreenReader('提示詞優化失敗，請重試');
            });
    }

    async optimizeWithGemini(originalPrompt, complexity, targetAI, style, language) {
        const categoryContext = this.getCategoryContext(this.currentCategory);
        const complexityLevel = this.getComplexityDescription(complexity);
        const targetAIDescription = this.getTargetAIDescription(targetAI);
        const styleDescription = this.getStyleDescription(style);
        const languagePreference = this.getLanguagePreference(language);

        const systemPrompt = `你是一位專業的AI提示詞優化專家，專精於${categoryContext.title}。

領域專業背景：
${categoryContext.expertise}

目標AI模型特性：
${targetAIDescription}

優化要求：
- 複雜度等級：${complexityLevel}
- 表達風格：${styleDescription}
- 語言偏好：${languagePreference}

**重要指示：請完整處理用戶提供的所有內容，包括條列式的每一個要點。不要遺漏任何部分。**

請根據以下原則優化用戶的提示詞：
1. 增強專業性和技術精確度
2. 確保指令清晰具體
3. 加入領域專業術語和最佳實踐
4. 提升輸出品質的可預期性
5. 符合${categoryContext.title}的專業標準
6. **保持原有結構完整性**（如果是條列式，請保持條列式並優化每一點）
7. **確保所有要點都被處理和優化**

如果原始提示詞包含多個要點或條列項目，請：
- 逐一分析並優化每個要點
- 保持原有的結構層次
- 確保每個要點都得到專業強化
- 不要合併或省略任何要點

請提供：
1. **完整優化後的提示詞**（保持所有原有要點，逐一強化）
2. **具體改進說明**（針對每個優化點的解釋）
3. **結構化建議**（如何讓提示詞更有效）

原始提示詞：
"""
${originalPrompt}
"""

請確保優化結果包含原始提示詞的所有內容要點，一個都不能遺漏。`;

        try {
            // Use configuration from geminiConfig
            const apiUrl = `${this.geminiConfig.base_url}/${this.geminiConfig.model}:generateContent?key=${this.geminiApiKey}`;
            
            console.log('🔧 API 調用配置:', {
                url: apiUrl,
                hasApiKey: !!this.geminiApiKey,
                config: this.geminiConfig
            });
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: this.geminiConfig.generationConfig,
                safetySettings: this.geminiConfig.safetySettings
            };
            
            console.log('📤 請求內容:', requestBody);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 API 回應狀態:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API 錯誤詳情:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API 回應成功:', data);
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('API 回應格式不正確：缺少 candidates 或 content');
            }
            
            const optimizedContent = data.candidates[0].content.parts[0].text;

            return this.parseGeminiResponse(optimizedContent);

        } catch (error) {
            console.error('🚨 Gemini API 優化失敗:', error);
            console.error('📊 錯誤堆疊:', error.stack);
            throw error;
        }
    }

    parseGeminiResponse(content) {
        // Improved parsing logic to handle structured content better
        console.log('🔍 解析 Gemini 回應:', content);
        
        // Split content into sections
        const sections = content.split(/\n\s*\n/).filter(section => section.trim());
        
        let optimized = '';
        let tips = [];
        let foundOptimizedSection = false;
        
        for (let section of sections) {
            const sectionLines = section.split('\n').filter(line => line.trim());
            const firstLine = sectionLines[0]?.toLowerCase() || '';
            
            // Look for optimized prompt section
            if (firstLine.includes('優化後') || firstLine.includes('優化版本') || 
                firstLine.includes('改進後') || firstLine.includes('完整優化')) {
                
                foundOptimizedSection = true;
                // Get the content after the header
                const contentLines = sectionLines.slice(1).filter(line => 
                    line.trim() && 
                    !line.includes('：') && 
                    !line.includes(':') &&
                    !line.trim().startsWith('*') &&
                    !line.trim().startsWith('-') &&
                    !line.trim().startsWith('•')
                );
                
                if (contentLines.length > 0) {
                    optimized = contentLines.join('\n').trim();
                    break; // Found the main optimized content
                }
            }
            
            // Look for tips section
            if (firstLine.includes('改進') || firstLine.includes('建議') || firstLine.includes('說明')) {
                const tipLines = sectionLines.slice(1);
                for (let tipLine of tipLines) {
                    const cleanTip = tipLine
                        .replace(/^\d+\.?\s*/, '')
                        .replace(/^[•\-\*]\s*/, '')
                        .trim();
                    
                    if (cleanTip && cleanTip.length > 10 && tips.length < 5) {
                        tips.push(cleanTip);
                    }
                }
            }
        }
        
        // If no structured optimized section found, look for the longest meaningful paragraph
        if (!optimized.trim() && !foundOptimizedSection) {
            // Find the longest paragraph that looks like a prompt
            const meaningfulSections = sections.filter(section => {
                const text = section.trim();
                return text.length > 100 && 
                       !text.toLowerCase().includes('建議') &&
                       !text.toLowerCase().includes('改進') &&
                       !text.toLowerCase().includes('說明');
            });
            
            if (meaningfulSections.length > 0) {
                // Use the longest section as the optimized prompt
                optimized = meaningfulSections
                    .sort((a, b) => b.length - a.length)[0]
                    .trim();
            }
        }
        
        // Fallback: if still no optimized content, try to extract from any substantial content
        if (!optimized.trim()) {
            const allText = content.replace(/\n+/g, ' ').trim();
            if (allText.length > 50) {
                // Take the first substantial chunk, but ensure it's reasonable
                const sentences = allText.split(/[。！？.!?]/).filter(s => s.trim().length > 20);
                if (sentences.length > 0) {
                    optimized = sentences.slice(0, 3).join('。') + '。';
                }
            }
        }
        
        console.log('✅ 解析結果:', { 
            optimized: optimized.substring(0, 100) + '...', 
            tipsCount: tips.length 
        });
        
        return {
            optimized: optimized.trim() || '優化處理中遇到問題，請重試或調整提示詞內容。',
            tips: tips,
            improvements: [
                '使用 Gemini 1.5 Flash AI 進行專業優化',
                '基於領域專業知識改進指令精確度',
                '增強提示詞的結構化和完整性',
                '確保所有要點都得到處理和強化'
            ]
        };
    }

    validateOptimization(originalPrompt, optimizedPrompt) {
        // Check if optimization maintains completeness of original content
        const originalLines = originalPrompt.split('\n').filter(line => line.trim());
        const optimizedLines = optimizedPrompt.split('\n').filter(line => line.trim());
        
        // Count numbered points or bullet points in original
        const originalPoints = originalLines.filter(line => 
            /^\d+\./.test(line.trim()) || 
            /^[•\-\*]/.test(line.trim()) ||
            line.includes('第') && line.includes('點')
        );
        
        // Count similar structures in optimized
        const optimizedPoints = optimizedLines.filter(line => 
            /^\d+\./.test(line.trim()) || 
            /^[•\-\*]/.test(line.trim()) ||
            line.includes('第') && line.includes('點')
        );
        
        // Simple length check
        const lengthRatio = optimizedPrompt.length / originalPrompt.length;
        
        let warnings = [];
        let isComplete = true;
        
        // Check if significant reduction in points
        if (originalPoints.length > 1 && optimizedPoints.length < originalPoints.length * 0.7) {
            warnings.push(`原始內容有 ${originalPoints.length} 個要點，優化後只有 ${optimizedPoints.length} 個要點`);
            isComplete = false;
        }
        
        // Check if too much content reduction
        if (lengthRatio < 0.5 && originalPrompt.length > 100) {
            warnings.push('優化後的內容明顯縮短，可能遺漏了部分要求');
            isComplete = false;
        }
        
        // Check for key structural words
        const structuralWords = ['第一', '第二', '第三', '首先', '其次', '最後', '另外', '此外'];
        const originalStructural = structuralWords.filter(word => originalPrompt.includes(word));
        const optimizedStructural = structuralWords.filter(word => optimizedPrompt.includes(word));
        
        if (originalStructural.length > 2 && optimizedStructural.length < originalStructural.length * 0.5) {
            warnings.push('可能遺漏了原始內容的結構性要點');
            isComplete = false;
        }
        
        return {
            isComplete,
            warning: warnings.length > 0 ? warnings.join('；') : null,
            originalPointsCount: originalPoints.length,
            optimizedPointsCount: optimizedPoints.length,
            lengthRatio
        };
    }

    getCategoryContext(category) {
        const contexts = {
            code: {
                title: '軟體開發與程式設計',
                expertise: `專精於軟體工程、程式設計、系統架構設計、代碼優化、除錯分析、效能調校等核心技術領域。
                熟悉多種程式語言（Python、JavaScript、Java、C++、Go等）、開發框架（React、Vue、Spring、Django等）、
                資料庫設計、雲端架構、DevOps實踐、軟體測試、安全開發等專業技能。
                遵循軟體工程最佳實踐、設計模式、代碼品質標準和業界規範。`
            },
            art: {
                title: '數位藝術創作與視覺設計',
                expertise: `專精於數位藝術創作、概念藝術設計、插畫繪製、色彩理論、構圖原理、光影技法等藝術專業領域。
                熟悉各種藝術風格（寫實、插畫、概念藝術、抽象、印象派等）、繪畫技法、數位工具應用、
                視覺傳達設計、品牌視覺、平面設計等創意表達方式。
                具備深厚的美學素養、創意思維和專業的視覺表達能力。`
            },
            ui: {
                title: 'UI/UX設計與人機互動',
                expertise: `專精於使用者介面設計、使用者體驗設計、人機互動原理、資訊架構、互動設計、視覺設計等專業領域。
                熟悉設計系統建構、原型設計、使用者研究、可用性測試、響應式設計、無障礙設計、
                前端開發協作、設計規範制定等現代UI/UX設計實務。
                遵循使用者中心設計原則、設計思維流程和國際可訪問性標準（WCAG）。`
            }
        };
        return contexts[category];
    }

    getComplexityDescription(complexity) {
        const descriptions = {
            basic: '基礎入門級別 - 簡單易懂，適合初學者',
            intermediate: '中級專業級別 - 具備一定技術深度和專業性',
            advanced: '高級專家級別 - 深入的技術細節和專業洞察',
            expert: '頂尖專家級別 - 最高技術水準和創新思維'
        };
        return descriptions[complexity];
    }

    getStyleDescription(style) {
        const descriptions = {
            professional: '專業正式 - 嚴謹的學術和商業表達方式',
            creative: '創意發想 - 鼓勵創新思維和獨特解決方案',
            detailed: '詳細完整 - 全面深入的分析和step-by-step指導',
            concise: '簡潔精要 - 直接明確的要點表達'
        };
        return descriptions[style];
    }

    getLanguagePreference(language) {
        const preferences = {
            'zh-tw': '使用繁體中文，符合台灣地區的用語習慣',
            'zh-cn': '使用简体中文，符合大陆地区的表达方式',
            'en': 'Use English with professional terminology',
            'mixed': '中英文混用，在需要時使用專業英文術語確保準確性'
        };
        return preferences[language];
    }

    getTargetAIDescription(targetAI) {
        const descriptions = {
            'gemini': 'Google Gemini - 擅長理解複雜上下文，支援多模態輸入，對技術和創意內容都有很好的理解能力。優化時應注重邏輯結構和詳細說明。',
            'chatgpt': 'OpenAI ChatGPT - 在對話式交互和創意寫作方面表現卓越，理解能力強，偏好清晰的角色定義和步驟化指導。優化時應強調角色扮演和具體步驟。',
            'claude': 'Anthropic Claude - 以安全性和有用性著稱，在分析和推理方面表現優異，喜歡結構化的提示。優化時應注重邏輯清晰度和安全性考量。'
        };
        return descriptions[targetAI];
    }

    getAIName(targetAI) {
        const names = {
            'gemini': 'Gemini',
            'chatgpt': 'ChatGPT',
            'claude': 'Claude'
        };
        return names[targetAI] || 'Gemini';
    }

    getComplexityLabel(complexity) {
        const labels = {
            'basic': '基礎',
            'intermediate': '中級',
            'advanced': '高級',
            'expert': '專家'
        };
        return labels[complexity] || '中級';
    }

    getStyleLabel(style) {
        const labels = {
            'professional': '專業',
            'creative': '創意',
            'detailed': '詳細',
            'concise': '簡潔'
        };
        return labels[style] || '專業';
    }

    // API Key management
    loadApiKey() {
        return localStorage.getItem('gemini-api-key') || '';
    }

    saveApiKey(apiKey) {
        localStorage.setItem('gemini-api-key', apiKey);
        this.geminiApiKey = apiKey;
        
        // Also update the config file if available
        if (this.geminiConfig) {
            this.geminiConfig.api_key = apiKey;
            this.saveGeminiConfig();
        }
    }

    // Gemini Config management
    createDefaultConfig() {
        return {
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
    }

    loadGeminiConfig() {
        try {
            // Try to load from localStorage first
            const localConfig = localStorage.getItem('gemini-config');
            if (localConfig) {
                const config = JSON.parse(localConfig);
                console.log('📋 從 localStorage 載入配置:', config);
                return config;
            }
            
            console.log('⚠️ localStorage 中沒有配置，使用預設配置');
            
            // Default configuration if no config exists
            const defaultConfig = {
                api_key: this.geminiApiKey || '',
                model: 'gemini-1.5-flash',
                type: 'gemini_api_config',
                base_url: 'https://generativelanguage.googleapis.com/v1beta/models',
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                    stopSequences: []
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            };
            
            console.log('📋 使用預設配置:', defaultConfig);
            return defaultConfig;
        } catch (error) {
            console.error('❌ 載入 Gemini 配置失敗:', error);
            return null;
        }
    }

    saveGeminiConfig() {
        try {
            localStorage.setItem('gemini-config', JSON.stringify(this.geminiConfig));
        } catch (error) {
            console.warn('Failed to save Gemini config:', error);
        }
    }

    updateGeminiConfig(updates) {
        if (this.geminiConfig) {
            Object.assign(this.geminiConfig, updates);
            this.saveGeminiConfig();
        }
    }

    initializeApiKeyModal() {
        // Create API key modal if it doesn't exist
        if (!document.getElementById('api-key-modal')) {
            const modal = document.createElement('div');
            modal.id = 'api-key-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-backdrop" aria-hidden="true"></div>
                <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                    <div class="modal-header">
                        <h2 id="modal-title">設置 Gemini Pro API 金鑰</h2>
                        <button class="modal-close" aria-label="關閉對話框">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>請輸入您的 Google Gemini Pro API 金鑰以啟用AI優化功能：</p>
                        <input type="password" id="api-key-input" placeholder="輸入API金鑰" class="api-key-input">
                        <p class="api-key-help">
                            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener">
                                獲取免費API金鑰 <i class="fas fa-external-link-alt"></i>
                            </a>
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="skip-api-key">暫時跳過</button>
                        <button class="btn-primary" id="save-api-key">儲存並啟用</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add modal event listeners
            modal.querySelector('.modal-close').addEventListener('click', () => this.hideApiKeyModal());
            modal.querySelector('.modal-backdrop').addEventListener('click', () => this.hideApiKeyModal());
            modal.querySelector('#skip-api-key').addEventListener('click', () => this.hideApiKeyModal());
            modal.querySelector('#save-api-key').addEventListener('click', () => this.saveApiKeyFromModal());
            
            // Allow Enter key to save
            modal.querySelector('#api-key-input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.saveApiKeyFromModal();
                }
            });
        }
    }

    showApiKeyModal() {
        const modal = document.getElementById('api-key-modal');
        if (!modal) {
            console.error('❌ API Key 模態框元素未找到');
            alert('請設置 API Key 以使用優化功能');
            return;
        }
        
        const input = modal.querySelector('#api-key-input');
        if (!input) {
            console.error('❌ API Key 輸入框元素未找到');
            return;
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
        
        // Announce to screen readers
        this.announceToScreenReader('請設置API金鑰以啟用AI優化功能');
    }

    hideApiKeyModal() {
        const modal = document.getElementById('api-key-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveApiKeyFromModal() {
        const input = document.getElementById('api-key-input');
        if (!input) {
            console.error('❌ API Key 輸入框元素未找到');
            return;
        }
        
        const apiKey = input.value.trim();
        
        if (apiKey) {
            this.saveApiKey(apiKey);
            this.hideApiKeyModal();
            this.showNotification('API金鑰已儲存！可以開始使用AI優化功能', 'success');
            input.value = '';
        } else {
            this.showNotification('請輸入有效的API金鑰', 'error');
            input.focus();
        }
    }

    // Settings menu management
    showSettingsMenu() {
        // Create settings dropdown if it doesn't exist
        if (!document.getElementById('settings-dropdown')) {
            const dropdown = document.createElement('div');
            dropdown.id = 'settings-dropdown';
            dropdown.className = 'settings-dropdown';
            dropdown.innerHTML = `
                <div class="settings-item" id="api-key-setting">
                    <i class="fas fa-key" aria-hidden="true"></i>
                    <span>API 金鑰設置</span>
                </div>
                <div class="settings-item" id="advanced-config-setting">
                    <i class="fas fa-cogs" aria-hidden="true"></i>
                    <span>進階配置</span>
                </div>
                <div class="settings-item" id="export-config-setting">
                    <i class="fas fa-download" aria-hidden="true"></i>
                    <span>匯出配置</span>
                </div>
                <div class="settings-item" id="import-config-setting">
                    <i class="fas fa-upload" aria-hidden="true"></i>
                    <span>匯入配置</span>
                </div>
            `;
            
            // Position near settings button
            const settingsBtn = document.getElementById('settings-btn');
            const rect = settingsBtn.getBoundingClientRect();
            dropdown.style.position = 'fixed';
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.style.right = '16px';
            
            document.body.appendChild(dropdown);

            // Add event listeners
            dropdown.querySelector('#api-key-setting').addEventListener('click', () => {
                this.hideSettingsMenu();
                this.showApiKeyModal();
            });
            
            dropdown.querySelector('#advanced-config-setting').addEventListener('click', () => {
                this.hideSettingsMenu();
                this.showAdvancedConfigModal();
            });
            
            dropdown.querySelector('#export-config-setting').addEventListener('click', () => {
                this.hideSettingsMenu();
                this.exportConfig();
            });
            
            dropdown.querySelector('#import-config-setting').addEventListener('click', () => {
                this.hideSettingsMenu();
                this.importConfig();
            });

            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target) && e.target.id !== 'settings-btn') {
                        this.hideSettingsMenu();
                    }
                }, { once: true });
            }, 100);
        }
    }

    hideSettingsMenu() {
        const dropdown = document.getElementById('settings-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
    }

    showAdvancedConfigModal() {
        // Create advanced config modal if it doesn't exist
        if (!document.getElementById('advanced-config-modal')) {
            const modal = document.createElement('div');
            modal.id = 'advanced-config-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-backdrop" aria-hidden="true"></div>
                <div class="modal-content advanced-modal" role="dialog" aria-labelledby="advanced-modal-title" aria-modal="true">
                    <div class="modal-header">
                        <h2 id="advanced-modal-title">Gemini API 進階配置</h2>
                        <button class="modal-close" aria-label="關閉對話框">&times;</button>
                    </div>
                    <div class="modal-body advanced-config-body">
                        <div class="config-section">
                            <h3>生成參數</h3>
                            <div class="config-row">
                                <label for="temperature-input">Temperature (創意度)</label>
                                <input type="range" id="temperature-input" min="0" max="1" step="0.1" value="${this.geminiConfig.generation_config.temperature}">
                                <span class="config-value">${this.geminiConfig.generation_config.temperature}</span>
                            </div>
                            <div class="config-row">
                                <label for="top-k-input">Top K</label>
                                <input type="number" id="top-k-input" min="1" max="100" value="${this.geminiConfig.generation_config.topK}">
                            </div>
                            <div class="config-row">
                                <label for="top-p-input">Top P</label>
                                <input type="range" id="top-p-input" min="0" max="1" step="0.05" value="${this.geminiConfig.generation_config.topP}">
                                <span class="config-value">${this.geminiConfig.generation_config.topP}</span>
                            </div>
                            <div class="config-row">
                                <label for="max-tokens-input">最大輸出 Token</label>
                                <input type="number" id="max-tokens-input" min="100" max="4096" value="${this.geminiConfig.generation_config.maxOutputTokens}">
                            </div>
                        </div>
                        
                        <div class="config-section">
                            <h3>模型設置</h3>
                            <div class="config-row">
                                <label for="model-select">模型版本</label>
                                <select id="model-select">
                                    <option value="gemini-pro" ${this.geminiConfig.model === 'gemini-pro' ? 'selected' : ''}>Gemini Pro</option>
                                    <option value="gemini-pro-vision" ${this.geminiConfig.model === 'gemini-pro-vision' ? 'selected' : ''}>Gemini Pro Vision</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="reset-config">恢復默認</button>
                        <button class="btn-primary" id="save-advanced-config">儲存配置</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners
            modal.querySelector('.modal-close').addEventListener('click', () => this.hideAdvancedConfigModal());
            modal.querySelector('.modal-backdrop').addEventListener('click', () => this.hideAdvancedConfigModal());
            modal.querySelector('#reset-config').addEventListener('click', () => this.resetAdvancedConfig());
            modal.querySelector('#save-advanced-config').addEventListener('click', () => this.saveAdvancedConfigFromModal());
            
            // Update config values in real-time
            modal.querySelector('#temperature-input').addEventListener('input', (e) => {
                modal.querySelector('.config-value').textContent = e.target.value;
            });
            
            modal.querySelector('#top-p-input').addEventListener('input', (e) => {
                modal.querySelector('.config-value').textContent = e.target.value;
            });
        }
        
        const modal = document.getElementById('advanced-config-modal');
        modal.classList.remove('hidden');
    }

    hideAdvancedConfigModal() {
        const modal = document.getElementById('advanced-config-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveAdvancedConfigFromModal() {
        const modal = document.getElementById('advanced-config-modal');
        
        const temperature = parseFloat(modal.querySelector('#temperature-input').value);
        const topK = parseInt(modal.querySelector('#top-k-input').value);
        const topP = parseFloat(modal.querySelector('#top-p-input').value);
        const maxTokens = parseInt(modal.querySelector('#max-tokens-input').value);
        const model = modal.querySelector('#model-select').value;
        
        this.updateGeminiConfig({
            model: model,
            generation_config: {
                ...this.geminiConfig.generation_config,
                temperature: temperature,
                topK: topK,
                topP: topP,
                maxOutputTokens: maxTokens
            }
        });
        
        this.hideAdvancedConfigModal();
        this.showNotification('進階配置已更新！', 'success');
    }

    resetAdvancedConfig() {
        // Reset to default values
        this.geminiConfig.generation_config = {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            stopSequences: []
        };
        this.geminiConfig.model = 'gemini-pro';
        
        this.saveGeminiConfig();
        this.hideAdvancedConfigModal();
        this.showNotification('配置已重置為默認值', 'info');
    }

    exportConfig() {
        const config = {
            ...this.geminiConfig,
            api_key: '', // Don't export API key for security
            exported_date: new Date().toISOString(),
            exported_by: 'PromptWizard'
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gemini_config_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('配置已匯出！', 'success');
    }

    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        
                        // Validate config structure
                        if (config.type === 'gemini_api_config' || config.exported_by === 'PromptWizard') {
                            // Merge with current config, preserving API key
                            const currentApiKey = this.geminiConfig.api_key;
                            this.geminiConfig = {
                                ...config,
                                api_key: currentApiKey // Keep current API key
                            };
                            this.saveGeminiConfig();
                            this.showNotification('配置已成功匯入！', 'success');
                        } else {
                            this.showNotification('無效的配置文件格式', 'error');
                        }
                    } catch (error) {
                        this.showNotification('配置文件讀取失敗', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    // 本地優化功能已移除，僅使用 Gemini API 進行優化

    displayResult(result) {
        // Display in full layout
        const outputDiv = document.getElementById('optimized-output');
        if (outputDiv) {
            outputDiv.innerHTML = `<div class="optimized-result">${result.optimized}</div>`;
            
            const tipsDiv = document.getElementById('improvement-tips');
            const tipsList = document.getElementById('tips-list');
            
            if (result.tips.length > 0 && tipsDiv && tipsList) {
                tipsList.innerHTML = result.tips.map(tip => `<li>${tip}</li>`).join('');
                tipsDiv.classList.remove('hidden');
            } else if (tipsDiv) {
                tipsDiv.classList.add('hidden');
            }
        }

        // Display in compact layout
        const outputCompact = document.getElementById('optimized-output') || 
                             document.querySelector('.optimized-output-compact');
        if (outputCompact && !outputDiv) {
            outputCompact.innerHTML = `<div class="optimized-result">${result.optimized}</div>`;
            
            // For compact layout, show tips in a different way if space allows
            if (result.tips.length > 0) {
                const tipsElement = document.getElementById('improvement-tips');
                if (tipsElement) {
                    const tipsList = tipsElement.querySelector('ul') || tipsElement.querySelector('#tips-list');
                    if (tipsList) {
                        tipsList.innerHTML = result.tips.slice(0, 3).map(tip => `<li>${tip}</li>`).join('');
                        tipsElement.classList.remove('hidden');
                    }
                }
            }
        }
    }

    clearOutput() {
        const outputDiv = document.getElementById('optimized-output');
        const tipsDiv = document.getElementById('improvement-tips');
        
        outputDiv.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-lightbulb"></i>
                <p>優化後的提示詞將顯示在這裡</p>
            </div>
        `;
        tipsDiv.classList.add('hidden');
    }

    copyToClipboard() {
        const optimizedText = document.querySelector('.optimized-result');
        if (optimizedText) {
            navigator.clipboard.writeText(optimizedText.textContent).then(() => {
                this.showNotification('已複製到剪貼板！', 'success');
            }).catch(() => {
                this.showNotification('複製失敗', 'error');
            });
        }
    }

    savePrompt() {
        const optimizedText = document.querySelector('.optimized-result');
        if (optimizedText) {
            const blob = new Blob([optimizedText.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `optimized-prompt-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('提示詞已儲存！', 'success');
        }
    }

    sharePrompt() {
        const optimizedText = document.querySelector('.optimized-result');
        if (optimizedText && navigator.share) {
            navigator.share({
                title: 'PromptWizard 優化結果',
                text: optimizedText.textContent,
                url: window.location.href
            }).then(() => {
                this.showNotification('分享成功！', 'success');
            }).catch(() => {
                this.copyToClipboard();
                this.showNotification('已複製分享連結到剪貼板', 'info');
            });
        } else {
            this.copyToClipboard();
        }
    }

    initializeTemplates() {
        return {
            code: [
                {
                    id: 'code-debug',
                    title: '程式碼除錯',
                    description: '幫助診斷和修復程式碼問題',
                    template: '請幫我分析以下程式碼的問題並提供修復方案：[程式碼]',
                    tags: ['除錯', '問題診斷', '修復']
                },
                {
                    id: 'code-review',
                    title: '程式碼審查',
                    description: '進行專業的程式碼品質評估',
                    template: '請對以下程式碼進行全面的審查，包括效能、安全性、可讀性和最佳實踐：[程式碼]',
                    tags: ['審查', '品質', '最佳實踐']
                },
                {
                    id: 'code-optimize',
                    title: '效能優化',
                    description: '提升程式碼執行效率',
                    template: '請分析以下程式碼的效能瓶頸並提供優化建議：[程式碼]',
                    tags: ['效能', '優化', '瓶頸分析']
                }
            ],
            art: [
                {
                    id: 'art-portrait',
                    title: '人物肖像',
                    description: '創作專業人物肖像畫',
                    template: '創作一幅[風格]風格的人物肖像，[詳細描述]，高解析度，專業品質',
                    tags: ['肖像', '人物', '專業']
                },
                {
                    id: 'art-landscape',
                    title: '風景畫作',
                    description: '繪製美麗的自然風景',
                    template: '繪製一幅[季節/時間]的[地點]風景畫，[風格描述]，注重光線和色彩',
                    tags: ['風景', '自然', '光線']
                },
                {
                    id: 'art-concept',
                    title: '概念設計',
                    description: '創意概念藝術設計',
                    template: '設計[主題]的概念藝術，[風格要求]，富有創意和想像力',
                    tags: ['概念', '創意', '設計']
                }
            ],
            ui: [
                {
                    id: 'ui-mobile',
                    title: '移動端界面',
                    description: '設計現代移動應用界面',
                    template: '設計一個[應用類型]的移動端界面，簡潔現代，注重使用者體驗',
                    tags: ['移動端', 'UX', '簡潔']
                },
                {
                    id: 'ui-dashboard',
                    title: '數據儀表板',
                    description: '創建數據視覺化儀表板',
                    template: '設計一個[數據類型]的儀表板界面，清晰的數據呈現，專業外觀',
                    tags: ['數據', '儀表板', '視覺化']
                },
                {
                    id: 'ui-landing',
                    title: '著陸頁設計',
                    description: '設計吸引人的網站著陸頁',
                    template: '設計[產品/服務]的著陸頁，吸引人的視覺設計，高轉換率',
                    tags: ['著陸頁', '轉換', '視覺']
                }
            ]
        };
    }

    renderTemplates() {
        // Render for full layout
        const templatesGrid = document.getElementById('templates-grid');
        if (templatesGrid) {
            const categoryTemplates = this.templates[this.currentCategory];
            
            templatesGrid.innerHTML = categoryTemplates.map(template => `
                <div class="template-card" data-template-id="${template.id}" role="button" tabindex="0"
                     aria-label="載入範本：${template.title}">
                    <h4>${template.title}</h4>
                    <p>${template.description}</p>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            // Add keyboard support for template cards
            document.querySelectorAll('.template-card').forEach(card => {
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.click();
                    }
                });
            });
        }

        // Render for compact layout
        const templatePills = document.getElementById('template-pills');
        if (templatePills) {
            const categoryTemplates = this.templates[this.currentCategory];
            const topTemplates = categoryTemplates.slice(0, 3); // Show only top 3 in compact mode
            
            templatePills.innerHTML = topTemplates.map(template => `
                <div class="template-pill" data-template-id="${template.id}" role="button" tabindex="0"
                     aria-label="載入範本：${template.title}" title="${template.description}">
                    ${template.title}
                </div>
            `).join('');

            // Add keyboard support for template pills
            document.querySelectorAll('.template-pill').forEach(pill => {
                pill.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pill.click();
                    }
                });
            });
        }
    }

    loadTemplate(templateId) {
        const template = this.templates[this.currentCategory].find(t => t.id === templateId);
        if (template) {
            document.getElementById('original-prompt').value = template.template;
            this.showNotification(`已載入範本：${template.title}`, 'success');
        }
    }

    saveToHistory(original, optimized, complexity, targetAI, style, language) {
        const historyItem = {
            timestamp: Date.now(),
            category: this.currentCategory,
            original: original,
            optimized: optimized,
            settings: { complexity, targetAI, style, language }
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('promptwizard-history') || '[]');
        } catch {
            return [];
        }
    }

    saveHistory() {
        localStorage.setItem('promptwizard-history', JSON.stringify(this.history));
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        
        if (!historyList) {
            console.warn('History list element not found');
            return;
        }

        // 條件式渲染：根據是否有歷史記錄來決定顯示內容
        if (this.history.length === 0) {
            historyList.innerHTML = '';
            // 隱藏歷史記錄容器
            historyList.classList.add('empty-state');
            return;
        }

        // 移除空狀態類別
        historyList.classList.remove('empty-state');

        // 使用列表結構來組織歷史記錄資料
        const historyItems = this.history.map((item, index) => `
            <li class="history-item" data-index="${index}" role="button" tabindex="0" 
                aria-label="載入優化記錄：${this.getCategoryName(item.category)}，${this.formatTime(item.timestamp)}">
                <div class="history-item-main">
                    <div class="history-item-header">
                        <div class="history-item-badges">
                            <span class="history-item-category category-${item.category}">${this.getCategoryName(item.category)}</span>
                            <span class="history-item-ai ai-${item.settings?.targetAI || 'gemini'}">${this.getAIName(item.settings?.targetAI || 'gemini')}</span>
                        </div>
                        <span class="history-item-time">${this.formatTime(item.timestamp)}</span>
                    </div>
                    <div class="history-item-content">
                        <div class="history-item-preview">${item.original.substring(0, 30)}${item.original.length > 30 ? '...' : ''}</div>
                        <div class="history-item-meta">
                            <span class="history-item-complexity">${this.getComplexityLabel(item.settings?.complexity)}</span>
                            <span class="history-item-style">${this.getStyleLabel(item.settings?.style)}</span>
                        </div>
                    </div>
                </div>
                <div class="history-item-action">
                    <i class="fas fa-chevron-right" aria-hidden="true"></i>
                </div>
            </li>
        `).join('');

        historyList.innerHTML = `<ul class="history-items-list">${historyItems}</ul>`;

        // Add keyboard support for history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    loadHistoryItem(index) {
        const item = this.history[index];
        if (item) {
            // Switch to the category of the history item
            this.switchCategory(item.category);
            
            // Load the original prompt
            document.getElementById('original-prompt').value = item.original;
            
            // Load settings
            document.getElementById('complexity').value = item.settings.complexity;
            document.getElementById('target-ai').value = item.settings.targetAI || 'gemini';
            document.getElementById('style').value = item.settings.style;
            document.getElementById('language').value = item.settings.language;
            
            // Display the optimized result
            this.displayResult({
                optimized: item.optimized,
                tips: [],
                improvements: []
            });
            
            this.showNotification('已載入歷史記錄', 'success');
        }
    }

    getCategoryName(category) {
        const names = {
            code: '代碼開發',
            art: '繪畫創作',
            ui: 'UI設計'
        };
        return names[category] || category;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: var(--spacing-lg);
            right: var(--spacing-lg);
            padding: var(--spacing-lg) var(--spacing-xl);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            font-weight: 600;
            border: 1px solid;
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        
        // Add CSS animation if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds for better accessibility
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    announceToScreenReader(message) {
        // Create temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    // Compact layout specific methods
    toggleHistory() {
        const historyToggle = document.getElementById('history-toggle');
        const historyDropdown = document.getElementById('history-list');
        
        if (!historyToggle || !historyDropdown) return;
        
        const isExpanded = historyToggle.getAttribute('aria-expanded') === 'true';
        
        historyToggle.setAttribute('aria-expanded', !isExpanded);
        historyDropdown.classList.toggle('hidden', isExpanded);
        
        // Announce to screen readers
        this.announceToScreenReader(isExpanded ? '歷史記錄已收起' : '歷史記錄已展開');
    }

    clearOutput() {
        const outputElement = document.getElementById('optimized-output') || 
                             document.getElementById('optimized-output-compact');
        if (outputElement) {
            outputElement.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-lightbulb" aria-hidden="true"></i>
                    <p>優化結果將在此顯示</p>
                </div>
            `;
        }
        
        // Hide improvement tips
        const tipsElement = document.getElementById('improvement-tips');
        if (tipsElement) {
            tipsElement.classList.add('hidden');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.promptWizard = new PromptWizard();
});

// Global functions for modal interactions
function hideApiKeyModal() {
    if (window.promptWizard) {
        window.promptWizard.hideApiKeyModal();
    }
}

function saveApiKeyFromModal() {
    if (window.promptWizard) {
        window.promptWizard.saveApiKeyFromModal();
    }
}
