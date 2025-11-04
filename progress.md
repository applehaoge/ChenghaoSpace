# 椤圭洰杩涘害璁板綍锛圥ROGRESS.md锛?

## 馃З 姒傝堪
- 椤圭洰鍚嶇О锛欳henghaoSpace
- 绫诲瀷锛欰I Chat Demo锛堝墠鍚庣鑷爺锛?
- 褰撳墠鑳藉姏锛氳亰澶?UI銆丏oubao Provider 鎺ュ叆銆侀檮浠朵笂涓嬫枃銆佷細璇濊蹇?
- 鐩爣锛氫竴鍛ㄥ唴瀹屾垚鍙姇绠€鍘嗙殑 Demo锛圧AG銆佸弻 Provider銆佸鍣ㄥ寲閮ㄧ讲銆佸浘鏂囨秷鎭€佹寔涔呰蹇嗭級



鐜板湪鐨勮瘔姹傛槸锛氭妸 doubao-seed-1-6-flash 妯″瀷姝ｅ紡鎺ュ叆褰撳墠椤圭洰锛岃鍚庣鑳芥妸鐢ㄦ埛涓婁紶鐨勫浘鐗囬€佺粰妯″瀷璇嗗埆骞惰繑鍥炴枃瀛楁弿杩帮紝鑰岀幇鍦ㄨ繖鍧楀姛鑳借繕娌℃墦閫氥€?

鍙互鍒嗘垚杩欎簺姝ラ鏉ュ疄鐜帮細

姊崇悊杈撳叆杈撳嚭绾︽潫锛氱‘璁ゅ墠绔笂浼犵殑闄勪欢鍦ㄥ悗绔槸鎬庢牱瀛樺偍鐨勶紙渚嬪淇濆瓨璺緞銆佹敮鎸佺殑 MIME锛夛紝浠ュ強甯屾湜杩斿洖缁欏墠绔殑鍥剧墖鎻忚堪/璀﹀憡瀛楁鏍煎紡銆?
灏佽 Doubao 鍥剧墖鍒嗘瀽鏈嶅姟锛氬湪 server/src/services 涓嬫柊澧炰竴涓笓闂ㄨ皟鐢?Doubao 鐨勫浘鍍忚瘑鍒ā鍧楋紙鍙弬鑰冪幇鏈?imageAnalyzer.ts 缁撴瀯锛夛紝璐熻矗鎶婂浘鐗囪浆鎴愬悎閫傜殑 image_url锛堟垨 base64 data URL锛夊苟璋冪敤 chat/completions 鎺ュ彛銆?
鎵╁睍 provider factory锛氬湪 providers/doubaoProvider.ts 閲岃ˉ鍏呬竴涓鐞嗗浘鐗囩殑鍏ュ彛锛屾垨鏂板 DoubaoImageService锛屼粠鐜鍙橀噺璇诲彇妯″瀷銆丄PI base锛屽苟澶嶇敤 proxy 閫昏緫銆?
鏆撮湶鍚庣鎺ュ彛锛氬湪 Fastify 璺敱閲屾墿灞?/api/upload 鎴栨柊澧?/api/image-insight锛屽湪闄勪欢鎵爜娴佺▼閲岃皟鐢ㄦ柊鏈嶅姟锛屾妸鐢熸垚鐨?caption銆乽sage 淇℃伅淇濆瓨鍒版暟鎹簱/鍐呭瓨骞惰繑鍥炵粰鍓嶇銆?
鍓嶇鎺ュ叆灞曠ず锛氬湪 front/src/components/chat/ChatInterface.tsx 绛夊鐩戝惉鍚庣杩斿洖鐨勫浘鐗囨弿杩帮紝娓叉煋鍦ㄩ檮浠跺崱鐗囨垨 AI 鍥炲閲岋紝鍚屾椂纭繚 Toast/鎻愮ず鏂囨瑕嗙洊澶辫触鍦烘櫙銆?
琛ュ厖娴嬭瘯涓庢枃妗ｏ細涓烘柊鏈嶅姟鍐?Vitest 鍗曟祴锛坢ock fetch锛夛紝骞跺湪 progress.md銆丷EADME.md 鏇存柊鏂扮殑鑷姝ラ锛岀‘淇?pnpm --dir server test 涓?pnpm --dir front smoke 閮介€氳繃銆?
鎸夎繖涓『搴忓仛锛屽氨鑳芥妸鈥滄ā鍨嬭瘑鍒浘鐗団€濊繖鏉￠摼璺ǔ濡ユ帴鍏ョ幇鏈夐」鐩€?

