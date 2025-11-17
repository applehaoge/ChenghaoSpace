全局工程规范说明（请严格遵守）：

你是一个资深 TypeScript/Node/React 工程师，要按企业级可维护、可扩展的标准来写代码，而不是 demo。

不允许生成“巨无霸文件”：

单个函数体最好控制在 50 行以内，超过请拆分；

不要在一个文件里塞 500 行以上的新增代码，必要时拆分模块。

前后端通信必须先定义清晰的 TypeScript 类型（DTO），所有接口参数、返回值都用这些类型，不要用 any。

对外 API 协议尽量保持向后兼容，如果要调整字段，请显式给出新版本结构和升级路径。

保持现有中文文案不变，不要擅自修改 UI 文案，只调整逻辑和类型。

如果需要新增工具函数，优先放在 core/ 或 services/ 这类目录，不要在 React 组件内部写一大堆业务逻辑。

如无必要，不要大改现有文件结构，尽量“小步修改 + 良好命名”。

所有潜在危险点（例如路径校验、资源限制）要在代码里加简短注释（中文），标明为什么要这么做。

- **2025-11-15 KidsCoding 多标签联动**
  - useProjectFiles 记录激活文件、内容及语言，新增文件自动切换并保持唯一命名。
  - FileSidebar/FileListPanel 支持选中高亮，点击文件会驱动 CodeWorkspace，左侧删除也会切换到下一个文件。
  - CodeWorkspace 顶部恢复原有卡片样式并可横向展示多个标签，点击即可切换；编辑器内容、控制台提示和语法高亮与选中文件保持一致。
  - KidsCodingEditorPage 负责把文件状态传给左右侧组件，实现真正的联动体验。
  - Checks: pnpm --dir server test, pnpm --dir front build:client
- **2025-11-15 KidsCoding 文件栏新建按钮**
  - 去掉 QuickCreate 弹窗，Toolbar 直接提供“新建 Python 文件”“新建文件夹”两个按钮，点击立即执行，移动端更友好。
  - FileSidebar 添加 data-file-panel-root 仅供后续定位使用（当前无弹窗逻辑）。
  - Checks: pnpm --dir server test, pnpm --dir front build:client
- **2025-11-14 KidsCoding 文件栏修复**
  - “新建文件夹”真正生成 folder 类型，列表使用文件夹图标显示，重命名不再追加 .py。
  - 文件列表删除按钮打通 useProjectFiles.removeEntry，删除当前编辑项会同时退出编辑状态。
  - Checks: pnpm --dir server test, pnpm --dir front build:client
- **2025-11-14 KidsCoding 文件创建**
  - 文件栏“+”按钮只提供“新建 Python 文件”和“新建文件夹”，点击后直接在列表中进入改名状态。
  - FileSidebar/FileListPanel 接入 useProjectFiles，支持内联重命名并自动补全扩展名、避免重名。
  - Checks: pnpm --dir server test, pnpm --dir front build:client

- **2025-11-13 KidsCoding        ݳ   **
  -    Lesson/Mission/Quiz ģ     
ront/src/features/kidsCoding/data/lessons.ts    mock    ݣ    ṩ getLessonContent  
  -  ½  useLessonSlides Hook         ҳ״̬     ⽱      Ƶ      LessonTaskPanel    Mission/Quiz/Controls    Ϊ         FileSidebar        л  봫 Σ   ʽ   ֲ  䣩  
  - Checks: pnpm --dir server test, pnpm --dir front build:client 

- **2025-11-13 KidsCoding     / ļ  л  + T  չʾ**
  - FileSidebar ֧      / ļ   ͼ л         ԭ   ۵       
  - LessonTaskPanel + TaskVideoDialog + FileListPanel        ҳ/ ļ ҳ   룬   齱       +5 T      ơ 
  - T  չʾ   Ƶ  KidsCodingEditorHeader       ͼ ꣩         ռ     㡣
  - Checks: pnpm --dir server test, pnpm --dir front build:client 

- **2025-11-13 KidsCoding     / ļ  л  + T    ʽ**
  - FileSidebar   дΪ   л   ͼ                      / ļ     ť  Ĭ          ҳ      ԭ   ۵  ֱ    ɡ 
  -  ½  LessonTaskPanel     T      Ƶ  ڡ     ҳ 뽱    ʾ   Լ  TaskVideoDialog  FileListPanel         ҳ/ ļ ҳ   롣
  - Checks: pnpm --dir server test, pnpm --dir front build:client 

- **2025-11-12 Runner   ѯ  Ƶ**
  - python-runner Ĭ   RUNNER_POLL_INTERVAL_MS    1.5s     Ϊ 5s     ٷ      request spam    ͨ           ٵ  졣
  - Checks: not run (config tweak) 
- **2025-11-12 Runner Ĭ ϶˿ ͬ  **
  - start-dev.ps1 Ĭ   RUNNER_SERVER_URL   Ϊ http://127.0.0.1:8302    ƥ 䵱ǰ server      ˿ڣ      runner    ECONNREFUSED  
  - Checks: not run (script change only) 
- **2025-11-12 Docker     /        ˵  **
  -    compose  ļ     Ϊ docker-compose.yml       README    docs/deployment.md  ǿ      ʹ   pnpm dev          Docker  docker                      RUNNER            ݡ 
  - Checks: pnpm --dir server test, pnpm --dir front build:client 
- **2025-11-12 Server/Runner docker     **
  -      server    python-runner Dockerfile  compose.yaml       ĵ    Linux Ĭ     ã ֧  һ     Fastify + Runner       Runner Python Ĭ ϸ Ϊ Linux  Ѻõ  python3  
  - Checks: pnpm --dir server test, pnpm --dir front build:client 
- **2025-11-12 KidsCoding assistant 编码清理**
  - AssistantChatPanel 默认提示、新会话文案和按钮状态改为可读汉字，并修复重 ?inputRef/事件监听，保持“向 AI 追问”自动填充逻辑 ?
  - Checks: `pnpm --dir server test`, `pnpm --dir front build:client`
- **2025-11-12 KidsCoding assistant 文案修复**
  - KidsCodingEditorPage  ?AssistantChatPanel 的默认文案、提示语和静态消息改为正 ?UTF-8，去掉重复的事件监听并保持“向 AI 追问”按钮逻辑可用 ?
  - Checks: `pnpm --dir server test`, `pnpm --dir front build:client`
