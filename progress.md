- **2025-11-07 KidsCoding 面板溢出修复**
  - 调整 PANEL_BASE_CLASS，保留任务/结果列的 overflow-hidden，仅让代码面板可滚动，保证底部控制栏可见；顶部按钮成为唯一控制台入口。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding 标题栏统一**
  - 引入 SECTION_HEADER_CLASS，任务/代码/结果三栏标题高度与分隔线完全一致，顶边齐平更规整。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

**2025-11-07 KidsCoding 页面加高**
  - 上调 RESPONSIVE_PANEL_HEIGHT_CLASS 至 md≥560px、lg≈85vh、xl 780px，整页三列同步增高，AI 助手和运行结果不再被压缩。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

**2025-11-07 KidsCoding 编辑器高度修复**
  - 恢复三列 overflow-hidden，并给代码面板增加 min-h-0 / pb-28，确保底部按钮与控制台入口始终可见且三栏高度一致。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

项目进度记录（PROGRESS.md�?

- **2025-11-07 KidsCoding 标题压缩**
  - 任务说明标题改为单行（徽标 + 标题 + 刷新按钮），删除代码编辑器副标题，只保留标签文本，减少顶部高度浪费。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding 面板再抬高**
  - 更新 RESPONSIVE_PANEL_HEIGHT_CLASS 为 md:min-h[480px]/lg:75vh/xl:680px（上限 760px），桌面端视窗进一步拉高，AI 编程助手区域输入框完整可见。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding 面板抬高**
  - 调整 RESPONSIVE_PANEL_HEIGHT_CLASS 为 md:min-h-[420px] lg:h-[68vh] xl:h-[620px] lg:max-h-[700px]，桌面端视窗恢复更高高度，AI 编程助手输入框不再被裁切。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding 自适应高度**
  - 引入 RESPONSIVE_PANEL_HEIGHT_CLASS（md ≥360px，lg=60vh，xl=520px，上限 600px），三栏在桌面端获得固定视窗且随屏幕高度变化，内部内容超出时使用现有 overflow 滚动。
  - Checks: pnpm --dir server test; pnpm --dir front build:client



- **2025-11-07 KidsCoding 400px 对齐**
  - 将 DESKTOP_PANEL_HEIGHT_CLASS 与 DESKTOP_RESULT_HEIGHT_CLASS 均设为 400px 并保留 lg:h-full，三栏高度一致，顶部/底部自然齐平，后续再调只需改常量。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding AI ��ѹ��**
  - ��ȡ�������� DESKTOP_RESULT_HEIGHT_CLASS��400px�������������Ϊ AI �����׷�� lg:self-end lg:h-auto������߶�ѹ��Լ 1/3�������м���ʹ�� 600px ���������� items-stretch���ײ�������ƽ��
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding 高度微调**
  - 调整 DESKTOP_PANEL_HEIGHT_CLASS �?min-h �?680px 降到 600px，三栏依旧通过 h-full 联动贴底，但整体高度更紧凑、易维护�?
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-06 少儿编程主页迁移**
  - 迁入 kidsCoding Hero/Features/课程/家长/价格/打卡组件，并封装上下文与主题 Hook
  - 新增编程学堂 `/kids-coding/editor` 页面（含编程助手模态、AI 对话、全屏演示），导航入口联�?
  - 抽离 `KidsCodingProvider` 共享认证状态，确保主页与学堂的登录信息一�?
  - 恢复编程学堂左右侧边栏的折叠/展开操作，与原项目交互一�?
  - Checks: pnpm --dir front build:client

- **2025-11-05 缁勪欢閲嶆瀯涓庡伐浣滃尯鏁寸悊**
  - 鎻愮偧姣忔棩鎵撳�?杩愬娍鍖哄煙涓虹嫭绔?DailyProgressPanel 缁勪欢锛孧ainContent 浠呬繚鐣欐暟鎹�?
  - 鏂板�?pnpm-workspace.yaml 涓庢牴绾?package.json锛岀粺涓�?front/server 鏋勫缓涓庢祴璇曞叆鍙?
  - 鏂板璇煶杈撳叆鎸夐挳锛屽皝瑁?useSpeechToText Hook锛岃闊宠浆鏂囧瓧鑷姩濉厖杈撳叆�?