閭ｄ綘涓€姝ヤ竴姝ュ幓鍋氾紝姣忓仛涓€姝ラ兘瑕佹祴璇曢€氳繃浜嗗啀鍋氫笅涓€姝ワ紙浼佷笟鏄惁瑕佺暀涓嬪崟娴嬶紵锛燂級锛屼笉寰楁敼鍔ㄦ棤鍏冲姛鑳斤紝鏃犲叧浠ｇ爜


## 馃殌 閲嶈鍙樻洿鏃ュ織锛堝€掑簭锛?
- **2025-11-04 首页少儿编程入口**
  - 移除首页顶部多功能标签，仅保留 AI 问答说明并腾出空间
  - 新增“进入少儿编程课堂”按钮，通过 `VITE_KIDS_CODING_URL` 配置跳转到外部学习站点
  - Checks: pnpm --dir front build:client
- **2025-10-31 Chat scroll affordance**
  - Auto-scroll stays enabled when the user is at the bottom; manual scrolling pauses it
  - Floating "scroll to latest" button appears when browsing history
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-10-31 Chat send jump**
  - Sending a new user message now re-enables auto-scroll to keep context fresh
  - Applies setAutoScrollEnabled/scrollToLatest before dispatching request
  - Checks: pnpm --dir front build:client

- **2025-10-31 椤甸潰婊氬姩鎺у埗璋冩暣**
  - Home 绾у埆鎺у埗 html/body overflow锛岀粺涓€鍙栨秷棣栭〉/鑱婂ぉ鍏ㄥ眬婊氬姩鏉?
  - MainContent 寮曞叆鍐呭眰闅愯棌婊氬姩鏉★紝鍙充晶鍐呭淇濇寔鍙祻瑙?
  - 渚ц竟鏍忓搴︽牴鎹旱鍚戝睆骞曡嚜鍔ㄦ斁澶э紝棣栭〉/鑱婂ぉ淇濇寔涓€鑷磋瑙?
  - 鑱婂ぉ鐣岄潰鐢辫鍙ｅ搴︽帶鍒讹紙maxWidth 92vw锛夛紝瓒呭灞忚緭鍏ュ尯鑷€傚簲鎷変几
  - 渚ц竟鏍忔敼涓?flex h-full锛屽亸楂樺睆骞曚换鍔″垪琛ㄨ嚜鍔ㄨ创搴?

- **2025-10-29 骞抽摵鍚庣鐩綍 + 鍗曞厓娴嬭瘯鎵╁睍 + 鍗忎綔瑙勮寖**
  - 灏?server/server/src 骞抽摵涓?server/src锛屾竻鐞嗗巻鍙叉瀯寤轰骇鐗?
  - 鏇存柊鏋勫缓鑴氭湰锛宲npm --dir server build / pnpm --dir server test 鍧囧凡閫氳繃
  - 寮曞叆 Vitest锛屾柊澧?
sHelpers銆?ttachmentContext 涓庡墠绔? iService 鍗曞厓娴嬭瘯
  - 鏂板 smoke.ps1 涓?pnpm --dir front smoke 鑴氭湰锛屾矇娣€鏈€灏忓寲鑷娴佺▼
  - README 澧炶ˉ AI 鎻愮ず璇嶃€佹墜鍔ㄩ獙璇佹竻鍗曞強鑴氭湰璇存槑
  - 淇鍙戦€佸悗闄勪欢鍗＄墖寤惰繜娑堝け鐨勯棶棰橈紙鍙戦€佸け璐ユ椂鑷姩鎭㈠闄勪欢锛?
  - 淇棣栭〉涓婁紶娑堟伅鍦ㄨ亰澶╃晫闈笉鏄剧ず闄勪欢鍗＄墖鐨勯棶棰橈紝鏀寔鍒濆娑堟伅鐨勯檮浠跺悓姝ュ睍绀?
