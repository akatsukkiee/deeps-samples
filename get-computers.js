const axios = require('axios');

// Deep Security Manager の設定
const config = {
    dsm_url: 'https://your-dsm-host:4119', // Deep Security Manager のURL
    api_key: 'your-api-key', // APIキー
};

// コンピューターリストを取得する関数
async function getComputers() {
    try {
        const response = await axios({
            method: 'GET',
            url: `${config.dsm_url}/api/computers`,
            headers: {
                'api-version': 'v1',
                'api-secret-key': config.api_key,
                'Content-Type': 'application/json',
            },
            validateStatus: false,
        });

        if (response.status === 200) {
            console.log('コンピューターリスト:', JSON.stringify(response.data, null, 2));
            return response.data;
        } else {
            console.error('エラー:', response.status, response.data);
            throw new Error(`APIリクエストが失敗しました: ${response.status}`);
        }
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
        throw error;
    }
}

// 関数を実行
getComputers().catch(error => {
    console.error('実行エラー:', error);
    process.exit(1);
}); 