- **2025-11-05 锟斤拷页锟斤拷锟斤拷锟斤拷一锟藉�?*
  - 锟津卡成癸拷锟斤拷锟斤拷锟斤拷锟斤拷锟皆讹拷锟叫伙拷为锟斤拷锟狡匡拷片锟斤拷锟狡筹拷双锟叫诧拷锟斤拷锟斤拷锟酵放癸拷锟秸硷拷
  - 锟斤拷锟狡匡拷片展示锟斤拷燃锟斤拷锟斤拷�?锟斤拷锟侥帮拷锟斤拷锟斤拷签锟斤拷示锟斤拷未锟斤拷时锟斤拷锟斤拷锟斤拷锟轿徽�?
-  锟斤拷锟轿伙拷锟斤拷锟轿拷锟斤拷锟?300锟斤�?50 Medium Rectangle 锟竭寸，锟狡讹拷锟斤拷展示锟侥帮拷锟斤拷锟斤拷协锟斤�?
-  锟睫革拷锟津卡猴拷锟斤拷位锟斤拷失锟斤拷锟斤拷锟解，锟斤拷锟斤拷展示时锟斤拷锟斤拷锟斤拷员锟斤拷锟斤拷锟斤拷每占�?
-  锟斤拷锟斤拷锟斤拷页锟斤拷锟斤拷/锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷祝锟斤拷谩锟斤拷群瓶占洹逼凤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷屑锟斤拷
  - 锟斤拷锟斤拷锟狡凤拷坪锟斤拷锟斤拷锟斤拷斜锟斤拷锟轿拷锟斤拷妆锟狡斤拷锟斤拷锟斤拷锟斤拷锟捷憋拷签锟诫按钮去锟斤拷锟斤拷锟斤拷锟斤拷强锟斤拷锟斤拷锟缴撅拷锟斤拷锟斤拷锟斤拷锟斤拷\n  - 去锟斤拷品锟斤拷 BETA 锟斤拷签锟斤拷锟脚大“橙浩空间”锟斤拷锟斤拷强锟斤拷品锟斤拷识锟斤�?
  - 锟斤拷一锟斤拷微锟斤拷锟斤拷锟斤拷锟斤拷啵凤拷锟斤拷锟斤拷一毡辍拷锟斤拷狻拷锟斤拷锟斤拷目锟斤拷同一锟斤拷锟斤拷
  - Checks: pnpm --dir server test; pnpm --dir front build:client

## 馃�?姒傝�?
- 椤圭洰鍚嶇О锛欳henghaoSpace
- 绫诲瀷锛欰I Chat Demo锛堝墠鍚庣鑷爺锟?
- 褰撳墠鑳藉姏锛氳亰锟?UI銆丏oubao Provider 鎺ュ叆銆侀檮浠朵笂涓嬫枃銆佷細璇濊锟?
- 鐩爣锛氫竴鍛ㄥ唴瀹屾垚鍙姇绠€鍘嗙�?Demo锛圧AG銆佸�?Provider銆佸鍣ㄥ寲閮ㄧ讲銆佸浘鏂囨秷鎭€佹寔涔呰蹇嗭級



鐜板湪鐨勮瘔姹傛槸锛氭妸 doubao-seed-1-6-flash 妯″瀷姝ｅ紡鎺ュ叆褰撳墠椤圭洰锛岃鍚庣鑳芥妸鐢ㄦ埛涓婁紶鐨勫浘鐗囬€佺粰妯″瀷璇嗗埆骞惰繑鍥炴枃瀛楁弿杩帮紝鑰岀幇鍦ㄨ繖鍧楀姛鑳借繕娌℃墦閫氾拷?