- **2025-11-11 KidsCoding console  ?AI relay**
  - Console 输出区右下角新增“向 AI 追问”按钮，点击会通过事件把当前控制台文本写入右侧 AI 助手输入框并聚焦，伴 ?toast 提示 ?  - Checks: 未执行；请运行代码后点击该按钮，确认助手输入框已填入日志内容且可直接发送 ? **2025-11-11 Insights visualization collapse fix**
  - 可视化演示区在折叠时改用 max-height 限制，左右宽度保持不变，向上收起时真正腾出空间，不再撑着固定高度 ?
  - Checks: 未执行；请在 KidsCoding 编辑器中点击“收起”确认演示区完全隐藏、AI 助手区域上移 ? **2025-11-11 KidsCoding console indicator animation**
  - 指示灯在运行态按左到右顺序脉冲变色（亮橙→暖黄），其他状态也使用更鲜艳的调色，并新增全局动画样式 ?
  - Checks: 未执行；请在运行任务时观察三颗灯依次闪烁，结束后恢复相应颜色 ? **2025-11-11 KidsCoding console indicator colors**
  - 控制台三色指示灯随状态切换为更鲜艳的绿色/琥珀/玫红并在运行中脉动，暗色与浅色主题都有适配 ?
  - Checks: 未执行；请在多种状态下观察指示灯颜色是否明显且符合预期 ? **2025-11-11 KidsCoding console indicators**
  - 控制台状态徽章与三色指示灯联动：运行中改为绿色脉冲、排队为琥珀、失败为红色，默认仍保留原色 ?
  - Checks: 未执行；请在运行/排队/失败状态下观察 Console 顶部小圆点是否按预期变色 ? **2025-11-11 Dev script adds runner**
  - start-dev.ps1 现同时拉 ?server、front 以及 python-runner（若存在），并默认设 ?RUNNER_SERVER_URL 指向本地 8000 端口 ?
  - Checks: 未执行；请运 ?start-dev.bat 验证三个终端是否同时启动 ? **2025-11-11 KidsCoding Python run UI**
  - 前端新增 run API 客户端、useRunJob hook、CodeWorkspace 控制台实时输出与状态样式，并把运行按钮接入后端 job 流程 ?
  - Checks: 未执行；请启 ?server + python-runner，运 ?`pnpm --dir front dev`，在编辑器中点击“运行代码”验证任务状态与 console 输出 ? **2025-11-11 Python runner scaffold**
  - 新建 python-runner 子项目（TypeScript），实现轮询 claim、执 ?Python 子进程、推 ?started/chunk/completed/failed 事件的最小可 ?worker ?
  - Checks: 未执行；请配 ?RUNNER_SERVER_URL/RUNNER_ACCESS_TOKEN 后运 ?`pnpm --dir python-runner dev`，并联合 server 端验证端到端任务流 ? **2025-11-11 Server run API scaffolding**
  - 新增 /api/run、job 状态存储、WebSocket 流和 runner 专用 claim/event 接口，提 ?in-memory 队列与订阅能力，后续可挂 ?python-runner ?
  - Checks: 未执行；请运 ?pnpm --dir server build && pnpm --dir server start，调 ?/api/run 并通过 /api/run/:jobId/stream 验证状态推送 ? **2025-11-11 KidsCoding editor padding zero**
  -  ?CodeEditor  ?Monaco padding top/bottom 设为 0，使首行紧贴 main.py 标签，避免额外留白干扰判断 ?
  - Checks: 未执行；请在编辑器中确认首行已贴近标签且滚动正常 ? **2025-11-11 KidsCoding console top straight**
  - 去掉控制台顶栏容器的 rounded-t-3xl，让 Console 标题两端呈直角便于评估视觉效果 ?
  - Checks: 未执行；请在界面中展开控制台确认顶栏转为直角 ?
- **2025-11-11 KidsCoding console debug fallback**
  -  ?ResizableConsole 调试输出改为无条 ?console.debug，并新增高度变化日志，确保在任何环境都能看到鼠标/高度事件 ?
  - Checks: 未执行；请重新打开编辑器页面并观察浏览器控制台确认日志出现 ?
- **2025-11-11 KidsCoding console debug logs**
  -  ?ResizableConsole 中为拖拽条加 ?console.debug 调试输出，记 ?mouse enter/move/up 状态并追踪 isDragging 切换，便于排查光标显示问题 ?
  - Checks: 未执行；请在开发模式打开 KidsCoding 编辑器并查看浏览器控制台以确认调试日志 ?
- **2025-11-11 KidsCoding console separator tweak**
  - 调整 ResizableConsole 的拖拽条为独 ?separator，常 ?ns-resize 光标并放在控制台外层顶部，易于拖拽且不影响现有动效 ?
  - Checks: 未执行；请运 ?pnpm --dir server test、pnpm --dir front build:client，并在编辑器页拖动新分隔条验证高度调整 ?
- **2025-11-11 KidsCoding resizable console**
  - Added a ResizableConsole component with a drag handle so the console height updates live and stays fixed until refresh.
  - Checks: not run; please execute pnpm --dir server test, pnpm --dir front build:client, then drag the console in the kids editor.
- **2025-11-11 KidsCoding console header trim**
  - Slimmed the console header padding, unified console typography to 12px, and kept the output block flush so the Console / Ready row no longer wastes vertical space.
  - Checks: not run; please execute pnpm --dir front build:client and toggle the console to verify spacing.
- **2025-11-11 KidsCoding console fill**
  - Console output area now spans the entire panel with a flush background and square corners, matching the placeholder text exactly.
  - Checks: not run; please execute pnpm --dir front build:client and use the  ն˰ ť to verify.
- **2025-11-11 KidsCoding console polish**
  - CodeWorkspace console      Բ ǽ  䡢  ɫ״̬ ƺ    ݿ Ƭ   ն˰ ť    ͬ    
  - Checks: δִ У          pnpm --dir front build:client    ֶ  л  ն˿  ء 
- **2025-11-11 KidsCoding     ̨    **
  - CodeWorkspace      ն˰ ť״̬   AnimatePresence               ̨ ӱ༭   ײ       ʾռλ          水ť    
  - Checks:   ִ У          pnpm --dir front build:client    ֶ     ն˰ ť  ֤    Ч    
