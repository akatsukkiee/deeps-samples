const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Deep Security Manager の設定
const config = {
    dsm_url: 'https://your-dsm-host:4119', // Deep Security Manager のURL
    api_key: 'your-api-key', // APIキー
};

// ホスト名リストファイルのパス
const HOSTNAME_FILE = 'hostnames.txt';

// ホスト名リストをファイルから読み込む関数
function readHostnames() {
    try {
        const filePath = path.join(__dirname, HOSTNAME_FILE);
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    } catch (error) {
        console.error('ホスト名リストファイルの読み込みに失敗しました:', error.message);
        throw error;
    }
}

// コンピューターを検索する関数
async function searchComputers(hostnames) {
    const results = [];
    
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
            const computers = response.data;
            
            // 各ホスト名に対して検索
            for (const hostname of hostnames) {
                const found = computers.find(computer => 
                    computer.hostName.toLowerCase() === hostname.toLowerCase()
                );
                
                if (found) {
                    results.push({
                        hostname: hostname,
                        found: true,
                        computer: found
                    });
                } else {
                    results.push({
                        hostname: hostname,
                        found: false
                    });
                }
            }
            
            return results;
        } else {
            console.error('エラー:', response.status, response.data);
            throw new Error(`APIリクエストが失敗しました: ${response.status}`);
        }
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
        throw error;
    }
}

// メイン処理
async function main() {
    try {
        // ホスト名リストを読み込む
        const hostnames = readHostnames();
        console.log('検索対象ホスト名:', hostnames);

        // Deep Securityで検索
        const results = await searchComputers(hostnames);

        // 結果を表示
        console.log('\n検索結果:');
        results.forEach(result => {
            if (result.found) {
                console.log(`✅ ${result.hostname} - 見つかりました`);
                console.log(`   ID: ${result.computer.ID}`);
                console.log(`   IPアドレス: ${result.computer.ipAddress}`);
                console.log(`   ステータス: ${result.computer.computerStatus}`);
            } else {
                console.log(`❌ ${result.hostname} - 見つかりませんでした`);
            }
            console.log('---');
        });
    } catch (error) {
        console.error('実行エラー:', error);
        process.exit(1);
    }
}

// 実行
main(); 