鍙互鍒嗘垚杩欎簺姝ラ鏉ュ疄鐜帮�?

姊崇悊杈撳叆杈撳嚭绾︽潫锛氱‘璁ゅ墠绔笂浼犵殑闄勪欢鍦ㄥ悗绔槸鎬庢牱瀛樺偍鐨勶紙渚嬪淇濆瓨璺緞銆佹敮鎸佺�?MIME锛夛紝浠ュ強甯屾湜杩斿洖缁欏墠绔殑鍥剧墖鎻忚堪/璀﹀憡瀛楁鏍煎紡�?
灏佽�?Doubao 鍥剧墖鍒嗘瀽鏈嶅姟锛氬�?server/src/services 涓嬫柊澧炰竴涓笓闂ㄨ皟�?Doubao 鐨勫浘鍍忚瘑鍒ā鍧楋紙鍙弬鑰冪幇锟?imageAnalyzer.ts 缁撴瀯锛夛紝璐熻矗鎶婂浘鐗囪浆鎴愬悎閫傜�?image_url锛堟�?base64 data URL锛夊苟璋冪敤 chat/completions 鎺ュ彛锟?
鎵╁�?provider factory锛氬�?providers/doubaoProvider.ts 閲岃ˉ鍏呬竴涓鐞嗗浘鐗囩殑鍏ュ彛锛屾垨鏂板�?DoubaoImageService锛屼粠鐜鍙橀噺璇诲彇妯″瀷銆丄PI base锛屽苟澶嶇敤 proxy 閫昏緫锟?
鏆撮湶鍚庣鎺ュ彛锛氬湪 Fastify 璺敱閲屾墿�?/api/upload 鎴栨柊锟?/api/image-insight锛屽湪闄勪欢鎵爜娴佺▼閲岃皟鐢ㄦ柊鏈嶅姟锛屾妸鐢熸垚锟?caption銆乽sage 淇℃伅淇濆瓨鍒版暟鎹簱/鍐呭瓨骞惰繑鍥炵粰鍓嶇�?
鍓嶇鎺ュ叆灞曠ず锛氬湪 front/src/components/chat/ChatInterface.tsx 绛夊鐩戝惉鍚庣杩斿洖鐨勫浘鐗囨弿杩帮紝娓叉煋鍦ㄩ檮浠跺崱鐗囨�?AI 鍥炲閲岋紝鍚屾椂纭繚 Toast/鎻愮ず鏂囨瑕嗙洊澶辫触鍦烘櫙锟?
琛ュ厖娴嬭瘯涓庢枃妗ｏ細涓烘柊鏈嶅姟�?Vitest 鍗曟祴锛坢ock fetch锛夛紝骞跺湪 progress.md銆丷EADME.md 鏇存柊鏂扮殑鑷姝ラ锛岀‘锟?pnpm --dir server test �?pnpm --dir front smoke 閮介€氳繃锟?
鎸夎繖涓『搴忓仛锛屽氨鑳芥妸鈥滄ā鍨嬭瘑鍒浘鐗団€濊繖鏉￠摼璺ǔ濡ユ帴鍏ョ幇鏈夐」鐩拷?

閭ｄ綘涓€姝ヤ竴姝ュ幓鍋氾紝姣忓仛涓€姝ラ兘瑕佹祴璇曢€氳繃浜嗗啀鍋氫笅涓€姝ワ紙浼佷笟鏄惁瑕佺暀涓嬪崟娴嬶紵锛燂級锛屼笉寰楁敼鍔ㄦ棤鍏冲姛鑳斤紝鏃犲叧浠ｇ爜