- **2025-11-10 KidsCoding  ļ       Чͳһ**
  - FileSidebar    ü ʱ     + 0.4s opacity/scale        Ӿ Ч     Ҳප        һ ¡ 
  - Checks: δִ У     ΢    
- **2025-11-10 KidsCoding    ӻ     **
  -    ӻ        0.4s ͸     +   ΢ģ            /չ   ۸      һ £  Ƴ  ߶ ѹ    ɵ   Ӳ С 
  - Checks: δִ У   Ч΢    
- **2025-11-10 KidsCoding        뵭  ͳһ**
  - InsightsSidebar    ݵ  0.4s             չ               򣬱   һ µ       顣
  - Checks: δִ У   Ч΢    
- **2025-11-10 KidsCoding        ݵ   **
  - InsightsSidebar      ݻָ Ϊ motion.section       0.4s ͸   Ƚ  䣬  ͨ   visibility/pointerEvents    ƽ       ֤չ        ޱ  Ρ 
  - Checks: δִ У   Ч΢    
- **2025-11-10 KidsCoding       Ч    **
  - InsightsSidebar   ǵ  scale/opacity     ʱ     0.2s     Ϊ 0.4s  ʹչ      ͡ 
  - Checks: δִ У     ΢    
- **2025-11-10 KidsCoding       Чϸ  **
  -  ڼ ʱ     л  Ļ    ϣ Ϊ InsightsSidebar          ΢   opacity/scale           /չ          Ӳ  
  - Checks: δִ У     ΢    
- **2025-11-10 KidsCoding        ȼ ʱ л **
  - InsightsSidebar     ʹ   motion.aside            style      ۵ ״̬       ÿ  ȣ չ  /    ʱ ޶  ⼷ѹ      
  - Checks: δִ У           
- **2025-11-10 KidsCoding             ٵ **
  -    InsightsSidebar      ݸ Ϊ  ̬ section    ͨ   class    ƿɼ  ԣ չ     ٶ   ƽ ƶ        ӻ     ĸ߶ȶ         
  - Checks: δִ У     ΢    
- **2025-11-10 KidsCoding          Ч    **
  -  ޸  InsightsSidebar        JSX  ṹ   Ƴ          պ  Իָ       
  - Checks: δִ У         
- **2025-11-10 KidsCoding          Ч Ż **
  - InsightsSidebar ʼ    Ⱦ   ݣ     ʱ      ͸    /λ Ʋ      pointer events   ҿ  ӻ     Ϊ max-height       չ     ټ ѹ AI       塣
  - Checks: δִ У          Ż   
- **2025-11-10 KidsCoding       ϶    **
  - ȥ   CodeWorkspace            border-b    ȡ    ǩ   ĸ  margin   ñ ǩ      ༭  ֱ     ϣ  ޺ڷ졣
  - Checks: δִ У   ʽ΢    
- **2025-11-10 KidsCoding  ༭       ޸ **
  - CodeWorkspace  б༭       Ƴ      ߿ order-t-0           ǩ      ɫ ߵ    γɿɼ    ڷ족        ʽ   ֲ  䡣
  - Checks: δִ У   ʽ΢    
- **2025-11-10 KidsCoding    ǹ켣    **
  - ShootingStar       Ϊ     ϡ    ¶Խ  ˶         β       Գ     θУ   ͨ   length/yTravel     ΢    
  - Checks: δִ У   Чϸ    
- **2025-11-10 KidsCoding    ǽǶȵ   **
  - ShootingStar       Ϊ  ת  ĵ   λ ƣ         б     ꡱ  ̬     ༭   Ͽգ        ɵ  ǶȲ     
  - Checks: δִ У   Ч   £ 
- **2025-11-10 KidsCoding    Ƕ Ч**
  - KidsCodingEditorPage      ShootingStar           ڲ Ӱ                 Գ          ǹ켣  Ӫ    ů  Χ  
  - Checks: δִ У    Ӿ Ч    
- **2025-11-10 KidsCoding  ༭      ѹ   ޸ **
  - CodeWorkspace            min-w-0     ָ   ֱ    Ϊ flex       ָ        min-w-0           ѹ  ͬʱά ִ ֱ ߶ȣ     ༭       塣
  - Checks: δִ У     ΢    
- **2025-11-10 KidsCoding     չ   ޸ **
  - KidsCodingEditorPage Ϊ     м  в    min-w-0    Ϊ CodeWorkspace   һ   flex-1            Monaco     ֹ File/Insights         չ    
  - Checks: δִ У    ֵ     
- **2025-11-10 KidsCoding       ť    **
  - KidsCodingEditorHeader  Ƴ  ˻ ľ/    ģʽ л     Ϊ   سȺƿռ䣨AI Ի      롰 ȺƱ    ҳ    ť      ·    ת     ఴť   ֲ  䡣
  - Checks: δִ У ǰ ˽         
- **2025-11-10 KidsCoding main.py   ǩ    **
  - main.py   ǩ  Ϊ    Բ ǲ  Ƴ      hover                 ༭  ֱ Ƕ  롣
  - Checks: δִ У   ʽ΢    

- **2025-11-10 KidsCoding CodeWorkspace    Բ  **
  - CodeWorkspace              / ײ        Լ  ļ   ǩ     rounded   ʽ       CodeEditor     Ϊֱ ǡ 
  - Checks: δִ У   ʽ      

- **2025-11-10 KidsCoding Monaco     **
  -      CodeEditor         Monaco       CodeWorkspace    滻  ̬    ʵ    ʵ ɱ༭        
  - KidsCodingEditorPage         ״̬     а ť  ȡ  ʵ   벢       л  ༭     ⡣
  - Checks: δִ У ǰ ˸Ķ             

