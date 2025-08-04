// Gemini API 配置初始化腳本
(function initializeGeminiConfig() {
    // 檢查是否已有本地配置
    const existingConfig = localStorage.getItem('gemini-config');
    const existingApiKey = localStorage.getItem('gemini-api-key');
    
    // 如果沒有配置，則嘗試從配置文件加載
    if (!existingConfig && !existingApiKey) {
        fetch('./gemini_api_config.json')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Config file not found');
            })
            .then(config => {
                // 儲存配置到本地存儲
                localStorage.setItem('gemini-config', JSON.stringify(config));
                
                // 如果配置文件包含API金鑰，也儲存它
                if (config.api_key && config.api_key.trim()) {
                    localStorage.setItem('gemini-api-key', config.api_key);
                    console.log('✅ Gemini API 配置已自動載入');
                    
                    // 顯示成功通知
                    if (window.promptWizard) {
                        window.promptWizard.showNotification('Gemini API 配置已自動載入！', 'success');
                    }
                }
            })
            .catch(error => {
                console.log('ℹ️ 使用默認配置設置');
                // 如果配置文件不存在，使用默認配置
                const defaultConfig = {
                    api_key: '',
                    model: 'gemini-pro',
                    type: 'gemini_api_config',
                    base_url: 'https://generativelanguage.googleapis.com/v1beta/models',
                    generation_config: {
                        temperature: 0.7,
                        top_k: 40,
                        top_p: 0.95,
                        max_output_tokens: 2048,
                        stop_sequences: []
                    },
                    safety_settings: [
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
                localStorage.setItem('gemini-config', JSON.stringify(defaultConfig));
            });
    } else {
        console.log('✅ 使用現有的 Gemini API 配置');
    }
    
    // 檢查API金鑰狀態
    setTimeout(() => {
        const apiKey = localStorage.getItem('gemini-api-key');
        if (apiKey && apiKey.trim()) {
            console.log('🔑 API 金鑰已設置，可以使用 AI 優化功能');
        } else {
            console.log('⚠️ 請設置 API 金鑰以啟用 AI 優化功能');
        }
    }, 100);
})();