## 馃殌 閲嶈鍙樻洿鏃ュ織锛堝€掑簭�?
- **2025-11-04 锟斤拷页锟劫讹拷锟斤拷锟斤拷锟斤�?*
  - 锟狡筹拷锟斤拷页锟斤拷锟斤拷锟洁功锟杰憋拷签锟斤拷锟斤拷锟斤拷锟斤拷 AI 锟绞达拷说锟斤拷锟斤拷锟节筹拷锟秸硷�?
  - 锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟劫讹拷锟斤拷炭锟斤拷谩锟斤拷锟脚ワ拷锟酵拷�?`VITE_KIDS_CODING_URL` 锟斤拷锟斤拷锟斤拷转锟斤拷锟解部学习站锟斤拷
  - 锟斤拷锟斤拷锟斤拷瞥锟斤拷锟绞碉拷使锟斤拷艿锟阶拷锟斤拷锟节ｏ拷锟斤拷锟斤拷锟斤拷劢锟斤拷锟斤拷锟斤拷锟斤拷俣锟斤拷锟教讹拷位
  - 锟斤拷页锟斤拷锟斤拷锟绞碉拷锟斤拷锟斤拷婊晃匡拷沾�?+ 锟斤拷锟斤拷锟斤拷锟斤拷模锟介，支锟街憋拷锟截存储锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷
  - 微锟斤拷锟斤拷锟斤拷锟斤拷啵拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟街拷锟斤拷锟斤拷锟斤拷
  - Checks: pnpm --dir front build:client
- **2025-10-31 Chat scroll affordance**
  - Auto-scroll stays enabled when the user is at the bottom; manual scrolling pauses it
  - Floating "scroll to latest" button appears when browsing history
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-10-31 Chat send jump**
  - Sending a new user message now re-enables auto-scroll to keep context fresh
  - Applies setAutoScrollEnabled/scrollToLatest before dispatching request
  - Checks: pnpm --dir front build:client

- **2025-10-31 椤甸潰婊氬姩鎺у埗璋冩�?*
  - Home 绾у埆鎺у埗 html/body overflow锛岀粺涓€鍙栨秷棣栭�?鑱婂ぉ鍏ㄥ眬婊氬姩锟?
  - MainContent 寮曞叆鍐呭眰闅愯棌婊氬姩鏉★紝鍙充晶鍐呭淇濇寔鍙祻锟?
  - 渚ц竟鏍忓搴︽牴鎹旱鍚戝睆骞曡嚜鍔ㄦ斁澶э紝棣栭�?鑱婂ぉ淇濇寔涓€鑷磋锟?
  - 鑱婂ぉ鐣岄潰鐢辫鍙ｅ搴︽帶鍒讹紙maxWidth 92vw锛夛紝瓒呭灞忚緭鍏ュ尯鑷€傚簲鎷変几
  - 渚ц竟鏍忔敼锟?flex h-full锛屽亸楂樺睆骞曚换鍔″垪琛ㄨ嚜鍔ㄨ创�?

- **2025-10-29 骞抽摵鍚庣鐩�?+ 鍗曞厓娴嬭瘯鎵╁�?+ 鍗忎綔瑙勮寖**
  - �?server/server/src 骞抽摵锟?server/src锛屾竻鐞嗗巻鍙叉瀯寤轰骇�?
  - 鏇存柊鏋勫缓鑴氭湰锛宲npm --dir server build / pnpm --dir server test 鍧囧凡閫氳繃
  - 寮曞�?Vitest锛屾柊锟?
sHelpers�?ttachmentContext 涓庡墠锟? iService 鍗曞厓娴嬭瘯
  - 鏂板�?smoke.ps1 �?pnpm --dir front smoke 鑴氭湰锛屾矇娣€鏈€灏忓寲鑷娴佺�?
  - README 澧炶ˉ AI 鎻愮ず璇嶃€佹墜鍔ㄩ獙璇佹竻鍗曞強鑴氭湰璇存�?
  - 淇鍙戦€佸悗闄勪欢鍗＄墖寤惰繜娑堝け鐨勯棶棰橈紙鍙戦€佸け璐ユ椂鑷姩鎭㈠闄勪欢锟?
  - 淇棣栭〉涓婁紶娑堟伅鍦ㄨ亰澶╃晫闈笉鏄剧ず闄勪欢鍗＄墖鐨勯棶棰橈紝鏀寔鍒濆娑堟伅鐨勯檮浠跺悓姝ュ睍锟?