- **2025-11-10 KidsCoding        ָ **
  -    ½    InsightsSidebar     ӻ    ۵  + AI    죩      ༭     в  ֣   һ ۵   ť       С 
  -      useInsightsSidebar Hook  ־û  ۵ ״̬  
  - Checks: pnpm --dir server test; pnpm --dir front build:client- **2025-11-10 KidsCoding        ع **
  -     ʵ   InsightsSidebar     нṹ     ӻ ģ  ֧   ۵    ۵ ʱ AI      Զ ռ     ۵   ť      ȷ  
  - AI    ָ Ϊ         Ű棬      Ĭ Ͽ  ӻ չʾ  
  - Checks: pnpm --dir server test; pnpm --dir front build:client- **2025-11-10 KidsCoding   ͷ¶      **
  -  ۵ ״̬ ½   ť    ƫ ƣ -right-3    ȷ    ͷ      ¶       ٱ ϸ     С 
  - Checks: pnpm --dir server test; pnpm --dir front build:client- **2025-11-10 KidsCoding   ͷ  ʽ    **
  -          ۵   ť Ķ λ    ɫ  ȡ        Ч      ťʼ      ¶        ͳһԲ    ʽ     ⡰  ͷ    ȥ     Ӿ  bug  
  - Checks: pnpm --dir server test; pnpm --dir front build:client- **2025-11-10 KidsCoding ?????????**
  - ???/????????????????  ????????????  ????????????????????????????  ???????????
  - ???? FILE_PANEL_COLLAPSED_WIDTH ? 14px?????? collapse handle/????????????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-10 KidsCoding ???????????????**
  - ???? Header/FileSidebar/CodeWorkspace ????? useFileSidebar Hook??????????????????????????????????????
  - ???????????  ????????????????????????????????????????????????????????????  ?????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-07 KidsCoding ???????**
  - ??????????????????????? `/kids-coding/editor` ??  ??   `KidsCodingEditorPage`??????? IDE ??????????????? `.kids-coding-editor` ?????????????????  ?
  - ???? `lucide-react` ?????????  ??? `useTheme`/Provider??????????????????????????  ??  ?????
  - Checks: pnpm --dir server test; pnpm --dir front build:client?????????????????
- **2025-11-07 KidsCoding ?????????**
  - ???? PANEL_BASE_CLASS??????????/????  ? overflow-hidden?????????????????????????????????????????????  ??????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding ????????**
  - ???? SECTION_HEADER_CLASS??????/????/????????????????????????  ????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

**2025-11-07 KidsCoding ?????**
  - ??? RESPONSIVE_PANEL_HEIGHT_CLASS ?? md??560px??lg??85vh??xl 780px?????????????????AI ????????  ????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

**2025-11-07 KidsCoding ??????????**
  - ??????? overflow-hidden????????????????? min-h-0 / pb-28??????????????????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

???????????PROGRESS.md??

- **2025-11-07 KidsCoding ???????**
  - ????????????????  ???? + ???? + ??  ????????????????????????????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding ????????**
  - ???? RESPONSIVE_PANEL_HEIGHT_CLASS ? md:min-h[480px]/lg:75vh/xl:680px?????? 760px??????????????????????AI ?????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding ??????**
  - ???? RESPONSIVE_PANEL_HEIGHT_CLASS ? md:min-h-[420px] lg:h-[68vh] xl:h-[620px] lg:max-h-[700px]????????????????????AI ??????????????????  ?
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding ????????**
  - ???? RESPONSIVE_PANEL_HEIGHT_CLASS??md ??360px??lg=60vh??xl=520px?????? 600px????????????????  ???????????????  ???????????????????? overflow ??????
  - Checks: pnpm --dir server test; pnpm --dir front build:client



- **2025-11-07 KidsCoding 400px ????**
  - ?? DESKTOP_PANEL_HEIGHT_CLASS ?? DESKTOP_RESULT_HEIGHT_CLASS ????? 400px ?????? lg:h-full???????????  ?????/???????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding AI ?????**
  - ??????????? DESKTOP_RESULT_HEIGHT_CLASS??400px?????????????? AI ???????? lg:self-end lg:h-auto???????????? 1/3??????????????? 600px ?????????? items-stretch??????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-07 KidsCoding ??????**
  - ???? DESKTOP_PANEL_HEIGHT_CLASS ??min-h ??680px ???? 600px????????????? h-full ?????????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-06 ????????????**
  - ??? kidsCoding Hero/Features/?  ?/???/???/???????????????????????? Hook
  - ?????????? `/kids-coding/editor` ??  ?????????????AI ??????????????????????????
  - ???? `KidsCodingProvider` ???????????????????????????????
  - ??????????????????????/??????????????????????
  - Checks: pnpm --dir front build:client

- **2025-11-05     ع  빤        **
  -     ÿ մ ???        Ϊ  ??DailyProgressPanel      MainContent           ???
  -   ???pnpm-workspace.yaml    ??package.json  ͳ???front/server            ??
  -            밴ť    ??useSpeechToText Hook      ת     Զ        ??


- **2025-11-05 ??????????????*
  - ?????????????????  ???????????????  ????????????
  - ????????????????????????????????  ??????????  ???
-  ???  ??????????300????50 Medium Rectangle ??  ??????????????  ????
-  ?????????  ?????????????????????????????????
-  ???????????/???????????????  ??????????????????  ??
  - ??????????????  ?????????????????????????????????????????????????\n  - ?????? BETA ????????????????????????????
  - ??????????????????????????????????????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client

## ???  ???
-   Ŀ   ƣ ChenghaoSpace
-    ͣ AI Chat Demo  ǰ       ??
-   ǰ        ??UI  Doubao Provider    롢         ġ  Ự  ??
- Ŀ ꣺һ      ɿ Ͷ    ???Demo  RAG  ???Provider            ͼ    Ϣ   ־ü  䣩



   ڵ      ǣ    doubao-seed-1-6-flash ģ    ʽ   뵱ǰ  Ŀ   ú   ܰ  û  ϴ   ͼƬ ͸ ģ  ʶ 𲢷                     鹦 ܻ û  ͨ??

   Էֳ   Щ      ʵ  ???

           Լ    ȷ  ǰ   ϴ  ĸ    ں         洢 ģ    籣  ·    ֧  ???MIME     Լ ϣ     ظ ǰ ˵ ͼƬ    /     ֶθ ʽ??
  ???Doubao ͼƬ        ???server/src/services       һ  ר ŵ ??Doubao   ͼ  ʶ  ģ 飨 ɲο   ??imageAnalyzer.ts  ṹ         ͼƬת ɺ   ???image_url  ???base64 data URL         chat/completions  ӿ ??
  ???provider factory  ???providers/doubaoProvider.ts  ﲹ  һ      ͼƬ    ڣ     ???DoubaoImageService   ӻ         ȡģ ͡ API base         proxy  ߼ ??
  ¶  ˽ӿڣ    Fastify ·      ??/api/upload     ??/api/image-insight   ڸ   ɨ            ·  񣬰     ??caption  usage   Ϣ   浽   ݿ / ڴ沢   ظ ǰ  ??