- **2025-10-28 闄勪欢涓婁笅鏂囦笌涓婁紶鎸佷箙鍖?*
  - Fastify 澧炲姞 /uploads/:fileName 闈欐€佽矾鐢憋紝缁熶竴鐢熸垚涓嬭浇鍦板潃
  - 鍓嶇涓婁紶閽╁瓙淇濆瓨杩滅 URL锛屽埛鏂板悗鍥剧墖浠嶈兘灞曠ず
  - 鏈湴瀛樻。璇诲彇鏃惰嚜鍔ㄨˉ榻愬巻鍙查檮浠剁殑璁块棶閾炬帴
- **2025-10-27 澶氫細璇濋殧绂?+ Streaming 鍗囩骇锛堣繘琛屼腑锛?*
  - 鏂板娑堟伅浠撳簱 messagesRegistryRef锛岄槻姝㈠垏鎹㈠璇濅覆鍙?
  - Streaming 涓?sessionId 缁戝畾锛岄伩鍏嶈法浼氳瘽姹℃煋
- **2025-10-27 Loading Toast 鐢熷懡鍛ㄦ湡绠＄悊**
  - 浣跨敤 	ry/finally 纭繚 toast 姝ｇ‘鍏抽棴
  - 淇澶辫触璇锋眰瀵艰嚧 Spinner 鍗℃鐨勯棶棰?
- **2025-10-27 椤甸潰妯″潡鍖栬皟鏁?*
  - Home 椤甸潰鎷嗗垎涓?chat/銆?ttachments/銆乭ome/ 妯″潡
  - 鑱岃矗鏇磋仛鐒︼紝澶嶇敤鎬ф彁鍗?
- **2025-10-23 Markdown 浠ｇ爜鍧楀鍒舵寜閽?*
  - 鎵€鏈変唬鐮佸潡鎻愪緵鐙珛澶嶅埗鎸夐挳锛屽吋瀹规棤 Clipboard API 鍦烘櫙
  - Toast 鎻愮ず鎴愬姛 / 澶辫触
- **2025-10-23 杈撳叆浜や簰浼樺寲**
  - Enter 鍙戦€佹秷鎭紝Shift+Enter 鎹㈣
  - 瀵瑰叾浠栬緭鍏ュ満鏅棤鍓綔鐢?
- **2025-10-23 浼氳瘽鍒濆鍖栦慨澶?*
  - 寮曞叆 lastConversationIdRef锛岃В鍐?StrictMode 鍙屾覆鏌撳鑷寸殑閲嶅瀵硅瘽
- **2025-10-22 浼氳瘽璁板繂鎸佷箙鍖?*
  - ConversationMemoryManager 鏀寔鏂囦欢鎸佷箙鍖栵紝榛樿鐩綍 server_data/memory
  - 璁″垝鎵╁睍 Redis / pgvector
- **2025-10-22 鑷€傚簲涓存椂鏂规**
  - 瀹藉睆缂╂斁涓庢孩鍑轰繚鎶わ紝鏆傛椂瑙勯伩鏂眰闂
- **2025-10-22 Provider 璺敱淇**
  - .env 閰嶇疆瀵归綈锛岀鍙ｅ崰鐢ㄦ竻鐞?
  - /api/chat 杩斿洖 provider: doubao
- **2025-10-21 棣栭〉 UI 杩唬**
  - 鑱婂ぉ鍖哄煙鍗＄墖鍖栥€佸巻鍙插尯鍙姌鍙犮€佹帹鑽愭彁绀哄睍绀?
- **2025-10-21 鍓嶇鎺ュ叆璞嗗寘妯″瀷**
  -  iService 璋冪敤 /api/chat
  - 鏀寔妯″瀷杈撳嚭娴佸紡鍝嶅簲
- **2025-10-21 Doubao Provider 閫傞厤**
  - 鏂板 DoubaoProvider锛岄粯璁ゆā鍨?doubao-seed-1-6-flash
- **2025-10-20 鐜涓庝唬鐞嗛厤缃?*
  - .env.example 琛ラ綈锛?gitignore 灞忚斀鏁忔劅鏂囦欢
  - 鎴愬姛缁曡繃 OpenAI 缃戠粶闄愬埗