- **2025-10-28 闄勪欢涓婁笅鏂囦笌涓婁紶鎸佷箙锟?*
  - Fastify 澧炲�?/uploads/:fileName 闈欐€佽矾鐢憋紝缁熶竴鐢熸垚涓嬭浇鍦板潃
  - 鍓嶇涓婁紶閽╁瓙淇濆瓨杩滅�?URL锛屽埛鏂板悗鍥剧墖浠嶈兘灞曠�?
  - 鏈湴瀛樻。璇诲彇鏃惰嚜鍔ㄨˉ榻愬巻鍙查檮浠剁殑璁块棶閾炬帴
- **2025-10-27 澶氫細璇濋殧�?+ Streaming 鍗囩骇锛堣繘琛屼腑锟?*
  - 鏂板娑堟伅浠撳�?messagesRegistryRef锛岄槻姝㈠垏鎹㈠璇濅覆�?
  - Streaming �?sessionId 缁戝畾锛岄伩鍏嶈法浼氳瘽姹℃�?
- **2025-10-27 Loading Toast 鐢熷懡鍛ㄦ湡绠＄�?*
  - 浣跨�?	ry/finally 纭�?toast 姝ｇ‘鍏抽棴
  - 淇澶辫触璇锋眰瀵艰�?Spinner 鍗℃鐨勯棶�?
- **2025-10-27 椤甸潰妯″潡鍖栬皟锟?*
  - Home 椤甸潰鎷嗗垎�?chat/�?ttachments/銆乭ome/ 妯″潡
  - 鑱岃矗鏇磋仛鐒︼紝澶嶇敤鎬ф彁�?
- **2025-10-23 Markdown 浠ｇ爜鍧楀鍒舵寜�?*
  - 鎵€鏈変唬鐮佸潡鎻愪緵鐙珛澶嶅埗鎸夐挳锛屽吋瀹规�?Clipboard API 鍦烘�?
  - Toast 鎻愮ず鎴愬姛 / 澶辫�?
- **2025-10-23 杈撳叆浜や簰浼樺�?*
  - Enter 鍙戦€佹秷鎭紝Shift+Enter 鎹㈣�?
  - 瀵瑰叾浠栬緭鍏ュ満鏅棤鍓綔�?
- **2025-10-23 浼氳瘽鍒濆鍖栦慨锟?*
  - 寮曞�?lastConversationIdRef锛岃В�?StrictMode 鍙屾覆鏌撳鑷寸殑閲嶅瀵硅�?
- **2025-10-22 浼氳瘽璁板繂鎸佷箙锟?*
  - ConversationMemoryManager 鏀寔鏂囦欢鎸佷箙鍖栵紝榛樿鐩�?server_data/memory
  - 璁″垝鎵╁�?Redis / pgvector
- **2025-10-22 鑷€傚簲涓存椂鏂规�?*
  - 瀹藉睆缂╂斁涓庢孩鍑轰繚鎶わ紝鏆傛椂瑙勯伩鏂眰闂�?
- **2025-10-22 Provider 璺敱淇**
  - .env 閰嶇疆瀵归綈锛岀鍙ｅ崰鐢ㄦ竻锟?
  - /api/chat 杩斿�?provider: doubao
- **2025-10-21 棣栭�?UI 杩�?*
  - 鑱婂ぉ鍖哄煙鍗＄墖鍖栥€佸巻鍙插尯鍙姌鍙犮€佹帹鑽愭彁绀哄睍�?
- **2025-10-21 鍓嶇鎺ュ叆璞嗗寘妯″�?*
  -  iService 璋冪�?/api/chat
  - 鏀寔妯″瀷杈撳嚭娴佸紡鍝嶅簲