ǰ ˽   չʾ     front/src/components/chat/ChatInterface.tsx  ȴ       ˷  ص ͼƬ        Ⱦ ڸ     Ƭ???AI  ظ  ͬʱȷ   Toast/  ʾ İ     ʧ ܳ   ??
          ĵ   Ϊ ·   ??Vitest    ⣨mock fetch         progress.md  README.md      µ  Լ첽 裬ȷ??pnpm --dir server test ??pnpm --dir front smoke   ͨ  ??
     ˳         ܰѡ ģ  ʶ  ͼƬ        ·   ׽         Ŀ??

    һ  һ  ȥ    ÿ  һ    Ҫ    ͨ          һ      ҵ Ƿ Ҫ   µ  ⣿         øĶ  ޹ع  ܣ  ޹ش   


## ??   Ҫ     ־      ??
- **2025-11-04 ??????????????*
  - ???????????????????????? AI ????????????????
  - ??????????????????  ??????????`VITE_KIDS_CODING_URL` ????????????????
  - ?????????????????????????????????????????????  
  - ?????????????? I??????+ ?????????? ??????  ??????????
  - ??????????????????????????????
  - Checks: pnpm --dir front build:client
- **2025-10-31 Chat scroll affordance**
  - Auto-scroll stays enabled when the user is at the bottom; manual scrolling pauses it
  - Floating "scroll to latest" button appears when browsing history
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-10-31 Chat send jump**
  - Sending a new user message now re-enables auto-scroll to keep context fresh
  - Applies setAutoScrollEnabled/scrollToLatest before dispatching request
  - Checks: pnpm --dir front build:client

- **2025-10-31 ҳ        Ƶ ???*
  - Home         html/body overflow  ͳһȡ    ???    ȫ ֹ   ??
  - MainContent      ڲ    ع        Ҳ    ݱ  ֿ  ??
  -         ȸ         Ļ Զ  Ŵ   ???   챣  һ    ??
  -           ӿڿ  ȿ  ƣ maxWidth 92vw                    Ӧ    
  -        ??flex h-full  ƫ    Ļ     б  Զ   ??

- **2025-10-29 ƽ ̺  Ŀ???+   Ԫ      ???+ Э   淶**
  - ??server/server/src ƽ  ??server/src        ʷ      ??
  -    ¹    ű   pnpm --dir server build / pnpm --dir server test     ͨ  
  -   ???Vitest    ??
sHelpers??ttachmentContext   ǰ?? iService   Ԫ    
  -   ???smoke.ps1 ??pnpm --dir front smoke  ű         С   Լ   ???
  - README      AI   ʾ ʡ  ֶ   ֤ 嵥   ű ˵???
  -  ޸    ͺ󸽼   Ƭ ӳ   ʧ     ⣨    ʧ  ʱ Զ  ָ     ??
  -  ޸   ҳ ϴ   Ϣ        治  ʾ      Ƭ     ⣬֧ ֳ ʼ  Ϣ ĸ   ͬ  չ??
- **2025-10-28              ϴ  ־ ??*
  - Fastify   ???/uploads/:fileName   ̬· ɣ ͳһ       ص ַ
  - ǰ   ϴ    ӱ   Զ???URL  ˢ º ͼƬ    չ???
  -    ش浵  ȡʱ Զ       ʷ     ķ       
- **2025-10-27   Ự  ??+ Streaming             ??*
  -       Ϣ  ???messagesRegistryRef    ֹ л  Ի   ??
  - Streaming ??sessionId  󶨣      Ự  ???
- **2025-10-27 Loading Toast        ڹ ???*
  - ʹ???	ry/finally ȷ???toast   ȷ ر 
  -  ޸ ʧ      ???Spinner         ??
- **2025-10-27 ҳ  ģ 黯  ??*
  - Home ҳ    ??chat/??ttachments/  home/ ģ  
  - ְ    ۽           ??
- **2025-10-23 Markdown     鸴 ư ??*
  -    д     ṩ       ư ť      ???Clipboard API   ???
  - Toast   ʾ ɹ  / ʧ???
- **2025-10-23    뽻    ???*
  - Enter       Ϣ  Shift+Enter   ???
  -          볡   ޸   ??
- **2025-10-23  Ự  ʼ    ??*
  -   ???lastConversationIdRef    ??StrictMode ˫  Ⱦ   µ  ظ   ???
- **2025-10-22  Ự    ־ ??*
  - ConversationMemoryManager ֧   ļ  ־û   Ĭ  Ŀ???server_data/memory
  -  ƻ   ???Redis / pgvector
- **2025-10-22     Ӧ  ʱ  ???*
  -                      ʱ  ܶϲ   ???
- **2025-10-22 Provider ·   ޸ **
  - .env    ö  룬 ˿ ռ    ??
  - /api/chat   ???provider: doubao
- **2025-10-21   ???UI   ???*
  -         Ƭ      ʷ     ۵    Ƽ   ʾչ??
- **2025-10-21 ǰ ˽  붹  ģ???*
  -  iService   ???/api/chat
  - ֧  ģ       ʽ  Ӧ
- **2025-10-21 Doubao Provider   ???*
  -   ???DoubaoProvider  Ĭ  ģ??doubao-seed-1-6-flash
- **2025-10-20            ??*
  - .env.example     ??gitignore          ļ 
  -  ɹ  ƹ  OpenAI         

## ??    ժҪ
-        ⣺ETIMEDOUT ??              ͨ??
-    ò       ??
  `ash
  curl -v http://localhost:8082/v1/models
  curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"query":"    OpenAI  ???}' \
    http://localhost:8302/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
  `

## ??        ñ ???
- Windows   ʱʾ  ??
  `powershell
  ='http://127.0.0.1:33210'
  ='http://127.0.0.1:33210'
  ='socks5://127.0.0.1:33211'
  pnpm --dir server dev
  `