## 馃攳 璇婃柇鎽樿
- 鍏稿瀷闂锛欵TIMEDOUT 鈫?妫€鏌ヤ唬鐞嗕笌缃戠粶杩為€氭€?
- 甯哥敤娴嬭瘯鍛戒护锛?
  `ash
  curl -v http://localhost:8082/v1/models
  curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"query":"娴嬭瘯OpenAI杩炴帴"}' \
    http://localhost:8302/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
  `

## 馃寪 浠ｇ悊閰嶇疆澶囧繕
- Windows 涓存椂绀轰緥锛?
  `powershell
  ='http://127.0.0.1:33210'
  ='http://127.0.0.1:33210'
  ='socks5://127.0.0.1:33211'
  pnpm --dir server dev
  `
- 瀵嗛挜涓庝唬鐞嗗嚟鎹粎淇濈暀鍦ㄦ湰鍦帮紝閮ㄧ讲鏃舵敼鐢ㄧ幆澧冨彉閲忔墭绠°€?
- **2025-10-29 Doubao connectivity smoke test**
  - Added server/scripts/test-doubao-image.mjs to verify doubao-seed-1-6-flash reads image prompts without touching app code
  - Confirmed connectivity and successful image caption response using local base64 upload sample
- **2025-10-30 璞嗗寘鍥惧儚鎻忚堪鎺ュ叆**
  - 鏂板 server/src/services/doubaoImageService.ts锛屽皝瑁呰眴鍖呭浘鍍忚瘑鍒苟鍥炶惤鍒?OpenAI 鍏冩暟鎹€?
  - 鎵╁睍 processChatRequest 瑙ｆ瀽闄勪欢涓婁笅鏂囷紝杩斿洖 caption銆亀arnings銆乽sage 绛変俊鎭€?
  - 鍓嶇鍚屾灞曠ず鍥惧儚鎻忚堪涓庤鍛婏紝琛ュ厖 toast 鎻愮ず鍙婇檮浠跺崱鐗囨牱寮忋€?
  - 娴嬭瘯锛歱npm --dir server test锛沺npm --dir front build:client銆?
- **2025-10-30 鏂囨。瑙ｆ瀽鎺ュ叆**
  - 鏂板 documentParser 鏈嶅姟锛岀粺涓€澶勭悊 TXT/PDF/DOCX锛屽苟鍦ㄩ檮浠朵笂涓嬫枃鐢熸垚鎽樿涓庤鍛娿€?
  - 鎵╁睍 buildAttachmentContext 鏀寔鍥剧墖 + 鏂囨。鍒嗘敮锛屾暣鐞嗕笂涓嬫枃鍧楀苟杩斿洖缁熶竴缁撴瀯銆?
  - 娴嬭瘯锛歱npm --dir server test锛沺npm --dir server build銆?
- **2025-10-30 Excel 瑙ｆ瀽鏀寔**
  - 鎵╁睍 documentParser 鏀寔 XLSX锛岄檺鍒惰〃鏍艰鍒楀苟鐢熸垚琛ㄥご/鏁版嵁鎽樿銆?
  - 缁熶竴涓婁笅鏂囪緭鍑猴紝attachmentContext 鑷姩鎷兼帴宸ヤ綔琛ㄦ憳瑕佷笌璀﹀憡銆?
  - 娴嬭瘯锛歱npm --dir server test銆?
- **2025-10-30 鏂板缓瀵硅瘽琛屼负浼樺寲**
  - 鐐瑰嚮鈥滃紑鍚柊鑱婂ぉ鈥濅粎閲嶇疆鐣岄潰锛岀瓑寰呯敤鎴疯緭鍏ュ悗鍐嶅垱寤轰細璇濄€?
  - 鍒濇鍔犺浇浠嶉粯璁ら€変腑鏈€杩戜細璇濓紝鎵嬪姩杩涘叆鏂板璇濇椂闅忔満鍒嗛厤鍥炬爣涓庨鑹层€?
  - 楠岃瘉锛歱npm --dir front build:client銆?
- **2025-10-31 Streaming output cadence**
  - useConversationController introduces token-level buffering with adaptive flush cadence for GPT-like typing
  - Adaptive delay + auto-scroll now smooth the early cadence while the caret indicator shows ongoing generation
  - ChatMessage adds a softened bounce-in animation plus typing indicator for active AI replies
  - Tests: pnpm --dir front build:client; pnpm --dir server test