- **2025-10-21 Doubao Provider 閫傞�?*
  - 鏂板�?DoubaoProvider锛岄粯璁ゆā锟?doubao-seed-1-6-flash
- **2025-10-20 鐜涓庝唬鐞嗛厤锟?*
  - .env.example 琛ラ綈锟?gitignore 灞忚斀鏁忔劅鏂囦欢
  - 鎴愬姛缁曡繃 OpenAI 缃戠粶闄愬埗

## 馃攳 璇婃柇鎽樿
- 鍏稿瀷闂锛欵TIMEDOUT �?妫€鏌ヤ唬鐞嗕笌缃戠粶杩為€氾拷?
- 甯哥敤娴嬭瘯鍛戒护锟?
  `ash
  curl -v http://localhost:8082/v1/models
  curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"query":"娴嬭瘯OpenAI杩炴�?}' \
    http://localhost:8302/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
  `

## 馃寪 浠ｇ悊閰嶇疆澶囧�?
- Windows 涓存椂绀轰緥�?
  `powershell
  ='http://127.0.0.1:33210'
  ='http://127.0.0.1:33210'
  ='socks5://127.0.0.1:33211'
  pnpm --dir server dev
  `
- 瀵嗛挜涓庝唬鐞嗗嚟鎹粎淇濈暀鍦ㄦ湰鍦帮紝閮ㄧ讲鏃舵敼鐢ㄧ幆澧冨彉閲忔墭绠★拷?
- **2025-10-29 Doubao connectivity smoke test**
  - Added server/scripts/test-doubao-image.mjs to verify doubao-seed-1-6-flash reads image prompts without touching app code
  - Confirmed connectivity and successful image caption response using local base64 upload sample
- **2025-10-30 璞嗗寘鍥惧儚鎻忚堪鎺ュ叆**
  - 鏂板�?server/src/services/doubaoImageService.ts锛屽皝瑁呰眴鍖呭浘鍍忚瘑鍒苟鍥炶惤�?OpenAI 鍏冩暟鎹拷?
  - 鎵╁�?processChatRequest 瑙ｆ瀽闄勪欢涓婁笅鏂囷紝杩斿�?caption銆亀arnings銆乽sage 绛変俊鎭拷?
  - 鍓嶇鍚屾灞曠ず鍥惧儚鎻忚堪涓庤鍛婏紝琛ュ厖 toast 鎻愮ず鍙婇檮浠跺崱鐗囨牱寮忥�?
  - 娴嬭瘯锛歱npm --dir server test锛沺npm --dir front build:client�?
- **2025-10-30 鏂囨。瑙ｆ瀽鎺ュ叆**
  - 鏂板�?documentParser 鏈嶅姟锛岀粺涓€澶勭悊 TXT/PDF/DOCX锛屽苟鍦ㄩ檮浠朵笂涓嬫枃鐢熸垚鎽樿涓庤鍛婏拷?
  - 鎵╁�?buildAttachmentContext 鏀寔鍥剧�?+ 鏂囨。鍒嗘敮锛屾暣鐞嗕笂涓嬫枃鍧楀苟杩斿洖缁熶竴缁撴瀯锟?
  - 娴嬭瘯锛歱npm --dir server test锛沺npm --dir server build�?
- **2025-10-30 Excel 瑙ｆ瀽鏀寔**
  - 鎵╁�?documentParser 鏀寔 XLSX锛岄檺鍒惰〃鏍艰鍒楀苟鐢熸垚琛ㄥ�?鏁版嵁鎽樿�?
  - 缁熶竴涓婁笅鏂囪緭鍑猴紝attachmentContext 鑷姩鎷兼帴宸ヤ綔琛ㄦ憳瑕佷笌璀﹀憡锟?
  - 娴嬭瘯锛歱npm --dir server test�?