-   Կ     ƾ ݽ      ڱ  أ     ʱ   û        й ??
- **2025-10-29 Doubao connectivity smoke test**
  - Added server/scripts/test-doubao-image.mjs to verify doubao-seed-1-6-flash reads image prompts without touching app code
  - Confirmed connectivity and successful image caption response using local base64 upload sample
- **2025-10-30     ͼ          **
  -   ???server/src/services/doubaoImageService.ts    װ    ͼ  ʶ 𲢻   ??OpenAI Ԫ    ??
  -   ???processChatRequest              ģ   ???caption  warnings  usage     Ϣ??
  - ǰ  ͬ  չʾͼ       뾯 棬     toast   ʾ        Ƭ  ʽ???
  -    ԣ pnpm --dir server test  pnpm --dir front build:client??
- **2025-10-30  ĵ         **
  -   ???documentParser     ͳһ     TXT/PDF/DOCX     ڸ             ժҪ 뾯  ??
  -   ???buildAttachmentContext ֧  ͼ???+  ĵ   ֧           Ŀ鲢    ͳһ ṹ??
  -    ԣ pnpm --dir server test  pnpm --dir server build??
- **2025-10-30 Excel     ֧  **
  -   ???documentParser ֧   XLSX     Ʊ      в    ɱ ???    ժҪ??
  - ͳһ           attachmentContext  Զ ƴ ӹ     ժҪ 뾯  ??
  -    ԣ pnpm --dir server test??
- **2025-10-30  ½  Ի   Ϊ  ???*
  -               족     ý  棬 ȴ  û       ٴ    Ự???
  -    μ     Ĭ  ѡ      Ự   ֶ      ¶Ի ʱ       ͼ      ɫ??
  -   ֤  pnpm --dir front build:client??
- **2025-10-31 Streaming output cadence**
  - useConversationController introduces token-level buffering with adaptive flush cadence for GPT-like typing
  - Adaptive delay + auto-scroll now smooth the early cadence while the caret indicator shows ongoing generation
  - ChatMessage adds a softened bounce-in animation plus typing indicator for active AI replies
  - Tests: pnpm --dir front build:client; pnpm --dir server test
















  - Checks: pnpm --dir front build:client


- **2025-11-07 ???????????**
  - ?? Mission/Code/Result ?????????????KidsCodingEditorPage ????????????????? render ????????? JSX???????????????
  - ResultPanel ??????????????????????????????CodePanel ?  ???????????????????????????
  - ?????pnpm --dir server test??pnpm --dir front build:client

- **2025-11-07 ?????????????**
  - CodePanel ?????????????????  ? padding/???  ??????????? ??????  ?ResultPanel ????????? & AI ??????????????????????
  - ?????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 ????????????**
  - ???? usePanelCollapse Hook ????????/???  ???????????? MissionPanel??ResultPanel ??????????????????????????
  - ResultPanel/MissionPanel ???????????????????????????????????????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 ?????????????**
  - MissionPanel/ResultPanel ???????????????? CollapsedPanelRail ????????????????????????????????? usePanelCollapse Hook
  - KidsCodingEditorPage ?????????????? grid ??  ????????????/?????????????????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 ??????????**
  - CollapsedPanelRail ????????  ??????????????    ????????????/???????????????
  - KidsCodingEditorPage ???  ?????????????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 ??????????**
  - CollapsedPanelRail ??? 8px ??  ?? + ??????????????????  ??????????
  - ?????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 ?????? 2px ?  **
  - CollapsedPanelRail ?????? 2px ???? +   ??????????????????  ????????????
  - ?????pnpm --dir server test??pnpm --dir front build:client
- **2025-11-07 KidsCoding ????????????  ??**
  - ??????/????/?????????????????  ??????????????????????  ????????????????????????????  ???  ???????????
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-08 KidsCoding ????????????**
  - ??? KidsCoding Editor ?????????????????????????????? D???????/?????/????????????????????????????????????
  - ?????????????????? MissionDrawer ??????????????????? + ??????????????????????/????  ???
  - Checks: ??  ???  ?UI ?????????????????????? `pnpm --dir server test` ?? `pnpm --dir front build:client`
- **2025-11-08 KidsCoding ????????**
  - ???????????????????????  ?????/????????????????????????????????????????????????????????????? 
  - ????????????????????????????????????????????/?????????/????????????  ?????????? ^
  - Checks: ??  ???  ???????????? `pnpm --dir server test`??`pnpm --dir front build:client`







 
- **2025-11-10 KidsCoding         **
  -    ӻ   ʾ   AI       ֺϲ     һ  Ƭ   Ƴ  ˡ С     / ͼ Ρ   ǩ   ѡ    𡱺͡ ȫ     ؼ  ŵ ͬһ У   Ϊ AI                  临      
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-10 KidsCoding       ǿ**
  -  ޸               룬      Ϊ `flex` + `min-h-0`  ṹ  ֤   ۿ  ӻ  Ƿ չ      ༭   ȸߣ                +       ̶  ײ   ȷ      ͬʱչ  ʱ   ܿ        
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-10 KidsCoding      ۵   ť    **
  -         ۵   ť       ļ       ͬ  ˫  Բ    ʽ     Ϸָ    ߺ  z-index    ť      Ӿ   һ     ٱ      ڵ   
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-10 KidsCoding      ۵ չ    λ**
  -          ۵ ʱ       ļ       ͬ   14px      ˫Բ  ť        Բ Ǳ߿            ͳһ  Ӱ/ɫ 壬 ۵   չ  ʱ  ͷ   򡢷ָ     ʽ  ȫһ ¡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-10 KidsCoding    ӻ     ͳһ**
  -    ӻ   ʾ         MonitorPlay ͼ 겢   AI    ֱ  Ᵽ  ͬ ֺ     룬 ۵ ʱ Զ    Ͳ ͸   ȣ չ  ʱ ָ     ֤״̬    һ £           Ʒ     һ    ǿ 黯  40%   ͸   ȣ         ͼ       14px       Ӿ  Ȼ    ˸   ͬʱ         ۽   Ϊ     ڱ߿ ͵ ɫ               500    𣨰 ɫ         ߵ    300       ܱ  ֱ Ե     ָ   Ŀ  
  - Checks: pnpm --dir server test; pnpm --dir front build:client































- **2025-11-12 KidsCoding  ༭           Ӧ ߶ **
  -           Ϊ Զ    ߵ  textarea     ڰ  Enter ʱ   ַ     Ϣ  Shift+Enter  ɻ  У      Ӿ   ԭ  ʽһ ¡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding            ޸ **
  - textarea  ߶ ͬ   ߼    ڸ      ߶  Զ  л  overflow   ÿ     ʱ   ع            160px ʱ    ʾ           ݡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding assistant  ظ   ʾȥ  **
  -     ʵ   SimpleChatBubble  ֻչʾ  ʵ ظ    ݣ    ٸ  ӡ  ظ   /˼   С   ռλ İ   ȷ   AI ֱ      𸴡 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding   ̬  Ϣ ַ    ޸ **
  -      `AssistantChatPanel`  е Ĭ    ʾ  ռλ   Ͱ ť İ    뵼 µ      󣬻ָ              Vite HMR      ¼  ظ      
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding Python    л       **
  - `front/.env.local`      `VITE_RUNNER_API_BASE=http://localhost:8302`    ǰ ˰  `/api/run`     ֱ ӷ    뱾   server   ͬ Ķ˿ڣ     Ĭ   8000 δ    ʱ     `Failed to fetch`  
  - Checks: pnpm --dir front build:client
- **2025-11-12 KidsCoding     ָ̨ʾ      **
  -      ResizableConsole       ״̬ ƣ idle ʱϨ     к  Ŷ /ִ  /          ״̬    򲥷Ŷ                 ⶨ    ɫ/  ͸   ȡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding     ָ̨ʾ    ɫ    **
  -  Ż     ̨   ŵ    idle ״̬ µĵ ɫ    Ӱ    ɫģʽ    ƫ  ҡ ǳɫģʽ          ң    ٳ  ַ  ̻       ⡣
- **2025-11-12 KidsCoding     ̨״̬ɫ     **
  -         light ģʽ   queued/running/succeeded  ĵƹ   ɫ     ø߶Աȵ     /    /  췽    ȷ      ״̬ ڰ       Ҳ ܱ    塣
- **2025-11-12 KidsCoding     ̨ ƹ Ա   ǿ**
  -           ״̬ µĵ     ɫʹ û   ɫ     ٲ  ù          active ɫ    ֤ǳɫ    Ҳ ܿ       ָʾ ơ 
- **2025-11-12 KidsCoding     ̨  ɫ Ʒ   **
  -      Light Theme   ɫ   飬    ָ   idle/queued/running/success/failure     ɫ  ׼  ɫ  ȷ     ⻷  Ҳ          ״̬  
- **2025-11-12 KidsCoding     ̨  Ч ع **
  -        µ ǳɫ      ɫ    ʵ    ״̬  ɫ 붯    idle       running       queued  е       success           failure ˫    ʾ  ͬʱ      ɫģʽ   ֡ 
  - Checks: pnpm --dir front build:client
- **2025-11-12 KidsCoding   Ч ữ    **
  -     ǳɫ     ״̬ɫ   ع         ůɫ             Success/Failure     ֻ    һ κ󱣳־ ֹ         ɻ         ɫ̫         ⡣
  - Checks: pnpm --dir front build:client
- **2025-11-12 KidsCoding   ɫ    **
  -   ǳɫ       running/queued/success/failure/idle       ɫ              ⳡ   Ŀɶ  ԣ   ɫģʽ   ֲ  䡣
  - Checks: pnpm --dir front build:client
- **2025-11-12     ׼    env + docker build  **
  -      `server/.env.production`  `python-runner/.env`  `front/.env.production`   Ϊ           壬      д  ʵƾ֤  
  -     ִ   `docker compose build`       δ     Docker Desktop   Ҳ    `dockerDesktopLinuxEngine`  ܵ              Docker      ԡ 
- **2025-11-12 Docker    񹹽  ɹ **
  -  ֶ   ȡ `node:20-bullseye`    `node:20-bullseye-slim`       `server/pnpm-lock.yaml`    `python-runner/pnpm-lock.yaml`       `docker compose build`  ɹ      `kids-coding-server`  `kids-coding-runner`     
  - Checks: docker compose build
- **2025-11-12 Docker             **
  -      ¾   ִ   `docker compose up -d`  server   ¶ `8000`  ˿ڣ runner    以ͨ        ־  ʾ     `POST /api/runner/jobs/claim`         
  - Checks: docker compose up -d
- **2025-11-12 ǰ               Docker**
  -      `front/.env.production` ָ   `http://localhost:8000`    ʹ   `pnpm --dir front build:client --mode production`    ɾ ̬  Դ  ׼  ͨ     ⾲̬      ָ   Docker API  
  - Checks: pnpm --dir front build:client --mode production
- **2025-11-12 Python Runner ֧   pygame**
  - python-runner       װ python3-pygame               ɹ ͨ   /api/run      pygame    롣
- **2025-11-12 һ       ű **
  -      `start-prod.bat`   Զ ִ  ǰ            `docker compose up -d`     ڶ    PowerShell          `npx serve front/dist/static --listen 4173 --single`  
- **2025-11-12 KidsCoding    ӻ ͨ     ׶ A  **
  - python-runner      `kids_capture` helper    visualization bridge  pygame Surface      Ϊ RGB ֡  ͨ   runner  ¼        server  server/jobStream ֧   µ  `visualization`  ¼   ǰ       `VisualizationViewer`  ڶ         ResultPanel   ʵʱ  Ⱦ֡  
  - Checks: pnpm --dir python-runner build; pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding    ӻ        **
  - VisualizationViewer           䱳  +Բ    ߣ     ǳɫ       Զ  л  ߿ /  Ӱ  ͻ     ӻ          ռ   ݡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-12 KidsCoding    ӻ        **
  -      VisualizationViewer       һȦϸ ߿  Ƴ      ࣬ Ӿ         ա 
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-12 KidsCoding    ӻ   Ӱȥ  **
  -  Ƴ  VisualizationViewer  ߿  ·   ͶӰֱ ǣ           Ա   Ӳ    Ӱ  
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-12 KidsCoding       ҳ  ںϲ **
  -  Ƴ  Ҳࡰ ȺƱ    ҳ    ť        ෿  ͼ    ת   /kids-coding       ظ   ڡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-12 KidsCoding     ̨  ʾ ü **
  - ȥ   ResizableConsole     ״̬  ʾ İ           ť/ָʾ ƣ            Ϣ  ѹ   Ⲽ ֡ 
  - Checks: pnpm --dir server test; pnpm --dir front build:client