- **2025-10-30 鏂板缓瀵硅瘽琛屼负浼樺�?*
  - 鐐瑰嚮鈥滃紑鍚柊鑱婂ぉ鈥濅粎閲嶇疆鐣岄潰锛岀瓑寰呯敤鎴疯緭鍏ュ悗鍐嶅垱寤轰細璇濓�?
  - 鍒濇鍔犺浇浠嶉粯璁ら€変腑鏈€杩戜細璇濓紝鎵嬪姩杩涘叆鏂板璇濇椂闅忔満鍒嗛厤鍥炬爣涓庨鑹诧拷?
  - 楠岃瘉锛歱npm --dir front build:client�?
- **2025-10-31 Streaming output cadence**
  - useConversationController introduces token-level buffering with adaptive flush cadence for GPT-like typing
  - Adaptive delay + auto-scroll now smooth the early cadence while the caret indicator shows ongoing generation
  - ChatMessage adds a softened bounce-in animation plus typing indicator for active AI replies
  - Tests: pnpm --dir front build:client; pnpm --dir server test
















  - Checks: pnpm --dir front build:client


- **2025-11-07 学习中心布局拆分**
  - 将 Mission/Code/Result 栏抽成独立组件，KidsCodingEditorPage 仅保留状态与布局，清理 render 函数和重复 JSX，三栏高度保持一致
  - ResultPanel 加上移动端教学资料入口并统一标题样式，CodePanel 承担控制台遮罩，避免再出现按钮被遮挡
  - 测试：pnpm --dir server test；pnpm --dir front build:client

- **2025-11-07 学习中心头部对齐**
  - CodePanel 头部恢复与其他面板一致的 padding/单行布局，查看控制台 不再换行；ResultPanel 去掉“可视化 & AI 助手”标题，保持此前精简样式
  - 测试：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 学习中心折叠面板**
  - 新增 usePanelCollapse Hook 管理任务/运行结果折叠状态，并为 MissionPanel、ResultPanel 提供独立的折叠按钮，布局更易维护
  - ResultPanel/MissionPanel 内容在折叠时完全收起，保留统一标题栏；测试覆盖：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 学习中心左右折叠**
  - MissionPanel/ResultPanel 改为整列折叠，新增 CollapsedPanelRail 触发条，编辑器宽度可按需扩展，逻辑集中在 usePanelCollapse Hook
  - KidsCodingEditorPage 根据折叠状态实时变更 grid 模板，桌面端可独立展开/收起两侧栏；测试：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 折叠箭头美化**
  - CollapsedPanelRail 改成极简圆形箭头按钮，左右只留小小的箭头提示，展开/收起更符合视觉要求
  - KidsCodingEditorPage 更新调用签名；测试：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 折叠箭头瘦身**
  - CollapsedPanelRail 改为 8px 圆形箭头 + 透明窄条，最大限度减少占位，仅作为提示
  - 测试：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 折叠箭头 2px 版本**
  - CollapsedPanelRail 仅保留 2px 竖线 + 小三角，完全贴边，点击范围仍覆盖整条细线
  - 测试：pnpm --dir server test；pnpm --dir front build:client
- **2025-11-07 KidsCoding 标题栏与控制台位置**
  - 让任务/代码/结果三块的抬头保持同一行高度：代码编辑器顶部按钮强制单行滚动显示，并把“查看控制台”挪到运行按钮下方的辅助链接。
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-08 KidsCoding 编辑器导航布局**
  - 前端 KidsCoding Editor 页面新增渐变导航栏，原本散落在代码面板顶部的保存/格式化/助手按钮统一收口，并加上任务说明按钮触发抽屉。
  - 移除左侧常驻任务栏，改为 MissionDrawer 侧滑展示；桌面端仅保留代码 + 结果双栏，移动端继续提供代码/结果切换。
  - Checks: （未运行）UI 调整，待有人手按流程执行 `pnpm --dir server test` 与 `pnpm --dir front build:client`