- **2025-11-14 KidsCoding vocabulary hover cards**
  - Added centralized vocabulary metadata and hover cards for SpeakableWord terms.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocabulary card layout fix**
  - Fixed hover card width measurement + vertical card layout to keep image on top and description below.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocab card alignment**
  - Portaled vocabulary cards into mission panel, centering 90% width under hovered word without sidebar overflow.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocab card width lock**
  - Passed mission panel ref into SpeakableWord so hover cards render via portal at 90% panel width and stay centered under the word.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocab card width CSS**
  - Simplified SpeakableWord overlay to use pure CSS width=90% of mission panel, ensuring hover card stays centered without scrollbar overlap.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocab card scroll sync**
  - Hooked SpeakableWord back into panel scroll/resize events so hover cards reposition with highlighted words while keeping 90% width.
  - Checks: pnpm --dir server test; pnpm --dir front build:client


- **2025-11-14 KidsCoding vocab card horizontal center**
  - Compute dynamic left offset based on mission panel width so 90% hover cards truly center and no longer overlap the scrollbar.
  - Checks: pnpm --dir server test; pnpm --dir front build:client
- **2025-11-16 KidsCoding 文件卡片样式+重命名体验**
  - FileListPanel 卡片缩短为 `py-1.5`，整体比例更紧凑；重命名时显示完整文件名并默认选中 `.扩展名` 前部分，学生如需可修改后缀。
  - FileSidebar 重命名输入改为使用完整文件名，新建文件/文件夹后自动切回文件视图进入编辑；`useProjectFiles` 允许输入自定义扩展名（仅在缺省时补齐）。
  - Checks: pnpm --dir server test, pnpm --dir front build:client

- **2025-11-16 KidsCoding 文件重命名修复**
  - 新建 Python 文件时强制切回文件视图并立即进入重命名；编辑框只显示 `.py` 之前的部分并锁定扩展名，避免误改后缀。
  - Checks: pnpm --dir server test, pnpm --dir front build:client

- **2025-11-16 KidsCoding 文件卡片全圆角贴合**
  - FileListPanel 改回所有条目均为圆角卡片，并保留共享边框/无间距效果，实现既贴合又有圆角的视觉。
  - Checks: pnpm --dir server test, pnpm --dir front build:client

- **2025-11-16 KidsCoding 文件卡片贴合边界**
  - FileListPanel 去掉文件卡片之间的默认间距，改成首尾圆角+共享边框，让上下条目紧贴但仍有清晰分界线。
  - Checks: pnpm --dir server test, pnpm --dir front build:client
- **2025-11-16 KidsCoding 标签圆角统一**
  - CodeWorkspace 标签按钮的圆角改为 rounded-t-3xl，与标签栏的弧度一致，视觉过渡更自然。
  - Checks: pnpm --dir server test, pnpm --dir front build:client
- **2025-11-16 KidsCoding 多文件运行升级**
  - 前端：FileEntry 增加 path，新增 `buildRunJobPayload` 构建 RunJobDTO，`useRunJob`/API 全面改为提交 `files + entryPath`，CodeWorkspace/页层整合运行按钮；限制 20 个文件、单文件 100KB 并校验路径。
  - 服务端 & Runner：RunJobDTO 校验/存储、Runner 在临时目录写入所有 `.py` 并以 entryPath 执行，禁用旧 `code` 字段；新增 docs/run-multi-file.md 记录协议与限制。
  - Checks: pnpm --dir server test, pnpm --dir front build:client

- **2025-11-17 KidsCoding 文件列表重命名与卡片层级**
  - FileSidebar 引入 pending rename 机制，先等待新建条目写入列表再进入编辑，彻底修复偶发的默认改名失效。
  - FileListPanel 去掉重叠描边，改用极窄间距 + 选中底色高亮，并抬升选中/编辑条目的 z-index，避免卡片互相遮挡。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-17 KidsCoding 文件重命名队列 + 选中色彩**
  - FileSidebar 将单个 pending id 替换为队列，支持连续创建多条目时依次进入改名，不再出现“第二个无法改名”的回归。
  - FileListPanel 调整默认/选中/编辑底色，对浅色模式使用更亮的琥珀背景，深色模式强化蓝色叠加，保证选中状态一眼可见。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-17 KidsCoding 新建立即改名 + 颜色适配**
  - FileSidebar 在创建时立刻进入编辑态，并保留队列兜底，确保无论点击多少次“新建”都能触发改名。
  - FileListPanel 取消黄底，浅色模式改用高亮蓝色、深色模式改用青蓝色叠加，提升与整体主题的适配和可见度。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-17 KidsCoding 改名重试机制 + 蓝色选中**
  - FileSidebar 将 pending rename 改成 requestAnimationFrame 重试，最多尝试 ~200ms，彻底消除“第二次不进入改名”的竞争条件。
  - FileListPanel 扩大选中色块对比：浅色主题使用半透明蓝色、深色主题使用亮青色，保留紧凑布局同时保证状态清晰。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-17 KidsCoding useRenameWorkflow**
  - 新增 hooks/useRenameWorkflow，将改名状态与队列封装成可复用逻辑，通过文件列表渲染完成后再激活输入，杜绝“新建多次只有第一次能改名”的竞态。
  - FileSidebar 接入新 Hook，所有入口（双击、工具栏创建、删除后重建）统一走队列，组件本身仅负责 UI，逻辑更清晰。
  - Checks: pnpm --dir server test; pnpm --dir front build:client

- **2025-11-17 KidsCoding 文件新增自动改名兜底**
  - FileSidebar 通过 knownEntryIds + pending 队列比对新旧文件列表，只要检测到新条目就触发改名，彻底规避 useProjectFiles 同步返回失败导致默认改名只执行一次的问题。
  - 新建文件/文件夹统一先入队，再等待渲染后解队，确保 UI 先呈现再聚焦；失败时仅打印错误，不再打断后续逻辑。
  - Checks: pnpm --dir server test; pnpm --dir front build:client
